"""Anubis Unchained — configuration du jeu au format math-sdk de Stake (GameConfig).

Toutes les lois de probabilité sont celles de js/math.js, recopiées à l'identique : mêmes poids, mêmes tables, mêmes plafonds.
Les tables sont écrites ici en multiples de la mise (comme dans le JS) ; le moteur les convertit en entiers à l'échelle SCALE = 100
(100 = 1,00 x la mise) au chargement : tout le calcul des gains est donc exact, sans flottant.

Ce fichier est autonome (bibliothèque standard seulement). Copié dans math-sdk/games/<jeu>/, les classes BetMode et Distribution du SDK
sont utilisées à la place des classes locales de repli (voir en bas).
"""
import math

# ---------------------------------------------------------------------------------------------------------------------
# Échelle entière et plafond
# ---------------------------------------------------------------------------------------------------------------------
SCALE = 100                      # M.SCALE : payoutMultiplier entier, 100 = 1,00 x
WINCAP = 25000                   # M.MAX_WIN (x la mise)
WINCAP_INT = WINCAP * SCALE      # 2 500 000
MAX_CHAIN = 6                    # Ankh enchaînés au plus
# Le vérificateur du SDK (utils/rgs_verification.py) exige des payouts multiples de 10 (donc 0,10 x) : voir PAYOUT_STEP
PAYOUT_STEP = 10


def S(x):
    """toInt de js/math.js : arrondi au plus proche, la moitié vers le haut (Math.round), sur x * SCALE."""
    return int(math.floor(x * SCALE + 0.5))


# ---------------------------------------------------------------------------------------------------------------------
# Identité du jeu
# ---------------------------------------------------------------------------------------------------------------------
GAME_ID = "anubis_unchained"
WORKING_NAME = "Anubis Unchained"
RTP_TARGET = 0.962               # RTP cible de TOUS les modes (l'optimiseur de Stake règle les poids pour l'atteindre)

# ---------------------------------------------------------------------------------------------------------------------
# La roue de 64 cases (très haute volatilité)
# ---------------------------------------------------------------------------------------------------------------------
# id -> (mult en x la mise, nombre de cases, bonus ?, relance ?)
KINDS = {
    "m0":     {"mult": 0.0,  "count": 34, "bonus": False, "respin": False},
    "m025":   {"mult": 0.25, "count": 5,  "bonus": False, "respin": False},
    "m05":    {"mult": 0.5,  "count": 7,  "bonus": False, "respin": False},
    "m1":     {"mult": 1.0,  "count": 6,  "bonus": False, "respin": False},
    "m2":     {"mult": 2.0,  "count": 3,  "bonus": False, "respin": False},
    "m3":     {"mult": 3.0,  "count": 2,  "bonus": False, "respin": False},
    "ankh":   {"mult": 0.0,  "count": 4,  "bonus": False, "respin": True},
    "scarab": {"mult": None, "count": 1,  "bonus": True,  "respin": False},
    "weigh":  {"mult": None, "count": 1,  "bonus": True,  "respin": False},
    "vault":  {"mult": None, "count": 1,  "bonus": True,  "respin": False},
}
KIND_ORDER = ["weigh", "vault", "scarab", "m3", "ankh", "m2", "m1", "m05", "m025", "m0"]
for _k, _d in KINDS.items():
    _d["id"] = _k
    _d["mult_int"] = S(_d["mult"]) if _d["mult"] is not None else 0
BONUS_KINDS = ["scarab", "weigh", "vault"]
HAND_UPGRADE = 0.08              # chance qu'un bonus soit saisi par la Fureur d'Anubis
SECRET_UPGRADE = 0.04            # chance qu'un bonus gagné sur la roue devienne le Sanctuaire des Marées


def build_layout():
    """Disposition déterministe de la roue : copie ligne à ligne de buildLayout() (js/math.js)."""
    n = sum(KINDS[i]["count"] for i in KIND_ORDER)
    slots = [None] * n

    def free(p):
        return slots[p] is None

    for ki, kid in enumerate(KIND_ORDER):
        c = KINDS[kid]["count"]
        for i in range(c):
            if kid == "m0":
                slots[slots.index(None)] = kid
                continue
            p = int(math.floor((i + 0.5) * n / c + ki * 1.7 + 0.5)) % n
            tries = 0
            while (not free(p) or slots[(p + 1) % n] == kid or slots[(p - 1 + n) % n] == kid) and tries < n:
                p = (p + 1) % n
                tries += 1
            if not free(p):
                p = slots.index(None)
            slots[p] = kid
    for _ in range(4):
        for i in range(n):
            if slots[i] != slots[(i + 1) % n] or slots[i] == "m0":
                continue
            for k in range(n):
                a, b = slots[k], slots[i]
                if a == b or slots[(k + 1) % n] == b or slots[(k - 1 + n) % n] == b:
                    continue
                if slots[(i + 1) % n] == a or slots[(i + 2) % n] == a or slots[(i - 1 + n) % n] == a:
                    continue
                if k == i or k == (i + 1) % n:
                    continue
                slots[(i + 1) % n] = a
                slots[k] = b
                break
    return slots


