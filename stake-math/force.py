"""Books « forcés » : construction du gain maximal (critère `wincap`) par un script de tirages imposés.

Atteindre 25 000 x au hasard est hors de portée d'un échantillon (de l'ordre de 1 sur 10^8). Comme le SDK de Stake (critère
`wincap` + `force_wincap`), on le construit : on impose les tirages qui mènent au plafond, en passant par le MÊME moteur
(game_calculations) — c'est donc un vrai book du jeu, pas un faux. Chemin : roue sur un bonus (ou achat), Fureur d'Anubis
(8 %), trois DOUBLE de la couleur 0 (palier x8), bande Pesée x6 avec le plateau le plus fort du pacte désigné et gagnant :
Balance 1000 x 6 x 8 = 48 000 x (Scribe 800 : 38 400 x ; Chacal 3000 : 144 000 x), plafonné à 25 000 x.
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


def pact_of(mode_name):
    """Pacte (profil des bandes de la Fureur) du mode ; les achats jouent le profil Équilibré."""
    return C.MODES[mode_name]["pact"] if mode_name in C.MODES else "std"


def best_weigh(prof):
    """Paire de la Pesée qui contient le plus gros plateau du profil (en entiers)."""
    return max(C.WEIGH_INT[prof], key=lambda e: e[0][1])[0]


def fury_script(prof="std"):
    """Tirages de hand_options(rng) : turq (la couleur jouée), puis or et rubis (tirés pour la parité, sans effet)."""
    seg_double0 = [i for i, s in enumerate(C.HAND_SEGS) if s.get("d") == 0]
    seg_weigh = next(i for i, s in enumerate(C.HAND_SEGS) if s.get("b") == "weigh")
    n = len(C.HAND_SEGS)
    d0 = seg_double0[0], seg_double0[1]
    chain = [d0[0], d0[1], d0[0]]                                   # trois DOUBLE de la couleur 0 : palier x8
    turq = [u_index(i, n) for i in chain] + [u_index(seg_weigh, n)]  # puis la bande Pesée x6
    best = best_weigh(prof)                                         # Balance : paire [60, 1000] en entiers
    turq += [u_weighted(C.WEIGH_INT[prof], best),                   # paire tirée
             0.25,                                                  # valeurs dans l'ordre : plume = la petite, coeur = la grande
             0.75,                                                  # plateau le plus lourd : le coeur
             0.75]                                                  # plateau « choisi » du book : le coeur -> il gagne, 1000 x
    other = [u_index(1, n)]                                         # or / rubis : un nombre (6) et fin
    return turq + other + other


def fury_prefix(mode_name):
    """Tirages qui mènent à la Fureur d'Anubis sans Colère ni Oracle (tour de base), ou par un achat."""
    if mode_name in C.MODES:                 # std, plus et les pactes (safe, bold, plus_safe, plus_bold)
        bonus_idx = C.LAYOUT.index("scarab")
        return [0.9999,                      # pas de Colère d'Anubis (>= sa chance)
                0.9999,                      # pas d'Oracle (>= sa chance)
                u_index(bonus_idx, C.N),     # la roue s'arrête sur un bonus
                0.5,                         # pas de Sanctuaire (>= 4 %)
                0.01]                        # Fureur d'Anubis (< 8 %)
    if mode_name == "bonus_fury":
        return []
    return [0.01]                            # achat d'un autre bonus, saisi par la Fureur (< 8 %)


def wincap_script(mode_name):
    """Liste de tirages à imposer pour que le tour du mode `mode_name` paie exactement le plafond."""
    return fury_prefix(mode_name) + fury_script(pact_of(mode_name))


def wincap_rng(mode_name, fallback_seed=1):
    return ScriptedRng(wincap_script(mode_name), fallback_seed=fallback_seed)


def tier_script(mode_name, tier):
    """Books d'exemple des paliers rares quand le plafond de 1000 tours est actif (démonstration du format, tests) : un chemin RÉEL du
    moteur, comme le gain maximal, sans tirage par rejet (qui coûterait ~10 000 tours par book « epic »). En production (HOA_BIG=1),
    gamestate tire ces books par rejet selon la loi naturelle du jeu.
      big  : Fureur, premier lancer sur le nombre 180 -> 180 x
      epic : Fureur, bande Pesée x6, plus gros plateau du pacte choisi et gagnant -> 6 000 x (Scribe 4 800 x, Chacal 18 000 x)
      zero : Fureur, bande Pesée x6, plateau choisi perdant -> 0 (achats : le seul chemin vers 0 hors Pesée achetée)"""
    n = len(C.HAND_SEGS)
    seg_weigh = next(i for i, s in enumerate(C.HAND_SEGS) if s.get("b") == "weigh")
    seg_180 = next(i for i, s in enumerate(C.HAND_SEGS) if s.get("n") == 180)
    prof = pact_of(mode_name)
    best = best_weigh(prof)
    other = [u_index(1, n)]                                         # or / rubis : un nombre (6) et fin
    if tier == "big":
        turq = [u_index(seg_180, n)]
    elif tier in ("epic", "zero"):
        turq = [u_index(seg_weigh, n), u_weighted(C.WEIGH_INT[prof], best), 0.25, 0.75, 0.75 if tier == "epic" else 0.25]
    else:
        raise KeyError(tier)
    return fury_prefix(mode_name) + turq + other + other


def tier_rng(mode_name, tier, fallback_seed=1):
    return ScriptedRng(tier_script(mode_name, tier), fallback_seed=fallback_seed)
