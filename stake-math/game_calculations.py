"""Anubis Unchained — calculs du jeu : copie fidèle, tirage par tirage, de js/math.js.

Règle d'or de la parité : chaque fonction consomme les nombres de rng() dans EXACTEMENT le même ordre que son équivalent JS.
Ainsi, deux moteurs alimentés par les mêmes tirages donnent les mêmes tours (tests/test_parity.py, tirages produits par
tools/export-parity.js). Tous les gains sont des ENTIERS à l'échelle SCALE = 100 (100 = 1,00 x la mise).

Les choix du joueur ne changent jamais un gain : voir la section « Choix du joueur » du README.
"""
import math

import game_config as C

SCALE = C.SCALE


# ---------------------------------------------------------------------------------------------------------------------
# Outils
# ---------------------------------------------------------------------------------------------------------------------
def weighted(rng, table):
    """table : [[valeur, poids], ...] — tirage pondéré, un seul rng() (comme weighted() de math.js)."""
    s = 0
    for t in table:
        s += t[1]
    r = rng() * s
    for t in table:
        r -= t[1]
        if r < 0:
            return t[0]
    return table[-1][0]


def to_int(x):
    return C.S(x)


def round_step(units, step=None):
    """Arrondit un payout entier (échelle 100) à un multiple de `step` (la moitié vers le haut). step=1 : exact."""
    step = C.PAYOUT_STEP if step is None else step
    if step <= 1 or units == 0:
        return units
    r = ((units + step // 2) // step) * step
    return max(r, step) if units > 0 else r


# ---------------------------------------------------------------------------------------------------------------------
# Oracle
# ---------------------------------------------------------------------------------------------------------------------
def roll_oracle(rng, chance):
    if rng() >= chance:
        return None
    kind = weighted(rng, C.ORACLE_KIND_W)
    is_bonus = C.KINDS[kind]["bonus"]
    return {"kind": kind, "boost": weighted(rng, C.ORACLE_BOOST["bonus" if is_bonus else "num"])}


# ---------------------------------------------------------------------------------------------------------------------
# Bonus 1 : Scarabées
# ---------------------------------------------------------------------------------------------------------------------
def scarab(rng, prof="std"):
    vals = C.SCARAB_INT[prof]
    balls, total = [], 0
    for _ in range(C.SCARAB_BALLS):
        path, col = [], 0
        for _ in range(C.SCARAB_ROWS):
            right = rng() < 0.5
            path.append(1 if right else 0)
            col += 1 if right else 0
        balls.append({"path": path, "slot": col, "value": vals[col]})
        total += vals[col]
    return {"balls": balls, "total": total, "profile": prof}


# ---------------------------------------------------------------------------------------------------------------------
# Bonus 2 : Pesée du Cœur
# ---------------------------------------------------------------------------------------------------------------------
def weigh_gain(data, pick):
    return data["mults"][pick] if pick == data["heavy"] else 0


def weigh(rng, prof="std"):
    pair = weighted(rng, C.WEIGH_INT[prof])
    mults = [pair[0], pair[1]] if rng() < 0.5 else [pair[1], pair[0]]   # valeurs attribuées au hasard à la plume (0) et au coeur (1)
    heavy = 0 if rng() < 0.5 else 1                                      # plateau le plus lourd : indépendant des valeurs
    data = {"pair": list(pair), "mults": mults, "heavy": heavy, "pick": 0, "total": 0, "profile": prof}
    data["total"] = weigh_gain(data, 0)
    return data


# ---------------------------------------------------------------------------------------------------------------------
# Bonus 3 : Chambre du Trésor
# ---------------------------------------------------------------------------------------------------------------------
def vault(rng, prof="std"):
    vp = C.VAULT_INT[prof]
    pool = vp["tokens"] + [["seal", vp["seal"]]]
    picks, total, allowed, ended = [], 0, C.VAULT_BASE_PICKS, "cleared"
    i = 0
    while i < allowed:
        tk = weighted(rng, pool)
        if i < 2 and tk == "seal":   # jamais de sceau sur les deux premiers choix
            while tk == "seal":
                tk = weighted(rng, pool)
        rec = {"token": tk, "total": 0, "left": 0}
        if tk == "seal":
            rec["total"], rec["left"] = total, 0
            picks.append(rec)
            ended = "seal"
            break
        elif tk == "key":
            allowed = min(C.VAULT_PICK_CAP, allowed + C.VAULT_KEY_PICKS)
        elif tk == "scepter":
            total *= 2
        else:
            total += tk
        rec["total"] = total
        rec["left"] = allowed - i - 1
        picks.append(rec)
        i += 1
    if ended == "cleared":
        total += C.VAULT_FINISH_INT   # prime « chambre vidée »
    return {"picks": picks, "ended": ended, "bonus_finish": C.VAULT_FINISH_INT if ended == "cleared" else 0,
            "total": total, "profile": prof}


# ---------------------------------------------------------------------------------------------------------------------
# Bonus 4 : Fureur d'Anubis
# ---------------------------------------------------------------------------------------------------------------------
BONUS_FN = {"scarab": scarab, "weigh": weigh, "vault": vault}


def hand_band(rng, seg):
    data = BONUS_FN[seg["b"]](rng, "std")
    if seg["b"] == "weigh":   # « pick » tiré d'avance (la scène JS laisse jouer, le book fige)
        data["pick"] = 0 if rng() < 0.5 else 1
        data["total"] = weigh_gain(data, data["pick"])
    return data


def hand_spin_pay(sp):
    if sp["kind"] == "num":
        return sp["base"] * SCALE * sp["mult"]   # « base » : le nombre du segment, en x la mise
    if sp["kind"] == "wrong":
        return C.HAND_MIN_N_INT * sp["mult"]
    if sp["kind"] == "band":
        return sp["bonus"]["total"] * sp["x"] * sp["mult"]
    return 0


def hand(rng, colour=0, forced=None):
    colour = colour or 0
    spins, mult, level, n = [], 1, 0, len(C.HAND_SEGS)
    for i in range(C.HAND_MAX_SPINS):
        if forced and i < len(forced):
            idx = forced[i]
            s = C.HAND_SEGS[idx]
        else:
            while True:
                idx = int(math.floor(rng() * n))
                s = C.HAND_SEGS[idx]
                if not (level >= C.HAND_MAX_CHAIN and "d" in s):   # palier maximal : on retire hors DOUBLE
                    break
        if "d" in s and s["d"] == colour and level < C.HAND_MAX_CHAIN:
            level += 1
            mult *= 2
            spins.append({"idx": idx, "kind": "up", "mult": mult, "final": False})
            continue
        rec = {"idx": idx, "mult": mult, "final": True}
        if "d" in s:
            rec["kind"] = "wrong"
        elif "b" in s:
            rec["kind"] = "band"
            rec["band"] = s["b"]
            rec["x"] = s["x"]
            rec["bonus"] = hand_band(rng, s)
        else:
            rec["kind"] = "num"
            rec["base"] = s["n"]
        spins.append(rec)
        break
    h = {"spins": spins, "mult": mult, "total": 0, "colour": colour}
    hand_recalc(h)
    return h


def hand_recalc(h):
    last = h["spins"][-1]
    last["pay"] = hand_spin_pay(last)
    h["total"] = min(last["pay"], C.WINCAP_INT)
    return h["total"]


def hand_options(rng):
    """Trois scripts indépendants et de même loi (un par couleur) : ils sont TOUS tirés pour garder la parité de la suite de
    tirages avec le JS ; seul celui de la couleur 0 (turq) est écrit dans le book — voir README, « Fureur d'Anubis »."""
    return {c: hand(rng, i) for i, c in enumerate(C.HAND_COLORS)}


# ---------------------------------------------------------------------------------------------------------------------
# Bonus SECRET : Sanctuaire des Marées
# ---------------------------------------------------------------------------------------------------------------------
def crypt_replay(drops):
    pool, tide, steps = C.CRYPT_START * SCALE, 1, []
    for dr in drops:
        st = {"t": dr["t"], "v": dr["v"], "pool_before": pool, "tide_before": tide, "gain": 0}
        if dr["t"] == "tab":
            st["gain"] = dr["v"] * tide
            pool = min(C.CRYPT_BIG_INT, pool + st["gain"])
        elif dr["t"] == "tide":
            tide = min(int(C.CRYPT_BIG), tide * dr["v"])
        elif dr["t"] == "eclipse":
            pool = min(C.CRYPT_BIG_INT, pool * dr["v"])
        st["pool"], st["tide"] = pool, tide
        steps.append(st)
    if pool < SCALE:
        pool = SCALE   # plancher : sans aucune tablette, l'offrande de consolation vaut x1
    return {"steps": steps, "pool": pool, "tide": tide, "capped": pool > C.WINCAP_INT, "total": min(pool, C.WINCAP_INT)}


def crypt(rng, forced=None):
    drops = []
    for i in range(C.CRYPT_CELLS):
        f = forced[i] if forced and i < len(forced) else None
        if f:
            t, v = f["t"], f.get("v", 0)
            if t == "tab":
                v = C.S(v)   # valeurs imposées en x la mise, comme dans le JS
        else:
            t = weighted(rng, C.CRYPT_TYPES)
            if t in C.CRYPT_VALUES:
                v = weighted(rng, C.CRYPT_VALUES[t])
                if t == "tab":
                    v = C.S(v)   # valeur d'une tablette : en x la mise, donc à l'échelle ; marées et éclipses sont des facteurs
            else:
                v = 0
        drops.append({"t": t, "v": v})
    r = crypt_replay(drops)
    return {"drops": drops, "steps": r["steps"], "pool": r["pool"], "tide": r["tide"], "capped": r["capped"],
            "total": r["total"], "profile": "crypt"}


# ---------------------------------------------------------------------------------------------------------------------
# Un tour de roue, un tour complet, un achat
# ---------------------------------------------------------------------------------------------------------------------
def draw_options(rng, kind):
    o = {"std": BONUS_FN[kind](rng, "std")}
    o["safe"] = BONUS_FN[kind](rng, "safe")
    o["bold"] = BONUS_FN[kind](rng, "bold")
    return o


def play_spin(rng, chance):
    oracle = roll_oracle(rng, chance)
    index = int(math.floor(rng() * C.N))
    kind = C.LAYOUT[index]
    d = C.KINDS[kind]
    boost = oracle["boost"] if (oracle and oracle["kind"] == kind) else 1
    s = {"oracle": oracle, "index": index, "kind": kind, "boost": boost, "bonus": None, "bonus_kind": None,
         "base": 0, "pay": 0, "secret": False, "upgraded": False, "options": None, "profile": None}
    if d["bonus"]:
        if rng() < C.SECRET_UPGRADE:        # Sanctuaire des Marées : prioritaire sur la Fureur, aucun choix
            s["secret"] = True
            s["bonus"] = crypt(rng)
            s["bonus_kind"] = "crypt"
            s["profile"] = "crypt"
        elif rng() < C.HAND_UPGRADE:        # Fureur d'Anubis
            s["options"] = hand_options(rng)
            s["bonus"] = s["options"]["turq"]
            s["bonus_kind"] = "hand"
            s["profile"] = "turq"
            s["upgraded"] = True
        else:
            s["options"] = draw_options(rng, kind)
            s["bonus"] = s["options"]["std"]
            s["bonus_kind"] = kind
            s["profile"] = "std"
        s["base"] = s["bonus"]["total"]
    elif not d["respin"]:
        s["base"] = d["mult_int"]
    s["pay"] = s["base"] * boost
    return s


def play_round(rng, mode="std"):
    md = C.MODES.get(mode) or C.MODES["std"]
    chance = md["oracle"]
    spins, total = [], 0
    for i in range(C.MAX_CHAIN + 1):
        s = play_spin(rng, chance)
        if s["kind"] == "ankh" and i == C.MAX_CHAIN:   # plus de relance possible : on retire
            while True:
                s = play_spin(rng, chance)
                if s["kind"] != "ankh":
                    break
        spins.append(s)
        total += s["pay"]
        if s["kind"] != "ankh":
            break
    capped = total > C.WINCAP_INT
    if capped:
        total = C.WINCAP_INT
    return {"spins": spins, "total": total, "capped": capped, "cost": md["cost"], "mode": "plus" if md is C.MODES["plus"] else "std"}


def play_buy(rng, kind):
    upgraded = False
    if kind == "hand" or rng() < C.HAND_UPGRADE:
        opts = hand_options(rng)
        b = opts["turq"]
        upgraded = True
    else:
        opts = draw_options(rng, kind)
        b = opts["std"]
    s = {"oracle": None, "index": -1, "kind": kind, "boost": 1, "bonus": b, "bonus_kind": "hand" if upgraded else kind,
         "upgraded": upgraded, "secret": False, "base": b["total"], "pay": b["total"], "options": opts,
         "profile": "turq" if upgraded else "std"}
    total = min(s["pay"], C.WINCAP_INT)
    return {"spins": [s], "total": total, "capped": s["pay"] > C.WINCAP_INT, "cost": C.BUY[kind], "mode": "buy"}


def play_mode(rng, mode_name):
    """Joue un tour dans un des 6 modes du jeu (std, plus, bonus_scarab, bonus_weigh, bonus_vault, bonus_fury)."""
    if mode_name in C.BUY_KIND_OF:
        r = play_buy(rng, C.BUY_KIND_OF[mode_name])
    else:
        r = play_round(rng, mode_name)
    r["mode_name"] = mode_name
    return r