LAYOUT = build_layout()
N = len(LAYOUT)                  # 64

# ---------------------------------------------------------------------------------------------------------------------
# Modes de mise (cost = débit en multiples de la mise)
# ---------------------------------------------------------------------------------------------------------------------
MODES = {"std": {"cost": 1.0, "oracle": 0.31}, "plus": {"cost": 1.1, "oracle": 0.72}}
BUY = {"scarab": 9.24, "weigh": 10.31, "vault": 12.37, "hand": 27.28}   # « hand » = Fureur d'Anubis (identifiant interne conservé)
BUY_NAMES = {"scarab": "buy_scarab", "weigh": "buy_weigh", "vault": "buy_vault", "hand": "buy_fury"}
BUY_KIND_OF = {v: k for k, v in BUY_NAMES.items()}
MODE_ORDER = ["std", "plus", "buy_scarab", "buy_weigh", "buy_vault", "buy_fury"]

# ---------------------------------------------------------------------------------------------------------------------
# Oracle : bénédiction scellée avant le tour, révélée à l'arrêt de la roue
# ---------------------------------------------------------------------------------------------------------------------
ORACLE_KIND_W = [["m05", 3], ["m1", 4], ["m2", 3], ["m3", 2], ["scarab", 3], ["weigh", 3], ["vault", 3]]
ORACLE_BOOST = {
    "num":   [[2, 70], [3, 20], [5, 7], [10, 2.5], [25, 0.5]],
    "bonus": [[2, 66], [3, 21], [5, 8.5], [10, 3.4], [25, 0.8], [100, 0.06]],
}

# ---------------------------------------------------------------------------------------------------------------------
# Bonus 1 : Chute des Scarabées (8 rangées de chevilles, 3 scarabées) — 9 cases, profils de même espérance
# ---------------------------------------------------------------------------------------------------------------------
SCARAB_ROWS = 8
SCARAB_BALLS = 3
SCARAB_PROFILES = {
    "safe": [22, 7, 3.5, 1.9, 0.9, 1.9, 3.5, 7, 22],
    "std":  [100, 10, 2.5, 0.65, 0.79, 0.65, 2.5, 10, 100],
    "bold": [230, 3.5, 1, 0.25, 0.4, 0.25, 1, 3.5, 230],
}

# ---------------------------------------------------------------------------------------------------------------------
# Bonus 2 : Pesée du Cœur — [[a, b], poids] ; le plateau le plus lourd (50/50) gagne SON multiplicateur
# ---------------------------------------------------------------------------------------------------------------------
WEIGH_PROFILES = {
    "safe": [[[3, 7], 45], [[5, 11], 30], [[8, 18], 15], [[14, 30], 6], [[25, 70], 2.5], [[50, 200], 1], [[100, 800], 1.5]],
    "std":  [[[1, 5], 45], [[2, 10], 30], [[4, 20], 15], [[8, 40], 6], [[15, 100], 2.5], [[30, 300], 0.8], [[60, 1000], 1.5]],
    "bold": [[[1, 3], 50], [[1, 6], 30], [[2, 12], 12], [[3, 30], 5], [[5, 80], 2.5], [[10, 300], 1], [[20, 3000], 0.72]],
}

# ---------------------------------------------------------------------------------------------------------------------
# Bonus 3 : Chambre du Trésor (12 coffres) — pièces (+N), sceptre (x2 sur le total), clé d'or (+2 coffres, 10 au plus), sceau (fin)
# ---------------------------------------------------------------------------------------------------------------------
VAULT_TILES = 12
VAULT_BASE_PICKS = 7
VAULT_KEY_PICKS = 2
VAULT_PICK_CAP = 10
VAULT_FINISH = 5                 # prime « chambre vidée » (x la mise)
VAULT_PROFILES = {
    "safe": {"seal": 34.79, "tokens": [[1, 48], [2, 26], [3, 10], [5, 5], [10, 2], [25, 0.6], [100, 0.12], [500, 0.02], ["scepter", 2], ["key", 4]]},
    "std":  {"seal": 66.19, "tokens": [[1, 40], [2, 25], [3, 12], [5, 6], [10, 3], [25, 1.2], [80, 0.4], [500, 0.06], ["scepter", 2.5], ["key", 3]]},
    "bold": {"seal": 64.94, "tokens": [[1, 60], [2, 15], [3, 6], [5, 3], [10, 2], [25, 1.5], [100, 0.4], [600, 0.08], ["scepter", 4], ["key", 1]]},
}

