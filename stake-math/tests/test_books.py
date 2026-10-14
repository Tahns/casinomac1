"""Format des books / lookup / index.json et cohérence des événements (<= 1000 books par mode, 200 ici)."""
import contextlib
import io
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402,F401
import cap  # noqa: E402
import game_calculations as G  # noqa: E402
import game_config as C  # noqa: E402
import run  # noqa: E402
import verify  # noqa: E402

N = 200
_cache = {}


def quiet_run(args):
    with contextlib.redirect_stdout(io.StringIO()):
        return run.main(args)


def lib(step):
    """Génère (une fois) une bibliothèque de N books par mode dans un dossier temporaire."""
    if step not in _cache:
        tmp = tempfile.mkdtemp(prefix="anubis_lib_")
        rc = quiet_run(["--books", str(N), "--out", tmp, "--step", str(step), "--seed", "7"])
        _cache[step] = (tmp, rc)
    return _cache[step]


def read_lines(path):
    with open(path, encoding="utf-8") as f:
        return f.read().splitlines()


def read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_books(tmp, mode):
    return [json.loads(l) for l in read_lines(os.path.join(tmp, "books", "books_%s.jsonl" % mode))]


class TestPlafondDeTours(unittest.TestCase):
    def test_cap(self):
        old = {k: os.environ.pop(k, None) for k in ("HOA_BIG", "ANUBIS_BIG")}
        try:
            self.assertEqual(cap.cap(5000), 1000)
            self.assertEqual(cap.cap(10 ** 7), 1000)
            self.assertEqual(cap.cap(200), 200)
            os.environ["HOA_BIG"] = "1"
            self.assertEqual(cap.cap(5000), 5000)    # seul l'utilisateur pose cette variable
        finally:
            os.environ.pop("HOA_BIG", None)
            for k, v in old.items():
                if v is not None:
                    os.environ[k] = v

    def test_run_plafonne_a_1000_books(self):
        if os.environ.get("HOA_BIG") == "1" or os.environ.get("ANUBIS_BIG") == "1":
            self.skipTest("plafond levé dans l'environnement")
        with tempfile.TemporaryDirectory() as tmp:
            quiet_run(["--books", "5000", "--modes", "std", "--out", tmp])
            self.assertEqual(len(load_books(tmp, "std")), 1000)


