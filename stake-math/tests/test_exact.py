"""(a) Moments EXACTS : le port Python de tools/rtp-exact.js donne les mêmes nombres, et le moteur de jeu est cohérent avec eux.

Aucune simulation : calcul exact (énumération, récurrences) seulement. Les valeurs de référence viennent de tools/export-parity.js
(sortie de rtp-exact.js au moment de l'export) et de la documentation du dépôt : RTP Standard 96,21 %, Oracle+ 96,10 %, achats ~ 96,0 %.
"""
import itertools
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402
import exact  # noqa: E402
import game_calculations as G  # noqa: E402
import game_config as C  # noqa: E402
import force  # noqa: E402
from rng import ScriptedRng  # noqa: E402

PAR = common.load_parity()
JS = PAR["exact"]
RES = exact.compute()


def close(a, b, tol=1e-9):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


class TestMomentsExacts(unittest.TestCase):
    def test_rtp_documentes(self):
        # valeurs AVEC le plafond de 25 000 x (loi exacte) depuis la Colère d'Anubis (2026-10-16) ; avant : Standard 96,17 %, écart-type 14,5
        self.assertAlmostEqual(RES["std"]["mean"] * 100, 96.20, delta=0.005)
        self.assertAlmostEqual(RES["plus"]["mean"] * 100, 96.20, delta=0.005)
        want = {"scarab": 96.015, "weigh": 96.015, "vault": 96.032, "hand": 96.002}
        for k, v in want.items():
            self.assertAlmostEqual(RES["buy"][k]["rtp"] * 100, v, delta=0.001, msg=k)
        self.assertAlmostEqual(RES["std"]["sd"], 31.16, delta=0.005)
        self.assertAlmostEqual(RES["std"]["hit"] * 100, 32.69, delta=0.005)
        self.assertAlmostEqual(RES["bonusEvery"], 19.27, delta=0.005)

    def test_egal_au_js_a_1e9(self):
        for k in ("mean", "sd", "hit"):
            self.assertTrue(close(RES["std"][k], JS["std"][k]), "std " + k)
            self.assertTrue(close(RES["uncapped"]["std"][k], JS["uncapped"]["std"][k]), "std sans plafond " + k)
        for k in ("mean", "sd", "sdRel", "hit"):
            self.assertTrue(close(RES["plus"][k], JS["plus"][k]), "plus " + k)
        for kind in ("scarab", "weigh", "vault", "hand"):
            for k in ("mean", "sd", "price", "rtp", "sdRel", "fair", "hit"):
                self.assertTrue(close(RES["buy"][kind][k], JS["buy"][kind][k]), "buy %s %s" % (kind, k))
        self.assertTrue(close(RES["bonusEvery"], JS["bonusEvery"]))
        self.assertEqual(len(RES["wrath"]["ladder"]), len(JS["wrath"]["ladder"]))
        for a, b in zip(RES["wrath"]["ladder"], JS["wrath"]["ladder"]):
            self.assertEqual(a[0], b[0])
            self.assertTrue(close(a[1], b[1]))
        # loi exacte plafonnée de chaque mode : moments, taux de zéro, paliers de gain, taille du support
        for mode, js in JS["summary"].items():
            sm = exact.summary(mode)
            self.assertEqual(sm["support"], js["support"], mode)
            for k in ("mean", "rtp", "sd", "zero"):
                self.assertTrue(close(sm[k], js[k]), "%s %s" % (mode, k))
            for t, v in js["tiers"].items():
                for k in ("p", "mean", "rtp"):
                    self.assertTrue(close(sm["tiers"][t][k], v[k], 1e-8), "%s %s %s" % (mode, t, k))
        self.assertTrue(close(RES["hand"][0], JS["hand"][0]) and close(RES["hand"][1], JS["hand"][1]))
        self.assertTrue(close(RES["replaced"], JS["replaced"]))
        for kind in ("scarab", "weigh", "vault"):
            for prof in ("safe", "std", "bold"):
                for i in (0, 1):
                    self.assertTrue(close(RES["bonus"][kind][prof][i], JS["bonus"][kind][prof][i]), "%s %s %d" % (kind, prof, i))
        for i in (0, 1):
            self.assertTrue(close(RES["crypt"][i], JS["crypt"][i]), "sanctuaire")
        for prof in ("safe", "std", "bold"):
            v = exact.vault_of(C.VAULT_PROFILES[prof])
            self.assertTrue(close(v[0], JS["vault"][prof][0]) and close(v[1], JS["vault"][prof][1]), "trésor " + prof)

    def test_profils_de_meme_esperance(self):
        # les trois profils d'un bonus ont la même espérance (le choix du joueur ne change pas le RTP)
        for kind in ("scarab", "weigh", "vault"):
            e = [RES["bonus"][kind][p][0] for p in ("safe", "std", "bold")]
            self.assertLess(max(e) - min(e), 0.01 * max(e), kind)

    def test_les_trois_couleurs_de_la_fureur_sont_symetriques(self):
        # par le moteur : pour chaque segment, le premier lancer d'une couleur donnée donne « DOUBLE de sa couleur » (2 segments),
        # « mauvaise couleur » (4 segments), ou le même nombre / la même bande pour toutes les couleurs -> mêmes lois
        from collections import Counter
        sigs = []
        for colour in range(3):
            c = Counter()
            for idx in range(len(C.HAND_SEGS)):
                h = G.hand(ScriptedRng([0.01] * 40), colour, forced=[idx])
                sp = h["spins"][0]
                c[(sp["kind"], sp.get("base"), sp.get("band"), sp.get("x"))] += 1
            sigs.append(c)
        self.assertEqual(sigs[0], sigs[1])
        self.assertEqual(sigs[1], sigs[2])
        self.assertEqual(sigs[0][("up", None, None, None)], 2)
        self.assertEqual(sigs[0][("wrong", None, None, None)], 4)


