"""(c) Plage de RTP, écart de RTP entre modes, taux de gain, présence du gain max dans la distribution cible — par calcul EXACT, sans tirage."""
import itertools
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402,F401
import exact  # noqa: E402
import game_calculations as G  # noqa: E402
import game_config as C  # noqa: E402
import game_optimization as O  # noqa: E402
from gamestate import GameState  # noqa: E402

RES = exact.compute()
RTP = {m: exact.mode_rtp(m, RES) for m in C.MODE_ORDER}
HIT = {m: exact.mode_hit(m, RES) for m in C.MODE_ORDER}


class TestRtp(unittest.TestCase):
    def test_dix_modes_declares(self):
        cfg = C.GameConfig()
        self.assertEqual([b.get_name() for b in cfg.bet_modes], ["std", "plus", "safe", "bold", "plus_safe", "plus_bold",
                                                                 "bonus_scarab", "bonus_weigh", "bonus_vault", "bonus_fury"])
        self.assertEqual([b.get_cost() for b in cfg.bet_modes], [1.0, 1.1, 1.0, 1.0, 1.1, 1.1, 9.26, 10.31, 12.37, 27.3])
        self.assertEqual([b.get_buybonus() for b in cfg.bet_modes], [False] * 6 + [True] * 4)
        for b in cfg.bet_modes:
            self.assertEqual(b.get_wincap(), 25000)
            self.assertAlmostEqual(b.get_rtp(), 0.962)
        self.assertEqual(C.RTP_TARGET, 0.962)
        self.assertEqual(C.SCALE, 100)

    def test_rtp_dans_la_plage_du_sdk(self):
        # utils/rgs_verification.py : limite haute 0,967 ; la source tierce cite 90-98 %
        for m, r in RTP.items():
            self.assertGreaterEqual(r, 0.90, m)
            self.assertLessEqual(r, 0.967, m)

    def test_rtp_proche_de_la_cible_96_2(self):
        for m, r in RTP.items():
            self.assertLess(abs(r - C.RTP_TARGET), 0.005, "%s : %.4f" % (m, r))   # <= 0,5 point de la cible

    def test_ecart_de_rtp_entre_modes_au_plus_0_5_point(self):
        worst = max(abs(a - b) for a, b in itertools.combinations(RTP.values(), 2))
        self.assertLessEqual(worst, 0.005, "écart maximal %.3f point" % (worst * 100))

    def test_taux_de_gain_au_moins_un_sur_vingt(self):
        for m, h in HIT.items():
            self.assertGreaterEqual(h, 1 / 20, m)
        self.assertGreater(HIT["std"], 0.30)   # 32,7 % depuis la Colère d'Anubis (42,6 % avant) : plancher demandé 30 %

    def test_prix_d_achat_coherents(self):
        for kind, b in RES["buy"].items():
            self.assertLess(abs(b["rtp"] - 0.96), 0.001, kind)


