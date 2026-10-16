"""Anubis Unchained — état d'une simulation : un tour -> un book {id, events[], payoutMultiplier, criteria, ...}.

Équivalent du GameState du SDK (run_spin, critères de distribution, rejouer jusqu'à satisfaire le critère), sans dépendance.
Le tirage d'une simulation est un mulberry32 ensemencé par (graine, mode, n° de simulation) : tout book est reproductible.
"""
import game_calculations as G
import game_config as C
import game_events as E
import force
from rng import mulberry32

MAX_TRIES = 2_000_000


def sim_seed(seed, mode_index, sim):
    """Graine 32 bits d'une simulation (mélange de type splitmix : des simulations voisines ne sont pas corrélées)."""
    z = (seed * 0x9E3779B97F4A7C15 + (mode_index + 1) * 0xBF58476D1CE4E5B9 + (sim + 1) * 0x94D049BB133111EB) & 0xFFFFFFFFFFFFFFFF
    z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & 0xFFFFFFFFFFFFFFFF
    z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & 0xFFFFFFFFFFFFFFFF
    return (z ^ (z >> 31)) & 0xFFFFFFFF


def has_bonus(r):
    return any(s["bonus"] is not None for s in r["spins"])


def meets(criteria, r):
    """Le tour appartient-il à la classe de critère `criteria` ? (classes exclusives, dans l'ordre de priorité de l'optimiseur)"""
    total = r["total"]
    big, epic = 100 * C.SCALE, 1000 * C.SCALE   # paliers des gros gains (game_events.win_tier)
    if criteria == "wincap":
        return total >= C.WINCAP_INT
    if criteria == "0":
        return total == 0
    if criteria == "epic":
        return epic <= total < C.WINCAP_INT
    if criteria == "big":
        return big <= total < epic
    if criteria == "bonus":
        return has_bonus(r) and 0 < total < big
    if criteria == "basegame":
        return (not has_bonus(r)) and 0 < total < big
    raise KeyError(criteria)


class GameState:
    def __init__(self, config=None, payout_step=None, seed=2026, natural_rare=False):
        self.config = config or C.GameConfig()
        self.payout_step = C.PAYOUT_STEP if payout_step is None else payout_step
        self.seed = seed
        self.repeat_count = 0
        # natural_rare : les critères rares (big, epic, 0 des achats) sont tirés par rejet selon la loi du jeu (production, HOA_BIG=1) ;
        # sinon un chemin réel imposé suffit (démonstration plafonnée à 1000 books : pas de dizaines de milliers de tours de rejet)
        self.natural_rare = natural_rare

    def mode_index(self, mode_name):
        return C.MODE_ORDER.index(mode_name)

    def play(self, rng, mode_name):
        return G.play_mode(rng, mode_name)

    def make_book(self, sim, mode_name, criteria, rnd):
        pm = G.round_step(rnd["total"], self.payout_step)
        base_wins = sum(s["pay"] for s in rnd["spins"] if s["bonus"] is None)
        free_wins = sum(s["pay"] for s in rnd["spins"] if s["bonus"] is not None)
        return {
            "id": sim + 1,
            "payoutMultiplier": int(pm),
            "events": E.book_events(rnd, int(pm)),
            "criteria": criteria,
            "baseGameWins": base_wins / C.SCALE,
            "freeGameWins": free_wins / C.SCALE,
        }

    def run_spin(self, sim, mode_name, criteria):
        """Simule jusqu'à obtenir un tour de la classe `criteria`. Renvoie (book, descripteurs force, nombre d'essais)."""
        scripted = criteria in ("big", "epic") or (criteria == "0" and mode_name in C.BUY_KIND_OF)
        if criteria == "wincap" or (scripted and not self.natural_rare):
            fb = sim_seed(self.seed, self.mode_index(mode_name), sim)
            if criteria == "wincap":
                rng = force.wincap_rng(mode_name, fallback_seed=fb)
            else:   # palier rare avec le plafond de 1000 tours : chemin réel imposé (force.tier_script), pas de tirage par rejet
                rng = force.tier_rng(mode_name, "zero" if criteria == "0" else criteria, fallback_seed=fb)
            rnd = self.play(rng, mode_name)
            if not meets(criteria, rnd):
                raise RuntimeError("le script imposé n'atteint pas le critère %s (%s : %d)" % (criteria, mode_name, rnd["total"]))
            tries = 1
        else:
            rng = mulberry32(sim_seed(self.seed, self.mode_index(mode_name), sim))
            tries = 0
            while True:
                tries += 1
                rnd = self.play(rng, mode_name)
                if meets(criteria, rnd):
                    break
                if tries >= MAX_TRIES:
                    raise RuntimeError("critère %r introuvable en %d essais (mode %s)" % (criteria, tries, mode_name))
        self.repeat_count += tries
        return self.make_book(sim, mode_name, criteria, rnd), E.describe_book(rnd), rnd

    def criteria_plan(self, mode_name, n):
        """Répartition de n books entre critères d'après les quotas du mode (au moins 1 par critère ; somme = n)."""
        dists = self.config.get_betmode(mode_name).get_distributions()
        counts = [max(1, int(round(n * d.get_quota()))) for d in dists]
        # ajuste le plus gros critère pour que la somme vaille exactement n
        quotas = [d.get_quota() for d in dists]
        biggest = quotas.index(max(quotas))
        counts[biggest] = max(0, counts[biggest] + n - sum(counts))
        plan = []
        for d, c in zip(dists, counts):
            plan += [d.get_criteria()] * c
        return plan[:n] if len(plan) >= n else plan
