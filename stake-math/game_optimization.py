"""Anubis Unchained — paramètres de l'optimiseur de Stake (équivalent de games/<jeu>/game_optimization.py du SDK).

L'optimiseur (optimization_program, en Rust) choisit les POIDS des books pour atteindre, par critère, un RTP et un taux de gain visés.
Ici les valeurs de départ viennent du calcul EXACT (exact.py) : chaque critère garde la part de RTP qu'il a naturellement, le gain
maximal reçoit 0,2 point, et le total vaut game_config.RTP_TARGET (96,2 %). Les RTP d'un critère sont rapportés au COÛT du mode.

LIMITE : ce sont des valeurs de départ, calculées mais NON testées avec le programme Rust (non lancé ici : plafond de 1000 books).
La production réelle (voir README) doit les confirmer ; les bornes `min_m2m`/`max_m2m` (moyenne / médiane) en particulier dépendent de la
volatilité réelle et se règlent à l'usage.
"""
import game_config as C
import exact

try:   # SDK présent : classes officielles
    from optimization_program.optimization_config import (   # type: ignore
        ConstructScaling, ConstructParameters, ConstructConditions, verify_optimization_input)
except Exception:
    class ConstructScaling:
        def __init__(self, all_scaling):
            for sc in all_scaling:
                for cond in ("criteria", "scale_factor", "win_range", "probability"):
                    assert cond in sc
            self.scaling = all_scaling

        def return_dict(self):
            return self.scaling

    class ConstructParameters:
        def __init__(self, num_show, num_per_fence, min_m2m, max_m2m, pmb_rtp, sim_trials, test_spins, test_weights,
                     score_type="rtp", max_trial_dist=15):
            self.parameters = {
                "num_show_pigs": num_show, "num_pigs_per_fence": num_per_fence, "min_mean_to_median": min_m2m,
                "max_mean_to_median": max_m2m, "pmb_rtp": pmb_rtp, "simulation_trials": sim_trials, "test_spins": test_spins,
                "test_spins_weights": test_weights, "score_type": score_type, "max_trial_dist": max_trial_dist,
            }

        def return_dict(self):
            return self.parameters

    class ConstructConditions:
        def __init__(self, rtp=None, av_win=None, hr=None, search_conditions=None):
            if rtp is None or rtp == "x":
                assert av_win is not None and hr is not None, "sans RTP, il faut hr et av_win"
                rtp = round(av_win / hr, 5)
            search_range, force_search = (-1, -1), {}
            if isinstance(search_conditions, (int, float)):
                search_range = (search_conditions, search_conditions)
            elif isinstance(search_conditions, tuple):
                search_range = search_conditions
            elif isinstance(search_conditions, dict):
                force_search = search_conditions
            self.params = {"search_range": search_range, "force_search": force_search}
            for k, v in (("rtp", rtp), ("av_win", av_win), ("hr", hr)):
                if v is not None:
                    self.params[k] = v

        def return_dict(self):
            return self.params

    def verify_optimization_input(game_config, opt_dict):
        for mode in opt_dict:
            assert any(bm.get_name() == mode for bm in game_config.bet_modes), "mode inconnu : %s" % mode

WINCAP_RTP = 0.002     # part de RTP du gain maximal (hr = 25000 / 0.002 = 1 sur 12,5 millions)


def class_targets(mode):
    """RTP et taux de gain visés par critère pour un mode (valeurs de départ issues du calcul exact)."""
    res = exact.compute()
    target = C.RTP_TARGET
    if mode in ("std", "plus"):
        r = res["std"] if mode == "std" else res["plus"]
        cost = C.MODES[mode]["cost"]
        cls = r["classes"]
        base_rtp = cls["basegame"][1] / cost if mode == "plus" else cls["basegame"][1]
        base_p = cls["basegame"][0]
        # probabilité d'un bonus payant : la Pesée perdue (50 % hors Fureur et Sanctuaire) est classée « 0 »
        weigh_zero = (1 / (C.N - C.KINDS["ankh"]["count"])) * 0.5 * (1 - C.SECRET_UPGRADE) * (1 - C.HAND_UPGRADE)
        bonus_p = cls["bonus"][0] - weigh_zero
        return {
            "wincap": {"rtp": WINCAP_RTP},
            "0": {},
            "bonus": {"rtp": round(target - base_rtp - WINCAP_RTP, 5), "hr": round(1 / bonus_p, 3)},
            "basegame": {"rtp": round(base_rtp, 5), "hr": round(1 / base_p, 3)},
        }
    kind = C.BUY_KIND_OF[mode]
    hit = res["buy"][kind]["hit"]
    out = {"wincap": {"rtp": WINCAP_RTP},
           "bonus": {"rtp": round(target - WINCAP_RTP, 5), "hr": round(1 / (hit if mode == "buy_weigh" else 1.0), 3)}}
    if mode == "buy_weigh":
        out["0"] = {}
    return out


def mode_opt_params(mode):
    t = class_targets(mode)
    cond = {"wincap": ConstructConditions(rtp=t["wincap"]["rtp"], av_win=C.WINCAP, search_conditions=C.WINCAP).return_dict()}
    if "0" in t:
        cond["0"] = ConstructConditions(rtp=0, av_win=0, search_conditions=0).return_dict()
    cond["bonus"] = ConstructConditions(rtp=t["bonus"]["rtp"], hr=t["bonus"]["hr"], search_conditions={"bonus": "yes"}).return_dict()
    scaling = [{"criteria": "bonus", "scale_factor": 1, "win_range": (1, 1), "probability": 1.0}]
    if "basegame" in t:
        cond["basegame"] = ConstructConditions(rtp=t["basegame"]["rtp"], hr=t["basegame"]["hr"]).return_dict()
        scaling.append({"criteria": "basegame", "scale_factor": 1, "win_range": (1, 1), "probability": 1.0})
    return {
        "conditions": cond,
        "scaling": ConstructScaling(scaling).return_dict(),
        "parameters": ConstructParameters(
            num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=8, pmb_rtp=1.0, sim_trials=5000,
            test_spins=[50, 100, 200], test_weights=[0.3, 0.4, 0.3], score_type="rtp").return_dict(),
    }


class OptimizationSetup:
    """Amende game_config.opt_params (requis pour math_config.json), comme dans le SDK."""

    def __init__(self, game_config):
        self.game_config = game_config
        game_config.opt_params = {bm.get_name(): mode_opt_params(bm.get_name()) for bm in game_config.bet_modes}
        verify_optimization_input(game_config, game_config.opt_params)