class TestPactes(unittest.TestCase):
    """Décision du joueur avant le tour : trois pactes = trois profils de volatilité, chacun un mode de mise au même coût et au même RTP."""

    def test_meme_rtp_que_la_balance(self):
        # le choix du pacte ne change pas l'espérance : RTP exact identique à 0,005 point près (réglage tools/tune-pacts.js)
        for fam in ("std", "plus"):
            ref = RTP[fam]
            for pf in ("safe", "bold"):
                m = C.mode_for(fam, pf)
                self.assertEqual(C.MODES[m]["cost"], C.MODES[fam]["cost"], m)
                self.assertEqual(C.MODES[m]["oracle"], C.MODES[fam]["oracle"], m)
                self.assertLess(abs(RTP[m] - ref), 0.00005, "%s : %.5f contre %.5f" % (m, RTP[m], ref))
                self.assertLess(abs(RTP[m] - C.RTP_TARGET), 0.00005, m)

    def test_volatilite_ordonnee_et_distincte(self):
        # Scribe < Balance < Chacal, avec des écarts nets (au moins 25 % d'écart-type entre deux pactes voisins)
        for fam in ("std", "plus"):
            sd = [exact.summary(C.mode_for(fam, pf))["sdRel"] for pf in C.PACT_ORDER]
            self.assertTrue(sd[0] * 1.25 < sd[1] and sd[1] * 1.25 < sd[2], (fam, sd))
        # la queue suit : gros gains (>= 1000x) bien plus fréquents au Chacal qu'au Scribe
        self.assertGreater(exact.at_least("bold", 1000), 2 * exact.at_least("safe", 1000))

    def test_echelles_de_la_colere(self):
        self.assertEqual(C.ladder_of("std"), C.WRATH_LADDER)
        self.assertEqual(C.ladder_of("safe")[-1], 10)
        self.assertEqual(C.ladder_of("bold")[0], 3)
        self.assertEqual(C.ladder_of("bold")[-1], 250)
        for pf in C.PACT_ORDER:
            wl = exact.wrath_ladder(pf)
            self.assertAlmostEqual(sum(p for _, p in wl), 1.0, places=12)
            self.assertEqual([m for m, _ in wl], C.ladder_of(pf))

    def test_mode_for(self):
        self.assertEqual(C.mode_for("std", "std"), "std")
        self.assertEqual(C.mode_for("plus", "std"), "plus")
        self.assertEqual(C.mode_for("std", "safe"), "safe")
        self.assertEqual(C.mode_for("plus", "bold"), "plus_bold")
        self.assertEqual(C.mode_for("plus", "inconnu"), "plus")
        for m in C.BASE_MODES:
            self.assertEqual(C.mode_for(C.family_of(m), C.MODES[m]["pact"]), m)

    def test_le_pacte_ne_change_ni_la_roue_ni_l_oracle(self):
        # mêmes tirages, sans Colère : la roue, l'Oracle et le type de bonus sont identiques ; seul le profil du bonus change
        from rng import mulberry32
        diff = 0
        for k in range(150):
            out = {}
            for m in ("std", "safe", "bold"):
                base, first = mulberry32(900 + k), [True]

                def rng(base=base, first=first):
                    if first[0]:
                        first[0] = False
                        return 0.9999     # pas de Colère
                    return base()
                r = G.play_mode(rng, m)
                s0 = r["spins"][0]
                out[m] = (s0["index"], s0["oracle"] and s0["oracle"]["kind"], s0["bonus_kind"], s0["profile"])
            self.assertEqual(out["std"][:3], out["safe"][:3])
            self.assertEqual(out["std"][:3], out["bold"][:3])
            if out["std"][2] in ("scarab", "weigh", "vault"):
                self.assertEqual((out["safe"][3], out["bold"][3]), ("safe", "bold"))
                diff += 1
        self.assertGreater(diff, 0)

    def test_achats_toujours_en_balance(self):
        from rng import mulberry32
        rng = mulberry32(4)
        for mode in C.BUY_KIND_OF:
            for _ in range(20):
                r = G.play_mode(rng, mode)
                self.assertEqual(r["pact"], "std")
                self.assertIn(r["spins"][0]["profile"], ("std", "turq"))