class TestFormat(unittest.TestCase):
    def test_conforme_au_verificateur(self):
        for step in (10, 1):
            tmp, rc = lib(step)
            self.assertEqual(rc, 0)
            self.assertEqual(verify.verify_library(os.path.join(tmp, "publish_files"), payout_step=step), [])

    def test_sans_arrondi_payouts_multiples_de_10(self):
        # pas 1 (défaut) : le payout est le total EXACT, et il est déjà un multiple de 10 pour tous les modes
        tmp, _ = lib(1)
        for mode in C.MODE_ORDER:
            for b in load_books(tmp, mode):
                self.assertEqual(b["payoutMultiplier"] % 10, 0)
                self.assertEqual(b["events"][-1]["exact"], b["payoutMultiplier"])

    def test_index_json_forme_stricte(self):
        tmp, _ = lib(10)
        idx = read_json(os.path.join(tmp, "publish_files", "index.json"))
        self.assertEqual(list(idx), ["modes"])
        self.assertEqual([m["name"] for m in idx["modes"]], C.MODE_ORDER)
        for m in idx["modes"]:
            self.assertEqual(sorted(m), ["cost", "events", "name", "weights"])
            self.assertTrue(m["events"].startswith("books_%s.jsonl" % m["name"]))
            self.assertEqual(m["weights"], "lookUpTable_%s_0.csv" % m["name"])
        self.assertEqual([m["cost"] for m in idx["modes"]], [1.0, 1.1, 9.26, 10.31, 12.37, 27.3])

    def test_lookup_trois_entiers_non_signes(self):
        tmp, _ = lib(10)
        for mode in C.MODE_ORDER:
            rows = [l.strip().split(",") for l in read_lines(os.path.join(tmp, "lookup_tables", "lookUpTable_%s.csv" % mode))]
            self.assertEqual(len(rows), N)
            for i, r in enumerate(rows):
                self.assertEqual(len(r), 3)
                self.assertTrue(all(x.isdigit() for x in r))
                self.assertEqual(int(r[0]), i + 1)
                self.assertEqual(int(r[1]), 1)
                self.assertEqual(int(r[2]) % 10, 0)

    def test_payout_du_book_egal_a_la_lookup(self):
        tmp, _ = lib(10)
        for mode in C.MODE_ORDER:
            books = load_books(tmp, mode)
            rows = [int(l.split(",")[2]) for l in read_lines(os.path.join(tmp, "lookup_tables", "lookUpTable_%s.csv" % mode))]
            self.assertEqual([b["payoutMultiplier"] for b in books], rows)
            for b in books:
                self.assertEqual(sorted(k for k in b if k in ("id", "events", "payoutMultiplier")), ["events", "id", "payoutMultiplier"])

    def test_math_config_pour_l_optimiseur(self):
        tmp, _ = lib(10)
        cfg = read_json(os.path.join(tmp, "configs", "math_config.json"))
        self.assertEqual([b["bet_mode"] for b in cfg["bet_modes"]], C.MODE_ORDER)
        for fe in cfg["fences"]:
            self.assertEqual(fe["fences"][0]["name"], "wincap")
            self.assertEqual(fe["fences"][0]["identity_condition"]["win_range_start"], 25000)
        # les fences de recherche (« bonus = yes ») retrouvent des books dans force_record
        rec = read_json(os.path.join(tmp, "forces", "force_record_std.json"))
        self.assertTrue(any(s["name"] == "bonus" and s["value"] == "yes" for r in rec for s in r["search"]))

    def test_reproductible(self):
        a = tempfile.mkdtemp(prefix="anubis_a_")
        b = tempfile.mkdtemp(prefix="anubis_b_")
        quiet_run(["--books", "30", "--modes", "std,buy_fury", "--out", a, "--seed", "99"])
        quiet_run(["--books", "30", "--modes", "std,buy_fury", "--out", b, "--seed", "99"])
        for mode in ("std", "buy_fury"):
            self.assertEqual(load_books(a, mode), load_books(b, mode))

    def test_criteres_respectes(self):
        tmp, _ = lib(10)
        for mode in C.MODE_ORDER:
            for bk in load_books(tmp, mode):
                crit, pm = bk["criteria"], bk["payoutMultiplier"]
                self.assertIn(crit, ("wincap", "0", "bonus", "basegame"))
                if crit == "wincap":
                    self.assertEqual(pm, C.WINCAP_INT)
                elif crit == "0":
                    self.assertEqual(pm, 0)
                else:
                    self.assertGreater(pm, 0)
            self.assertTrue(any(b["criteria"] == "wincap" for b in load_books(tmp, mode)), mode)