# ---------------------------------------------------------------------------------------------------------------------
# Bonus 4 : Fureur d'Anubis — roue géante de 24 segments : nombre n, DOUBLE d (couleur 0/1/2), bande b (bonus x)
# ---------------------------------------------------------------------------------------------------------------------
HAND_COLORS = ["turq", "gold", "ruby"]
HAND_SEGS = [
    {"b": "vault", "x": 4}, {"n": 6}, {"d": 0}, {"n": 3}, {"n": 15}, {"n": 4}, {"d": 1}, {"b": "scarab", "x": 12},
    {"n": 8}, {"n": 3}, {"d": 2}, {"n": 30}, {"b": "weigh", "x": 6}, {"n": 5}, {"d": 0}, {"n": 180},
    {"n": 10}, {"n": 3}, {"d": 1}, {"b": "scarab", "x": 3}, {"n": 25}, {"n": 4}, {"d": 2}, {"n": 12},
]
HAND_MAX_CHAIN = 4               # doublements au plus (palier x16)
HAND_MIN_N = min(s["n"] for s in HAND_SEGS if "n" in s)
HAND_MAX_SPINS = 12

# ---------------------------------------------------------------------------------------------------------------------
# Bonus SECRET : Sanctuaire des Marées (9 tablettes)
# ---------------------------------------------------------------------------------------------------------------------
CRYPT_CELLS = 9
CRYPT_START = 0
CRYPT_BIG = 1e9                  # garde-fou numérique interne, en x la mise (le gain est plafonné à WINCAP)
CRYPT_TYPES = [["dust", 64], ["tab", 22], ["tide", 8], ["eclipse", 6]]
CRYPT_VALUES = {
    "tab": [[1, 55.09], [2, 30], [3, 12], [5, 5], [10, 2], [25, 0.5], [100, 0.1], [300, 0.02]],
    "tide": [[2, 60], [3, 25], [5, 10], [10, 5]],
    "eclipse": [[2, 85], [3, 15]],
}

# ---------------------------------------------------------------------------------------------------------------------
# Tables converties à l'échelle entière (exactes : toutes les valeurs sont des multiples de 0,01)
# ---------------------------------------------------------------------------------------------------------------------
SCARAB_INT = {p: [S(v) for v in vals] for p, vals in SCARAB_PROFILES.items()}
WEIGH_INT = {p: [[[S(a), S(b)], w] for (a, b), w in tab] for p, tab in WEIGH_PROFILES.items()}
VAULT_INT = {
    p: {"seal": vp["seal"], "tokens": [[S(t) if isinstance(t, (int, float)) else t, w] for t, w in vp["tokens"]]}
    for p, vp in VAULT_PROFILES.items()
}
HAND_MIN_N_INT = S(HAND_MIN_N)
VAULT_FINISH_INT = S(VAULT_FINISH)
CRYPT_BIG_INT = int(CRYPT_BIG * SCALE)
BOOST_INT = ORACLE_BOOST   # les boosts sont des entiers sans unité (x2, x3, ... x100) : aucune conversion


def is_exact(x):
    """M.isExact : x est un multiple de 1/SCALE."""
    return abs(x * SCALE - round(x * SCALE)) < 1e-6 * max(1, abs(x * SCALE))


# ---------------------------------------------------------------------------------------------------------------------
# Modes de mise au format SDK
# ---------------------------------------------------------------------------------------------------------------------
try:   # math-sdk présent : classes officielles
    from src.config.betmode import BetMode          # type: ignore
    from src.config.distributions import Distribution  # type: ignore
    USING_SDK = True