class TestGainMax(unittest.TestCase):
    def setUp(self):
        self.cfg = C.GameConfig()
        O.OptimizationSetup(self.cfg)

    def test_critere_wincap_dans_chaque_mode(self):
        for bm in self.cfg.bet_modes:
            dists = {d.get_criteria(): d for d in bm.get_distributions()}
            self.assertIn("wincap", dists, bm.get_name())
            self.assertEqual(dists["wincap"].get_win_criteria(), 25000)
            self.assertGreater(dists["wincap"].get_quota(), 0)
            self.assertAlmostEqual(sum(d.get_quota() for d in bm.get_distributions()), 1.0, places=9, msg=bm.get_name())
            self.assertEqual(bm.get_distributions()[0].get_criteria(), "wincap")   # le gain max d'abord (priorité de l'optimiseur)

    def test_gain_max_dans_la_distribution_cible_de_l_optimiseur(self):
        for mode, p in self.cfg.opt_params.items():
            cond = p["conditions"]
            self.assertEqual(list(cond)[0], "wincap", mode)
            w = cond["wincap"]
            self.assertEqual(tuple(w["search_range"]), (25000, 25000), mode)
            self.assertGreater(w["rtp"], 0)
            hr = w["av_win"] / w["rtp"] / self.cfg.mode_cost(mode)   # « 1 sur hr » par pari (rtp rapporté au coût du mode)
            # fréquence NATURELLE du gain max (loi exacte) : 1 sur 1,9 million en Standard, 1 sur 1,1 x 10^8 aux achats Scarabées / Pesée / Trésor
            self.assertTrue(1e5 <= hr <= 2e8, "%s : gain max 1 sur %.0f" % (mode, hr))
            # le total des parts de RTP des critères vaut la cible
            self.assertAlmostEqual(sum(c["rtp"] for c in cond.values()), C.RTP_TARGET, places=4, msg=mode)

    def test_un_book_au_plafond_par_mode(self):
        gs = GameState(self.cfg, payout_step=10)
        for mode in C.MODE_ORDER:
            book, desc, rnd = gs.run_spin(0, mode, "wincap")
            self.assertEqual(book["payoutMultiplier"], 25000 * 100, mode)
            self.assertEqual(book["criteria"], "wincap")
            self.assertEqual(book["events"][-1]["type"], "finalWin")
            self.assertTrue(book["events"][-1]["capped"])

    def test_aucun_gain_ne_depasse_le_plafond(self):
        # 6 modes x 150 tours (<< 1000) : le total est toujours <= 25 000 x et entier
        from rng import mulberry32
        for mi, mode in enumerate(C.MODE_ORDER):
            rng = mulberry32(31 + mi)
            for _ in range(150):
                r = G.play_mode(rng, mode)
                self.assertIsInstance(r["total"], int)
                self.assertTrue(0 <= r["total"] <= C.WINCAP_INT)

    def test_multiples_de_0_01_exacts(self):
        # toutes les valeurs du jeu sont des multiples de 0,01 : la conversion en entiers est exacte
        for tab in list(C.SCARAB_PROFILES.values()):
            for v in tab:
                self.assertTrue(C.is_exact(v), v)
        for tab in C.WEIGH_PROFILES.values():
            for (a, b), _ in tab:
                self.assertTrue(C.is_exact(a) and C.is_exact(b))
        for d in C.KINDS.values():
            if d["mult"] is not None:
                self.assertTrue(C.is_exact(d["mult"]))
        for cost in [1.1, 9.26, 10.31, 12.37, 27.3]:
            self.assertTrue(C.is_exact(cost))


class TestPasDeDix(unittest.TestCase):
    """utils/rgs_verification.py exige des payouts multiples de 10 (0,10 x à l'échelle 100) : tous les gains du jeu le sont, sans arrondi."""

    def test_valeurs_du_jeu_en_dixiemes(self):
        vals = [d["mult"] for d in C.KINDS.values() if d["mult"] is not None]
        for tab in C.SCARAB_PROFILES.values():
            vals += tab
        for tab in C.WEIGH_PROFILES.values():
            for (a, b), _ in tab:
                vals += [a, b]
        for vp in C.VAULT_PROFILES.values():
            vals += [t for t, _ in vp["tokens"] if isinstance(t, (int, float))]
        vals += [s["n"] for s in C.HAND_SEGS if "n" in s]
        vals += [v for v, _ in C.CRYPT_VALUES["tab"]]
        for v in vals:
            self.assertTrue(C.is_tenth(v), v)
        self.assertEqual(C.KINDS["m025"]["mult_int"] % 10, 0)
        self.assertEqual(C.PAYOUT_STEP, 1)   # aucun arrondi

    def test_gains_des_tours_multiples_de_10(self):
        from rng import mulberry32
        for mi, mode in enumerate(C.MODE_ORDER):
            rng = mulberry32(5 + mi)
            for _ in range(150):
                r = G.play_mode(rng, mode)
                self.assertEqual(r["total"] % 10, 0, mode)
                for s in r["spins"]:
                    self.assertEqual(s["pay"] % 10, 0, mode)

    def test_arrondi_de_garde_fou(self):
        self.assertEqual(G.round_step(25, 10), 30)
        self.assertEqual(G.round_step(24, 10), 20)
        self.assertEqual(G.round_step(5, 10), 10)       # un gain non nul ne tombe jamais à 0
        self.assertEqual(G.round_step(0, 10), 0)
        self.assertEqual(G.round_step(2500000, 10), 2500000)
        self.assertEqual(G.round_step(25, 1), 25)


if __name__ == "__main__":
    unittest.main()