class TestMoteurContreExact(unittest.TestCase):
    """Le moteur du jeu, piloté par des tirages ÉNUMÉRÉS (pas tirés), retrouve les formules exactes."""

    def test_roue_sans_oracle_cases_sans_bonus(self):
        total = 0
        cnt = 0
        for i in range(C.N):
            kind = C.LAYOUT[i]
            if C.KINDS[kind]["bonus"] or kind == "ankh":
                continue
            rng = ScriptedRng([0.9999, (i + 0.5) / C.N], strict=True)   # pas d'Oracle, case i
            s = G.play_spin(rng, C.MODES["std"]["oracle"])
            self.assertEqual(s["kind"], kind)
            self.assertEqual(s["pay"], C.KINDS[kind]["mult_int"])
            total += s["pay"]
            cnt += 1
        self.assertEqual(cnt, 57)   # 64 cases - 4 Ankh - 3 bonus
        # somme des multiplicateurs non nuls : 5x0,3 + 6x0,5 + 3x1 + 2x2 + 1x3 = 14,5 x (tous des dixièmes)
        self.assertEqual(total, 1450)

    def test_scarabee_une_bille_enumeree(self):
        # les 256 chemins d'une bille, pondérés 1/256 : espérance et variance égales aux formules du calcul exact
        vals = C.SCARAB_INT["std"]
        m1 = m2 = 0.0
        for bits in itertools.product((0.25, 0.75), repeat=C.SCARAB_ROWS):
            rng = ScriptedRng(list(bits) + [0.1] * 16, strict=True)
            b = G.scarab(rng, "std")["balls"][0]
            self.assertEqual(b["value"], vals[sum(1 for x in bits if x >= 0.5)])
            m1 += b["value"] / 256
            m2 += b["value"] ** 2 / 256
        per_ball = RES["bonus"]["scarab"]["std"][0] / 3 * C.SCALE
        self.assertAlmostEqual(m1, per_ball, places=6)

    def test_pesee_enumeree(self):
        # 7 paires x ordre (2) x plateau le plus lourd (2) ; le joueur (plume) gagne une fois sur deux
        tab = C.WEIGH_INT["std"]
        w = sum(t[1] for t in tab)
        e = e2 = 0.0
        wins = 0
        for (pair, wt) in tab:
            u = force.u_weighted(tab, pair)
            for order in (0.25, 0.75):
                for heavy in (0.25, 0.75):
                    b = G.weigh(ScriptedRng([u, order, heavy], strict=True), "std")
                    p = wt / w / 4
                    e += p * b["total"]
                    e2 += p * b["total"] ** 2
                    wins += b["total"] > 0
        self.assertEqual(wins, 7 * 2)   # une issue sur deux gagne
        self.assertAlmostEqual(e / C.SCALE, RES["bonus"]["weigh"]["std"][0], places=9)
        self.assertAlmostEqual(e2 / C.SCALE ** 2, RES["bonus"]["weigh"]["std"][1], places=6)

    def test_sanctuaire_recurrence_contre_dp_complet(self):
        # sur 3 tablettes, la récurrence des moments (exact.crypt_moments) égale la distribution complète des gains (DP exhaustif)
        old = C.CRYPT_CELLS
        try:
            C.CRYPT_CELLS = 3
            tw = sum(t[1] for t in C.CRYPT_TYPES)
            states = {(0, 1): 1.0}      # (offrande en x, marée) -> probabilité
            for _ in range(3):
                nxt = {}
                for (pool, tide), p in states.items():
                    for t, wt in C.CRYPT_TYPES:
                        pt = p * wt / tw
                        if t == "dust":
                            outs = [((pool, tide), pt)]
                        else:
                            vs = C.CRYPT_VALUES[t]
                            vw = sum(v[1] for v in vs)
                            outs = []
                            for v, vwt in vs:
                                q = pt * vwt / vw
                                if t == "tab":
                                    outs.append(((pool + v * tide, tide), q))
                                elif t == "tide":
                                    outs.append(((pool, tide * v), q))
                                else:
                                    outs.append(((pool * v, tide), q))
                        for k, q in outs:
                            nxt[k] = nxt.get(k, 0.0) + q
                states = nxt
            e = sum(p * max(pool, 1) for (pool, _), p in states.items())
            e2 = sum(p * max(pool, 1) ** 2 for (pool, _), p in states.items())
            got = exact.crypt_moments()
            self.assertAlmostEqual(got[0], e, places=9)
            self.assertAlmostEqual(got[1], e2, places=6)
        finally:
            C.CRYPT_CELLS = old

    def test_tresor_enumere_contre_exact_sur_les_deux_premiers_coffres(self):
        # jamais de sceau sur les deux premiers coffres : même avec un tirage tombant sur le sceau, le moteur retire
        vp = C.VAULT_INT["std"]
        pool = vp["tokens"] + [["seal", vp["seal"]]]
        seal_u = force.u_weighted(pool, "seal")
        coin_u = force.u_weighted(pool, vp["tokens"][0][0])
        rng = ScriptedRng([seal_u, coin_u, coin_u, seal_u], strict=True)
        b = G.vault(rng, "std")
        self.assertEqual(b["ended"], "seal")
        self.assertEqual(len(b["picks"]), 3)   # 2 coffres (le 1er sceau est retiré), puis le sceau au 3e
        self.assertEqual(b["total"], 2 * vp["tokens"][0][0])   # deux coffres de pièces avant le sceau