class TestEvenements(unittest.TestCase):
    """Chaque book est auto-cohérent : un front qui ne fait que rejouer les événements retrouve exactement le gain."""

    def setUp(self):
        self.tmp, _ = lib(1)

    def split_bonus(self, ev):
        out, cur = [], None
        for e in ev:
            if e["type"] == "bonusStart":
                cur = {"start": e, "ev": []}
                out.append(cur)
            elif cur is not None and e["type"] == "bonusEnd":
                cur["end"] = e
                cur = None
            elif cur is not None:
                cur["ev"].append(e)
        return out

    def test_gain_final_somme_des_tours(self):
        for mode in C.MODE_ORDER:
            for b in load_books(self.tmp, mode):
                ev = b["events"]
                self.assertEqual([e["seq"] for e in ev], list(range(len(ev))))
                wins = [e["win"] for e in ev if e["type"] == "spinWin"]
                fin = ev[-1]
                self.assertEqual(min(sum(wins), C.WINCAP_INT), fin["amount"])
                self.assertEqual(fin["amount"], b["payoutMultiplier"])
                self.assertEqual(fin["exact"], b["payoutMultiplier"])   # pas de 1 : exact
                if mode in C.BUY_KIND_OF:
                    self.assertEqual(sum(1 for e in ev if e["type"] == "bonusStart"), 1)
                    self.assertFalse(any(e["type"] == "wheelStop" for e in ev))

    def test_roue_et_oracle(self):
        for mode in ("std", "plus"):
            for b in load_books(self.tmp, mode):
                ev = b["events"]
                stops = [e for e in ev if e["type"] == "wheelStop"]
                self.assertLessEqual(len(stops), C.MAX_CHAIN + 1)
                for e in stops:
                    self.assertEqual(C.LAYOUT[e["index"]], e["kind"])
                self.assertTrue(all(not s["respin"] for s in stops[-1:]), "le dernier arrêt n'est jamais une relance")
                for o in [e for e in ev if e["type"] == "oracle"]:
                    self.assertTrue(o["sealed"])
                    self.assertEqual(o["revealOn"], "wheelStop")
                    # la valeur scellée est avant l'arrêt de la roue du même tour
                    nxt = [e for e in ev if e["type"] == "wheelStop" and e["spin"] == o["spin"]][0]
                    self.assertLess(o["seq"], nxt["seq"])

    def test_pesee_deux_issues_un_gain(self):
        seen = 0
        for mode in ("buy_weigh", "std", "buy_scarab", "buy_fury"):
            for b in load_books(self.tmp, mode):
                for e in b["events"]:
                    if e["type"] != "weighReveal":
                        continue
                    seen += 1
                    self.assertEqual(len(e["variants"]), 2)
                    for q, v in enumerate(e["variants"]):          # plume (0) et coeur (1) : même valeur du joueur, même gain
                        self.assertEqual(v["pick"], q)
                        self.assertEqual(v["mults"][q], v["playerMult"])
                        self.assertEqual(v["playerWins"], v["heavy"] == q)
                        self.assertEqual(v["win"], e["win"])
                        self.assertEqual(e["win"], v["mults"][q] if v["heavy"] == q else 0)
        self.assertGreater(seen, 20)

    def test_tresor(self):
        seen = 0
        for mode in ("buy_vault", "std"):
            for bk in load_books(self.tmp, mode):
                for bn in self.split_bonus(bk["events"]):
                    if bn["start"]["bonus"] != "vault":
                        continue
                    seen += 1
                    picks = [e for e in bn["ev"] if e["type"] == "vaultPick"]
                    end = [e for e in bn["ev"] if e["type"] == "vaultEnd"][0]
                    self.assertTrue(all(p["token"] != "seal" for p in picks[:2]), "jamais de sceau sur les deux premiers coffres")
                    self.assertLessEqual(len(picks), C.VAULT_PICK_CAP)
                    if end["ended"] == "seal":
                        self.assertEqual(picks[-1]["token"], "seal")
                        self.assertEqual(end["win"], picks[-1]["runningTotal"])
                    else:
                        self.assertEqual(end["finishBonus"], C.VAULT_FINISH_INT)
                        self.assertEqual(end["win"], picks[-1]["runningTotal"] + C.VAULT_FINISH_INT)
                    # rejeu des jetons
                    tot, allowed = 0, C.VAULT_BASE_PICKS
                    for p in picks:
                        t = p["token"]
                        if t == "seal":
                            break
                        if t == "key":
                            allowed = min(C.VAULT_PICK_CAP, allowed + C.VAULT_KEY_PICKS)
                        elif t == "scepter":
                            tot *= 2
                        else:
                            tot += t
                        self.assertEqual(p["runningTotal"], tot)
                        self.assertEqual(p["chestsLeft"], allowed - p["pick"])
        self.assertGreater(seen, 20)

    def test_fureur_une_seule_couleur_et_gain_rejoue(self):
        seen = 0
        for mode in ("buy_fury", "std", "buy_scarab"):
            for bk in load_books(self.tmp, mode):
                for bn in self.split_bonus(bk["events"]):
                    if bn["start"]["bonus"] != "hand":
                        continue
                    seen += 1
                    allev = bn["ev"]
                    ends = [e for e in allev if e["type"] == "furyEnd"]
                    self.assertEqual([e["color"] for e in ends], [0, 1, 2])             # trois variantes de couleur, même total
                    self.assertEqual(len({e["win"] for e in ends}), 1)
                    ev = [e for e in allev if e.get("color", 0) == 0]
                    spins = [e for e in ev if e["type"] == "furySpin"]
                    self.assertTrue(spins[-1]["final"] and not any(s["final"] for s in spins[:-1]))
                    mult = 1
                    for s in spins[:-1]:
                        self.assertEqual(s["kind"], "up")
                        self.assertEqual(C.HAND_SEGS[s["segment"]]["d"], 0)
                        mult *= 2
                        self.assertEqual(s["tier"], mult)
                    last = spins[-1]
                    self.assertEqual(last["tier"], mult)
                    if last["kind"] == "num":
                        pay = last["number"] * mult
                    elif last["kind"] == "wrong":
                        self.assertNotEqual(C.HAND_SEGS[last["segment"]]["d"], 0)
                        pay = C.HAND_MIN_N_INT * mult
                    else:
                        inner = [e for e in ev if e.get("nested") == last["band"] and e["type"] in ("scarabDrop", "weighReveal", "vaultEnd")]
                        key = {"scarab": None, "weigh": "win", "vault": "win"}[last["band"]]
                        base = sum(e["win"] for e in inner) if last["band"] == "scarab" else inner[-1]["win"]
                        pay = base * last["bandMult"] * mult
                    end = [e for e in ev if e["type"] == "furyEnd"][0]
                    self.assertEqual(end["win"], min(pay, C.WINCAP_INT))
                    self.assertLessEqual(len(spins) - 1, C.HAND_MAX_CHAIN)
        self.assertGreater(seen, 20)

    def test_scarabees(self):
        seen = 0
        for bk in load_books(self.tmp, "buy_scarab"):
            for bn in self.split_bonus(bk["events"]):
                if bn["start"]["bonus"] != "scarab":
                    continue
                drops = [e for e in bn["ev"] if e["type"] == "scarabDrop"]
                self.assertEqual(len(drops), C.SCARAB_BALLS)
                for d in drops:
                    self.assertEqual(len(d["path"]), C.SCARAB_ROWS)
                    self.assertEqual(sum(d["path"]), d["slot"])
                    self.assertEqual(d["win"], C.SCARAB_INT["std"][d["slot"]])
                self.assertEqual(sum(d["win"] for d in drops), bn["end"]["win"])
                seen += 1
        self.assertGreater(seen, 20)

    def test_sanctuaire_rejoue(self):
        # le Sanctuaire est rare (1 bonus sur 25 sur la roue) : on le force avec des tirages imposés, puis on rejoue l'événement
        from rng import ScriptedRng
        import game_events as E
        import force
        for k in range(1, 40):
            rng = ScriptedRng([0.9999, force.u_index(C.LAYOUT.index("vault"), C.N), 0.01] + [(k * 37 % 97) / 97.0] * 40, strict=False, fallback_seed=k)
            r = G.play_mode(rng, "std")
            if not r["spins"][-1]["secret"]:
                continue
            ev = E.book_events(r, r["total"])
            tabs = [e for e in ev if e["type"] == "sanctuaryTablet"]
            self.assertEqual(len(tabs), C.CRYPT_CELLS)
            drops = [{"t": e["tablet_type"], "v": e["value"]} for e in tabs]
            rep = G.crypt_replay(drops)
            end = [e for e in ev if e["type"] == "sanctuaryEnd"][0]
            self.assertEqual(rep["total"], end["win"])
            self.assertEqual(ev[-1]["amount"], r["total"])
            return
        self.fail("aucun Sanctuaire obtenu avec les tirages imposés")


if __name__ == "__main__":
    unittest.main()