except Exception:   # repli autonome, même signature que le SDK
    USING_SDK = False

    class Distribution:
        def __init__(self, criteria=None, quota=None, fixed_amt=None, win_criteria=None, conditions=None,
                     required_distribution_conditions=None, default_distribution_conditions=None):
            if fixed_amt is None:
                assert quota is not None and quota > 0, "quota non nul requis"
            self._criteria, self._quota, self._fixed_amt = criteria, quota, fixed_amt
            self._win_criteria = win_criteria
            self._conditions = dict(conditions or {})

        def get_criteria(self):
            return self._criteria

        def get_quota(self):
            return self._quota

        def get_win_criteria(self):
            return self._win_criteria

        def get_fixed_amt(self):
            return self._fixed_amt

    class BetMode:
        def __init__(self, name, cost, rtp, max_win, auto_close_disabled, is_feature, is_buybonus, distributions):
            if rtp >= 1.0:
                raise Warning("Return To Player is >=1.0!: %s" % rtp)
            self._name, self._cost, self._rtp, self._wincap = name, cost, rtp, max_win
            self._auto_close_disabled, self._is_feature, self._is_buybonus = auto_close_disabled, is_feature, is_buybonus
            self._distributions = distributions

        def get_name(self):
            return self._name

        def get_cost(self):
            return self._cost

        def get_feature(self):
            return self._is_feature

        def get_auto_close_disabled(self):
            return self._auto_close_disabled

        def get_buybonus(self):
            return self._is_buybonus

        def get_wincap(self):
            return self._wincap

        def get_rtp(self):
            return self._rtp

        def get_distributions(self):
            return self._distributions


def _dist(criteria, quota, **cond):
    """Distribution sans reel_weights (pas de rouleaux ici : la roue est tirée par game_executables)."""
    kw = dict(criteria=criteria, quota=quota, conditions=cond)
    win_criteria = cond.pop("win_criteria", None)
    kw["win_criteria"] = win_criteria
    try:
        return Distribution(required_distribution_conditions=[], **kw)
    except TypeError:
        return Distribution(**kw)


# Critères (ordre = priorité de l'optimiseur : le gain max d'abord, puis les tours à 0, puis les bonus, puis le reste)
#   wincap   : payout = WINCAP x ; construit par un script de tirages imposés (impossible par tirage au hasard, ~1 sur 10^8)
#   0        : payout nul
#   bonus    : un bonus a été joué (hors gain max, hors 0)
#   basegame : gain de la roue seule, sans bonus
QUOTAS = {
    "std":        [("wincap", 0.002), ("0", 0.25), ("bonus", 0.30), ("basegame", 0.448)],
    "plus":       [("wincap", 0.002), ("0", 0.25), ("bonus", 0.30), ("basegame", 0.448)],
    "buy_scarab": [("wincap", 0.002), ("bonus", 0.998)],
    "buy_weigh":  [("wincap", 0.002), ("0", 0.45), ("bonus", 0.548)],
    "buy_vault":  [("wincap", 0.002), ("bonus", 0.998)],
    "buy_fury":   [("wincap", 0.002), ("bonus", 0.998)],
}


def make_distributions(mode):
    out = []
    for crit, q in QUOTAS[mode]:
        cond = {"force_wincap": crit == "wincap", "force_bonus": crit in ("wincap", "bonus"),
                "force_zero": crit == "0", "force_basegame": crit == "basegame"}
        out.append(_dist(crit, q, win_criteria=(WINCAP if crit == "wincap" else (0.0 if crit == "0" else None)), **cond))
    return out


class GameConfig:
    """Équivalent du GameConfig(Config) du SDK (sans reels : le jeu est une roue)."""

    def __init__(self):
        self.game_id = GAME_ID
        self.provider_number = 0
        self.working_name = WORKING_NAME
        self.game_name = WORKING_NAME
        self.wincap = WINCAP
        self.win_type = "wheel"
        self.rtp = RTP_TARGET
        self.min_denomination = 0.1
        self.basegame_type = "basegame"
        self.freegame_type = "bonus"
        self.num_reels = 0
        self.num_rows = []
        self.paytable = {k: d["mult"] for k, d in KINDS.items() if d["mult"] is not None}
        self.special_symbols = {"bonus": list(BONUS_KINDS), "respin": ["ankh"]}
        self.scale = SCALE
        self.payout_step = PAYOUT_STEP
        self.opt_params = {}
        self.bet_modes = []
        for name in MODE_ORDER:
            buy = name.startswith("buy_")
            cost = BUY[BUY_KIND_OF[name]] if buy else MODES[name]["cost"]
            self.bet_modes.append(BetMode(
                name=name, cost=cost, rtp=self.rtp, max_win=self.wincap,
                auto_close_disabled=False,
                is_feature=False,      # chaque tour est un nouveau pari : le mode n'est pas « collant » (le joueur rechoisit Standard / Oracle+)
                is_buybonus=buy,
                distributions=make_distributions(name),
            ))

    def get_betmode(self, name):
        for bm in self.bet_modes:
            if bm.get_name() == name:
                return bm
        raise KeyError(name)

    def mode_cost(self, name):
        return self.get_betmode(name).get_cost()
