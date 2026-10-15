"""Books « forcés » : construction du gain maximal (critère `wincap`) par un script de tirages imposés.

Atteindre 25 000 x au hasard est hors de portée d'un échantillon (de l'ordre de 1 sur 10^8). Comme le SDK de Stake (critère
`wincap` + `force_wincap`), on le construit : on impose les tirages qui mènent au plafond, en passant par le MÊME moteur
(game_calculations) — c'est donc un vrai book du jeu, pas un faux. Chemin : roue sur un bonus (ou achat), Fureur d'Anubis
(8 %), trois DOUBLE de la couleur 0 (palier x8), bande Pesée x6 avec le plateau 1000 x désigné et gagnant :
1000 x 6 x 8 = 48 000 x, plafonné à 25 000 x.
"""
import game_config as C
from rng import ScriptedRng


def u_index(i, n):
    """Tirage u tel que floor(u * n) == i."""
    return (i + 0.5) / n


def u_weighted(table, value):
    """Tirage u tel que weighted(rng, table) renvoie `value` (milieu de son intervalle)."""
    s = 0
    for t in table:
        s += t[1]
    cum = 0
    for t in table:
        if t[0] == value:
            return (cum + t[1] / 2.0) / s
        cum += t[1]
    raise KeyError(value)


def fury_script():
    """Tirages de hand_options(rng) : turq (la couleur jouée), puis or et rubis (tirés pour la parité, sans effet)."""
    seg_double0 = [i for i, s in enumerate(C.HAND_SEGS) if s.get("d") == 0]
    seg_weigh = next(i for i, s in enumerate(C.HAND_SEGS) if s.get("b") == "weigh")
    n = len(C.HAND_SEGS)
    d0 = seg_double0[0], seg_double0[1]
    chain = [d0[0], d0[1], d0[0]]                                   # trois DOUBLE de la couleur 0 : palier x8
    turq = [u_index(i, n) for i in chain] + [u_index(seg_weigh, n)]  # puis la bande Pesée x6
    best = max(C.WEIGH_INT["std"], key=lambda e: e[0][1])[0]        # paire [60, 1000] en entiers
    turq += [u_weighted(C.WEIGH_INT["std"], best),                  # paire tirée
             0.25,                                                  # valeurs dans l'ordre : plume = 60, coeur = 1000
             0.75,                                                  # plateau le plus lourd : le coeur
             0.75]                                                  # plateau « choisi » du book : le coeur -> il gagne, 1000 x
    other = [u_index(1, n)]                                         # or / rubis : un nombre (6) et fin
    return turq + other + other


def wincap_script(mode_name):
    """Liste de tirages à imposer pour que le tour du mode `mode_name` paie exactement le plafond."""
    fury = fury_script()
    if mode_name in ("std", "plus"):
        bonus_idx = C.LAYOUT.index("scarab")
        return [0.9999,                      # pas d'Oracle (>= sa chance)
                u_index(bonus_idx, C.N),     # la roue s'arrête sur un bonus
                0.5,                         # pas de Sanctuaire (>= 4 %)
                0.01] + fury                 # Fureur d'Anubis (< 8 %)
    if mode_name == "bonus_fury":
        return fury
    return [0.01] + fury                     # achat d'un autre bonus, saisi par la Fureur (< 8 %)


def wincap_rng(mode_name, fallback_seed=1):
    return ScriptedRng(wincap_script(mode_name), fallback_seed=fallback_seed)
