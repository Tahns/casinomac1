"""(b) Parité Python <-> JS : mêmes tirages, mêmes gains, mêmes cases, mêmes détails de bonus.

Les tirages (entiers uint32, valeur = k / 2^32, exacte) ont été produits par js/math.js via tools/export-parity.js (<= 1000 tours/tirages
au total). Le moteur Python rejoue chaque tour avec ScriptedRng strict : il doit (1) retrouver le gain entier du JS, (2) consommer
exactement le même nombre de tirages (aucun de plus, aucun de moins), (3) tomber sur les mêmes cases, boosts et bonus.
Un test supplémentaire relance Node (s'il est installé) avec une AUTRE graine, pour que le fichier versionné ne puisse pas masquer une dérive.
"""
import os
import shutil
import subprocess
import tempfile
import unittest

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402
import game_calculations as G
import game_config as C
from rng import ScriptedRng, mulberry32

PAR = common.load_parity()


def spin_sig(s):
    bk = s["bonus_kind"] if s["bonus"] is not None else None
    return [s["kind"], s["index"], s["boost"], s["pay"], bk]


class TestParity(unittest.TestCase):
    def check_rounds(self, doc):
        n = 0
        for mode, block in doc["modes"].items():
            self.assertEqual(float(block["cost"]), float(C.GameConfig().mode_cost(mode)), mode)
            for k, rd in enumerate(block["rounds"]):
                rng = ScriptedRng(rd["d"], ints=True, strict=True)
                r = G.play_mode(rng, mode)
                where = "%s tour %d" % (mode, k)
                self.assertEqual(r["total"], rd["total"], where)
                self.assertEqual(rng.consumed, len(rd["d"]), where + " : nombre de tirages consommés")
                self.assertEqual(bool(r["capped"]), rd["capped"], where)
                self.assertEqual([spin_sig(s) for s in r["spins"]], [list(x) for x in rd["spins"]], where)
                n += 1
        return n

    def test_layout_identique(self):
        self.assertEqual(C.LAYOUT, PAR["layout"])
        self.assertEqual(C.SCALE, PAR["scale"])
        self.assertEqual(C.WINCAP, PAR["max_win"])

    def test_tours_des_dix_modes(self):
        self.assertEqual(sorted(PAR["modes"]), sorted(C.MODE_ORDER))
        n = self.check_rounds(PAR)
        self.assertGreaterEqual(n, 500)
        self.assertLessEqual(n, 1000)

    def test_colere_d_anubis(self):
        # tours forcés en Colère par le JS (premier tirage = 0) : mêmes gains, cases, multiplicateurs et tirages consommés
        n, ups = 0, 0
        for mode, rounds in PAR["wrath"].items():
            for k, rd in enumerate(rounds):
                rng = ScriptedRng(rd["d"], ints=True, strict=True)
                r = G.play_round(rng, mode)
                where = "Colère %s tour %d" % (mode, k)
                self.assertEqual(r["total"], rd["total"], where)
                self.assertEqual(rng.consumed, len(rd["d"]), where)
                self.assertEqual([spin_sig(s) for s in r["spins"]], [list(x) for x in rd["spins"]], where)
                self.assertEqual([r["wrath"]["start"], r["wrath"]["level"]], rd["wrath"], where)
                self.assertTrue(all(C.LAYOUT[s["index"]] in C.WRATH_KINDS for s in r["spins"]), where)
                ups += sum(1 for s in r["spins"] if s["wrath_up"])
                n += 1
        self.assertEqual(sorted(PAR["wrath"]), sorted(C.BASE_MODES))
        self.assertGreaterEqual(n, 40)
        self.assertGreater(ups, 0)

    def test_tous_types_de_cases_et_bonus_couverts(self):
        kinds, bonuses = set(), set()
        for block in PAR["modes"].values():
            for rd in block["rounds"]:
                for sp in rd["spins"]:
                    kinds.add(sp[0])
                    if sp[4]:
                        bonuses.add(sp[4])
        self.assertTrue({"scarab", "weigh", "vault", "hand"} <= bonuses, bonuses)
        self.assertGreaterEqual(len(kinds), 6, kinds)

    def run_bonus(self, name, fn):
        for k, rec in enumerate(PAR["bonuses"][name]):
            rng = ScriptedRng(rec["d"], ints=True, strict=True)
            b = fn(rng, rec)
            where = "%s #%d" % (name, k)
            self.assertEqual(b["total"], rec["total"], where)
            self.assertEqual(rng.consumed, len(rec["d"]), where + " : tirages consommés")
            yield b, rec

    def test_scarabees(self):
        for b, rec in self.run_bonus("scarab", lambda rng, rec: G.scarab(rng, "std")):
            self.assertEqual([x["slot"] for x in b["balls"]], rec["detail"])

    def test_pesee(self):
        for b, rec in self.run_bonus("weigh", lambda rng, rec: G.weigh(rng, "std")):
            self.assertEqual([b["mults"][0], b["mults"][1], b["heavy"], b["pick"]], rec["detail"])

    def test_tresor(self):
        for b, rec in self.run_bonus("vault", lambda rng, rec: G.vault(rng, "std")):
            self.assertEqual([p["token"] for p in b["picks"]] + [b["ended"]], rec["detail"])

    def test_fureur_trois_couleurs(self):
        for b, rec in self.run_bonus("hand", lambda rng, rec: G.hand(rng, rec["colour"])):
            self.assertEqual([[s["idx"], s["kind"], s["mult"]] for s in b["spins"]], rec["detail"])

    def test_bonus_des_pactes(self):
        # profils Prudent (Scribe) et Audacieux (Chacal) ; Fureur : les bandes imbriquées jouent le profil du pacte
        n = 0
        for pf in ("safe", "bold"):
            for b, rec in self.run_bonus("scarab_" + pf, lambda rng, rec, pf=pf: G.scarab(rng, pf)):
                self.assertEqual([x["slot"] for x in b["balls"]], rec["detail"])
                n += 1
            for b, rec in self.run_bonus("weigh_" + pf, lambda rng, rec, pf=pf: G.weigh(rng, pf)):
                self.assertEqual([b["mults"][0], b["mults"][1], b["heavy"], b["pick"]], rec["detail"])
                n += 1
            for b, rec in self.run_bonus("vault_" + pf, lambda rng, rec, pf=pf: G.vault(rng, pf)):
                self.assertEqual([p["token"] for p in b["picks"]] + [b["ended"]], rec["detail"])
                n += 1
            bands = 0
            for b, rec in self.run_bonus("hand_" + pf, lambda rng, rec, pf=pf: G.hand(rng, rec["colour"], rec["forced"], pf)):
                self.assertEqual([[s["idx"], s["kind"], s["mult"]] for s in b["spins"]], rec["detail"])
                bands += b["spins"][-1]["kind"] == "band"
                n += 1
            self.assertGreater(bands, 0, pf)
        self.assertGreaterEqual(n, 40)

    def test_fureur_chaines_imposees_et_plafond(self):
        capped = 0
        for b, rec in self.run_bonus("hand_forced", lambda rng, rec: G.hand(rng, 0, rec["forced"])):
            self.assertEqual([[s["idx"], s["kind"], s["mult"]] for s in b["spins"]], rec["detail"])
            capped += b["total"] == C.WINCAP_INT
        # (le plafond lui-même est couvert par test_gain_maximal_meme_chemin_dans_les_deux_langages)

    def test_sanctuaire(self):
        for b, rec in self.run_bonus("crypt", lambda rng, rec: G.crypt(rng)):
            self.assertEqual([[d["t"], d["v"]] for d in b["drops"]], rec["detail"])
            self.assertEqual(bool(b["capped"]), rec["capped"])

    def test_sanctuaire_scripts_imposes_et_plafond(self):
        seen_cap = False
        for b, rec in self.run_bonus("crypt_forced", lambda rng, rec: G.crypt(rng, [{"t": t, "v": v} for t, v in rec["forced"]])):
            self.assertEqual([[d["t"], d["v"]] for d in b["drops"]], rec["detail"])
            self.assertEqual(bool(b["capped"]), rec["capped"])
            seen_cap = seen_cap or b["capped"]
        self.assertTrue(seen_cap, "un script doit dépasser le plafond")
        floor = [r for r in PAR["bonuses"]["crypt_forced"] if all(t == "dust" for t, _ in r["forced"])][0]
        self.assertEqual(floor["total"], 100, "sans tablette : plancher x1 = 100")

    def test_gain_maximal_meme_chemin_dans_les_deux_langages(self):
        import force
        self.assertEqual(sorted(PAR["wincap"]), sorted(C.MODE_ORDER))
        for mode, rec in PAR["wincap"].items():
            self.assertEqual(rec["total"], C.WINCAP_INT, "JS : " + mode)
            # le script du JS (construit indépendamment) rejoué par le moteur Python
            rng = ScriptedRng(rec["script"], strict=True)
            r = G.play_mode(rng, mode)
            self.assertEqual(r["total"], C.WINCAP_INT, "Python rejoue le script JS : " + mode)
            self.assertEqual(rng.consumed, len(rec["script"]), mode)
            # et le script de stake-math/force.py est le même, valeur par valeur
            mine = force.wincap_script(mode)
            self.assertEqual(len(mine), len(rec["script"]), mode)
            for a, b in zip(mine, rec["script"]):
                self.assertAlmostEqual(a, b, places=12, msg=mode)
            r2 = G.play_mode(force.wincap_rng(mode), mode)
            self.assertEqual(r2["total"], C.WINCAP_INT, mode)

    def test_rejouer_avec_une_autre_graine_via_node(self):
        node = shutil.which("node")
        script = os.path.join(common.REPO, "tools", "export-parity.js")
        if not node or not os.path.exists(script):
            self.skipTest("Node indisponible")
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "p.json")
            # 10 x 25 tours + Colère 6 x 5 + 5 x 12 tirages + pactes 8 x 4 + cas imposés : très en dessous de 1000
            subprocess.run([node, script, "25", "12", "9137", out], check=True, stdout=subprocess.DEVNULL, env={k: v for k, v in os.environ.items() if k not in ("ANUBIS_BIG", "HOA_BIG")})
            doc = common.load_parity(out)
            self.assertLess(self.check_rounds(doc), 1000)


class TestRng(unittest.TestCase):
    def test_mulberry32_identique_au_js(self):
        # 4 premiers tirages de AnubisMath.mulberry32(2026), relevés dans Node
        r = mulberry32(2026)
        got = [r() for _ in range(4)]
        want = [0.45540769933722913, 0.30849614599719644, 0.6611574492417276, 0.6184752183035016]
        self.assertEqual(got, want)

    def test_script_strict(self):
        r = ScriptedRng([0, 1 << 31], ints=True, strict=True)
        self.assertEqual(r(), 0.0)
        self.assertEqual(r(), 0.5)
        with self.assertRaises(IndexError):
            r()


if __name__ == "__main__":
    unittest.main()
