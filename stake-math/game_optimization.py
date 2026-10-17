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

FENCE_SEARCH = {"epic": {"tier": "epic"}, "big": {"tier": "big"}, "bonus": {"bonus": "yes"}}
M2M_BAND = (0.5, 3.0)   # bornes moyenne / médiane d'une fence : la valeur EXACTE du jeu × [0,5 ; 3] (l'optimiseur tire ses 10 000 books dans la table à poids égaux, dont le rapport est plus haut : [0,8 ; 1,25] ne convergeait jamais)


def class_targets(mode):
    """Cibles de chaque fence (ordre de priorité de l'optimiseur), tirées de la loi EXACTE du jeu (exact.fence_targets) :
    probabilité (hr = 1 / p) et part de RTP rapportée au coût. Chaque palier de gain (gain max, 0, >= 1000 x, 100-999,9 x, bonus, cases)
    garde SA fréquence naturelle : l'optimiseur ne peut plus aplatir la queue de distribution (docs/VOLATILITE.md). Seule la fence
    « bonus » absorbe l'écart entre le RTP naturel du mode et la cible commune (96,2 %), en gardant sa fréquence."""
    ft = exact.fence_targets(mode)
    cost = exact.mode_cost(mode)
    out = {}
    for name, st in ft.items():
        if name == "0":
            out[name] = {"p": st["p"]}
            continue
        if st["p"] <= 0:
            continue
        t = {"p": st["p"], "rtp": st["p"] * st["mean"] / cost, "hr": 1 / st["p"], "mean": st["mean"], "median": st["median"]}
        if st["median"] > 0 and st["values"] >= 3:
            r = st["mean"] / st["median"]
            t["m2m"] = (round(r * M2M_BAND[0], 3), round(r * M2M_BAND[1], 3))
        out[name] = t
    total = sum(t.get("rtp", 0) for t in out.values())
    out["bonus"]["rtp"] += C.RTP_TARGET - total
    for t in out.values():
        if "rtp" in t:
            t["rtp"] = round(t["rtp"], 7)
        if "hr" in t:
            t["hr"] = round(t["hr"], 3)
    return out


def mode_opt_params(mode):
    t = class_targets(mode)
    cond = {"wincap": ConstructConditions(rtp=t["wincap"]["rtp"], av_win=C.WINCAP, search_conditions=C.WINCAP).return_dict(),
            "0": ConstructConditions(rtp=0, av_win=0, search_conditions=0).return_dict()}
    for name in ("epic", "big", "bonus", "basegame"):
        if name not in t:
            continue
        cd = ConstructConditions(rtp=t[name]["rtp"], hr=t[name]["hr"], search_conditions=FENCE_SEARCH.get(name)).return_dict()
        if "m2m" in t[name]:   # bornes moyenne / médiane propres à la fence (clés lues par optimization_program, voir write_data.py)
            cd["min_m2m"], cd["max_m2m"] = t[name]["m2m"]
        cond[name] = cd
    scaling = [{"criteria": "bonus", "scale_factor": 1, "win_range": (1, 1), "probability": 1.0}]
    if "basegame" in t:
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