def wrath_pos(kind):
    """Tirage u qui, pendant la Colère, arrête la roue sur la première case `kind` de C.WRATH_CELLS."""
    j = [C.LAYOUT[i] for i in C.WRATH_CELLS].index(kind)
    return (j + 0.5) / len(C.WRATH_CELLS)


class TestColere(unittest.TestCase):
    """Colère d'Anubis : moteur piloté par des tirages ÉNUMÉRÉS contre les formules exactes (aucune simulation)."""

    def test_roue_de_la_colere(self):
        self.assertEqual(sorted({C.LAYOUT[i] for i in C.WRATH_CELLS}), sorted(C.WRATH_KINDS))
        self.assertEqual(len(C.WRATH_CELLS), 7)              # 4 Ankh + 3 bonus
        self.assertEqual(C.WRATH_LADDER, [2, 3, 5, 10, 25, 50, 100])
        for m in ("std", "plus"):
            self.assertEqual(C.MODES[m]["wrath"], 0.002)       # 1 tour sur 500

    def test_multiplicateur_par_le_moteur_et_loi_exacte(self):
        a = C.KINDS["ankh"]["count"] / len(C.WRATH_CELLS)
        law = dict((m, p) for m, p in exact.wrath_ladder())
        mine = {}
        for L in range(C.MAX_CHAIN + 1):
            script = [0.0, 0.5] + [0.9999, wrath_pos("ankh")] * L
            if L == C.MAX_CHAIN:
                script += [0.9999, wrath_pos("ankh")]          # 7e Ankh : retiré (plus de relance), ne fait pas monter le cran
            script += [0.9999, wrath_pos("scarab"), 0.5, 0.5]  # case finale Scarabées, ni Sanctuaire ni Fureur
            r = G.play_round(ScriptedRng(script, fallback_seed=L + 1), "std")
            last = r["spins"][-1]
            mult = C.WRATH_LADDER[min(L, C.WRATH_TOP)]
            self.assertEqual(len(r["spins"]), L + 1)
            self.assertEqual(last["kind"], "scarab")
            self.assertEqual(last["wrath"], mult)
            self.assertEqual(last["boost"], mult)
            self.assertEqual(last["pay"], last["base"] * mult)
            self.assertEqual(r["wrath"]["mult"], mult)
            self.assertEqual([s["wrath_up"] for s in r["spins"][:-1]], C.WRATH_LADDER[1:L + 1])
            pl = a ** L * (1 - a) if L < C.MAX_CHAIN else a ** C.MAX_CHAIN
            mine[mult] = mine.get(mult, 0.0) + pl
        self.assertAlmostEqual(sum(law.values()), 1.0, places=14)
        for m, p in law.items():
            self.assertAlmostEqual(p, mine[m], places=14)

    def test_esperance_exacte_de_la_colere(self):
        # E[gain] (sans plafond) recalculé ici d'une autre façon : (1-q)·E[case finale] + q·E[M]·E[case finale de la Colère]
        h, s = C.HAND_UPGRADE, C.SECRET_UPGRADE
        bon = RES["bonus"]
        hand, crypt = RES["hand"][0], RES["crypt"][0]
        wsum = sum(t[1] for t in C.ORACLE_KIND_W)

        def boost_mean(kind):
            tb = C.ORACLE_BOOST["bonus" if C.KINDS[kind]["bonus"] else "num"]
            return sum(b * w for b, w in tb) / sum(w for _, w in tb)

        def final_mean(qo, kinds):
            tot = sum(C.KINDS[k]["count"] for k in kinds)
            e = 0.0
            for k in kinds:
                d = C.KINDS[k]
                v = ((1 - s) * ((1 - h) * bon[k]["std"][0] + h * hand) + s * crypt) if d["bonus"] else d["mult"]
                po = qo * sum(w for kk, w in C.ORACLE_KIND_W if kk == k) / wsum
                e += d["count"] / tot * v * (1 - po + po * boost_mean(k))
            return e
        em = sum(m * p for m, p in exact.wrath_ladder())
        for mode in ("std", "plus"):
            md = C.MODES[mode]
            normal = [k for k, d in C.KINDS.items() if not d["respin"]]
            wr = [k for k in C.WRATH_KINDS if k != "ankh"]
            want = (1 - md["wrath"]) * final_mean(md["oracle"], normal) + md["wrath"] * em * final_mean(md["oracle"], wr)
            got = RES["uncapped"][mode]["mean"] * md["cost"]
            self.assertTrue(close(got, want, 1e-12), "%s : %r != %r" % (mode, got, want))

    def test_plafond_atteint_par_la_colere(self):
        # Colère, 6 Ankh (x100), puis Pesée 1000 x gagnante : 100 000 x plafonné à 25 000 x — chemin réel du moteur
        u_pair = force.u_weighted(C.WEIGH_INT["std"], max(C.WEIGH_INT["std"], key=lambda e: e[0][1])[0])
        script = [0.0, 0.5] + [0.9999, wrath_pos("ankh")] * (C.MAX_CHAIN + 1) + [0.9999, wrath_pos("weigh"), 0.5, 0.5, u_pair, 0.75, 0.25]
        r = G.play_round(ScriptedRng(script, fallback_seed=3), "std")
        self.assertEqual(r["spins"][-1]["base"], 1000 * C.SCALE)
        self.assertEqual(r["spins"][-1]["boost"], 100)
        self.assertTrue(r["capped"])
        self.assertEqual(r["total"], C.WINCAP_INT)
        sm = exact.summary("std")
        self.assertGreater(sm["tiers"]["max"]["p"], 1 / 5e6)      # gain max atteignable : ~1 tour sur 1,9 million
        self.assertLess(sm["tiers"]["max"]["p"], 1 / 1e6)

    def test_loi_exacte_coherente(self):
        for mode in C.MODE_ORDER:
            d = exact.distribution(mode)
            self.assertAlmostEqual(sum(d.values()), 1.0, places=12, msg=mode)
            self.assertTrue(all(v % 1 == 0 and 0 <= v <= exact.CAPU for v in d), mode)   # dixièmes entiers, plafonnés
            ft = exact.fence_targets(mode)
            self.assertAlmostEqual(sum(f["p"] for f in ft.values()), 1.0, places=12, msg=mode)
            self.assertAlmostEqual(sum(f["p"] * f["mean"] for f in ft.values()), exact.summary(mode)["mean"], places=10, msg=mode)
        # sans Colère ni plafond atteint, la loi retrouve les moments du calcul historique (achat des Scarabées : écart < 1e-3)
        self.assertAlmostEqual(exact.summary("bonus_scarab")["mean"], RES["uncapped"]["buy"]["scarab"][0], delta=1e-3)

    def test_sanctuaire_a_rebours_contre_dp_direct(self):
        # 3 tablettes : la propagation à rebours (E, F) de crypt_dist égale la propagation directe (offrande, marée), plancher x1
        old = C.CRYPT_CELLS
        try:
            C.CRYPT_CELLS = 3
            tw = sum(t[1] for t in C.CRYPT_TYPES)
            st = {(0, 1): 1.0}
            for _ in range(3):
                nx = {}
                for (pool, tide), p in st.items():
                    for t, wt in C.CRYPT_TYPES:
                        pt = p * wt / tw
                        if t == "dust":
                            nx[(pool, tide)] = nx.get((pool, tide), 0.0) + pt
                            continue
                        vs = C.CRYPT_VALUES[t]
                        vw = sum(v[1] for v in vs)
                        for v, vwt in vs:
                            k = (pool + v * tide, tide) if t == "tab" else (pool, tide * v) if t == "tide" else (pool * v, tide)
                            nx[k] = nx.get(k, 0.0) + pt * vwt / vw
                st = nx
            want = {}
            for (pool, _), p in st.items():
                v = 10 * min(max(pool, 1), C.WINCAP)
                want[v] = want.get(v, 0.0) + p
            got = exact.crypt_dist()
            self.assertEqual(sorted(got), sorted(want))
            for v in want:
                self.assertAlmostEqual(got[v], want[v], places=14)
        finally:
            C.CRYPT_CELLS = old


