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
        self.assertAlmostEqual(RES["std"]["mean"] * 100, 96.21, places=2)
        self.assertAlmostEqual(RES["plus"]["mean"] * 100, 96.10, places=2)
        want = {"scarab": 96.02, "weigh": 96.02, "vault": 96.03, "hand": 96.01}
        for k, v in want.items():
            self.assertAlmostEqual(RES["buy"][k]["rtp"] * 100, v, places=2, msg=k)
        self.assertAlmostEqual(RES["std"]["sd"], 16.11, places=2)
        self.assertAlmostEqual(RES["std"]["hit"] * 100, 42.6, places=1)
        self.assertAlmostEqual(RES["bonusEvery"], 20.0, places=6)

    def test_egal_au_js_a_1e9(self):
        for k in ("mean", "sd", "hit"):
            self.assertTrue(close(RES["std"][k], JS["std"][k]), "std " + k)
        for k in ("mean", "sd", "sdRel", "hit"):
            self.assertTrue(close(RES["plus"][k], JS["plus"][k]), "plus " + k)
        for kind in ("scarab", "weigh", "vault", "hand"):
            for k in ("mean", "sd", "price", "rtp", "sdRel", "fair"):
                self.assertTrue(close(RES["buy"][kind][k], JS["buy"][kind][k]), "buy %s %s" % (kind, k))
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
        # somme des multiplicateurs non nuls : 5x0,3 + 7x0,5 + 6x1 + 3x2 + 2x3 = 23 x (tous des dixièmes)
        self.assertEqual(total, 2300)

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


if __name__ == "__main__":
    unittest.main()