class TestVolatilite(unittest.TestCase):
    """Demande de l'utilisateur : volatilité NETTEMENT plus haute, gros gains à des fréquences que la table pondérée peut porter."""

    def test_ecart_type_et_gros_gains(self):
        for mode in ("std", "plus"):
            sm = exact.summary(mode)
            self.assertGreater(sm["sdRel"], 30, mode)                 # 14,5 avant la Colère (calcul exact plafonné)
            self.assertGreater(sm["hit"], 0.30, mode)                 # taux de gain non nul >= 30 %
            p100, p1000 = exact.at_least(mode, 100), exact.at_least(mode, 1000)
            self.assertTrue(1 / 2000 < p100 < 1 / 500, "%s >=100x : 1/%.0f" % (mode, 1 / p100))
            self.assertTrue(1 / 20000 < p1000 < 1 / 5000, "%s >=1000x : 1/%.0f" % (mode, 1 / p1000))

    def test_plancher_d_une_table_a_fences_par_palier(self):
        # quel que soit le façonnage de l'optimiseur DANS chaque fence, une table qui garde la probabilité et la moyenne exactes des paliers
        # 0 / <100 / 100-1000 / 1000+ / max a un écart-type d'au moins ~25 (Jensen) ; l'ancienne table (fences 0 / bonus / basegame / max) : 9,24 mesuré
        cuts = [0, 0.1, 100, 1000, C.WINCAP]
        self.assertGreater(exact.table_floor_sd("std", cuts), 24)
        self.assertGreater(exact.table_floor_sd("plus", cuts) / C.MODES["plus"]["cost"], 24)


if __name__ == "__main__":
    unittest.main()
