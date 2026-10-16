"""Anubis Unchained — événements d'un book (ce que le front rejoue, dans l'ordre).

Tout ce que l'écran affiche est dans les événements : le front ne tire aucun nombre. Les noms et champs sont ceux de
tools/stake-export.js (lus par js/rgs.js : bookToRound), complétés par des champs additionnels (`index`, `spin`, `bonusEnd`, `plates`...).
Tous les montants sont des ENTIERS à l'échelle 100 (100 = 1,00 x la mise) sauf mention contraire.

Choix du joueur (FORMAT v2, en-tête de tools/stake-export.js) : toutes les variantes sélectionnables paient le même total.
  - Fureur d'Anubis : 3 variantes de couleur (color 0, 1, 2) ; seules les cases DOUBLE changent (même rôle, même palier, mêmes nombres).
  - Pesée : `weighReveal.variants[0|1]` (plume / cœur) ; le choix du joueur sélectionne la variante, le gain est identique.
  - Trésor / Sanctuaire : tout est tiré d'avance, la tuile touchée est neutre.
  - Profil (Prudent / Équilibré / Audacieux) : seul l'Équilibré est joué.
"""
import game_config as C

BONUS_EVENT_NAME = {"scarab": "scarab", "weigh": "weigh", "vault": "vault", "hand": "fury", "crypt": "sanctuary"}


class EventLog:
    def __init__(self):
        self.events = []

    def add(self, type_, **fields):
        e = {"seq": len(self.events), "type": type_}   # compteur d'événements (le SDK l'appelle « index » ; ici « seq » car wheelStop.index = case de la roue)
        e.update(fields)
        self.events.append(e)
        return e


def _vault_token(t):
    return t if isinstance(t, str) else int(t)


def _doubles():
    out = [[], [], []]
    for i, sg in enumerate(C.HAND_SEGS):
        if "d" in sg:
            out[sg["d"]].append(i)
    return out


DOUBLES = _doubles()


def fury_variant(spins, c):
    """Variante de couleur c d'un script de Fureur tiré pour la couleur 0 : mêmes rôles, cases DOUBLE de la couleur c (même total)."""
    out = []
    for k, s in enumerate(spins):
        if c == 0 or s["kind"] not in ("up", "wrong"):
            out.append(s)
            continue
        d = C.HAND_SEGS[s["idx"]]["d"]
        j = DOUBLES[d].index(s["idx"])
        col = c if s["kind"] == "up" else (c + d) % 3      # wrong : d vaut 1 ou 2, donc jamais c
        t = dict(s)
        t["idx"] = DOUBLES[col][(j + k + c) % 2]
        out.append(t)
    return out


def bonus_events(log, kind, b, nested=None, color=None):
    """Ajoute les événements d'un bonus (kind : scarab | weigh | vault | hand | crypt) au FORMAT v2 (tools/stake-export.js).
    `nested` : bande de la Fureur qui l'a lancé ; `color` : variante de couleur de cette Fureur."""
    extra = {"nested": nested, "color": color} if nested else {}
    if kind == "scarab":
        for k, ba in enumerate(b["balls"]):
            log.add("scarabDrop", ball=k + 1, path=ba["path"], slot=ba["slot"], win=ba["value"], **extra)
    elif kind == "weigh":
        pk = b["pick"]                                  # choix de référence du tirage (0 plume, 1 coeur)
        mine, other = b["mults"][pk], b["mults"][1 - pk]
        wins = b["heavy"] == pk
        win = mine if wins else 0
        variants = []
        for q in (0, 1):                                # variante q : le joueur touche le plateau q ; même valeur du joueur, même résultat
            mu = b["mults"] if q == pk else ([mine, other] if q == 0 else [other, mine])
            variants.append({"pick": q, "mults": list(mu), "heavy": q if wins else 1 - q, "playerMult": mine, "playerWins": wins, "win": win})
        log.add("weighReveal", win=win, variants=variants, **extra)
    elif kind == "vault":
        for k, p in enumerate(b["picks"]):
            log.add("vaultPick", pick=k + 1, token=_vault_token(p["token"]), chestsLeft=p["left"], runningTotal=p["total"], **extra)
        log.add("vaultEnd", ended=b["ended"], finishBonus=b["bonus_finish"], win=b["total"], **extra)
    elif kind == "hand":
        for c in range(3):
            sps = fury_variant(b["spins"], c)
            for k, s in enumerate(sps):
                e = {"color": c, "spin": k + 1, "segment": s["idx"], "kind": s["kind"], "tier": s["mult"], "final": s["final"]}
                if s["kind"] == "num":
                    e["number"] = s["base"] * C.SCALE          # entier x100 comme tous les montants
                if s["kind"] == "band":
                    e["band"] = s["band"]
                    e["bandMult"] = s["x"]
                log.add("furySpin", **e)
                if s["kind"] == "band":
                    bonus_events(log, s["band"], s["bonus"], nested=s["band"], color=c)
            log.add("furyEnd", color=c, win=b["total"], pay=b["spins"][-1]["pay"])
    elif kind == "crypt":
        for k, st in enumerate(b["steps"]):
            log.add("sanctuaryTablet", tablet=k + 1, tablet_type=st["t"], value=st["v"], tideBefore=st["tide_before"], tide=st["tide"],
                    offeringBefore=st["pool_before"], gain=st["gain"], offering=st["pool"])
        log.add("sanctuaryEnd", offering=b["pool"], tide=b["tide"], capped=bool(b["capped"]), win=b["total"])


def book_events(rnd, payout_int):
    """Événements ordonnés d'un tour (dictionnaire rendu par game_calculations.play_mode)."""
    log = EventLog()
    log.add("roundStart", v=2, mode="bonus" if rnd["mode"] == "buy" else rnd["mode"], modeName=rnd.get("mode_name", rnd["mode"]), cost=C.S(rnd["cost"]),
            scale=C.SCALE, maxWin=C.WINCAP_INT, wincap=C.WINCAP_INT, cells=C.N)
    wr = rnd.get("wrath")
    if wr:   # Colère d'Anubis : les chaînes se brisent avant le premier tour (format v2, ajout compatible : tools/stake-export.js)
        log.add("wrath", level=wr["start"], mult=C.WRATH_LADDER[wr["start"]], ladder=list(C.WRATH_LADDER))
    for k, s in enumerate(rnd["spins"]):
        n = k + 1
        if s["oracle"]:
            log.add("oracle", spin=n, kind=s["oracle"]["kind"], boost=s["oracle"]["boost"], sealed=True, revealOn="wheelStop")
        if s["index"] >= 0:
            extra = {"wrath": s["wrath"]} if s.get("wrath") else {}
            log.add("wheelStop", spin=n, index=s["index"], kind=s["kind"], boost=s["boost"], respin=s["kind"] == "ankh", **extra)
            if s["oracle"]:
                log.add("oracleReveal", spin=n, kind=s["oracle"]["kind"], boost=s["oracle"]["boost"], hit=s["oracle"]["kind"] == s["kind"])
            if s.get("wrath_up"):
                log.add("wrathUp", spin=n, level=C.WRATH_LADDER.index(s["wrath_up"]), mult=s["wrath_up"])
        if s["bonus"] is not None:
            kind = s["bonus_kind"]
            log.add("bonusStart", spin=n, bonus=kind, name=BONUS_EVENT_NAME[kind], secret=bool(s["secret"]),
                    bought=rnd["mode"] == "buy", upgraded=bool(s["upgraded"]), kind=s["kind"], wheelKind=s["kind"])
            bonus_events(log, kind, s["bonus"])
            log.add("bonusEnd", spin=n, bonus=kind, win=s["base"])
        log.add("spinWin", spin=n, win=s["pay"], base=s["base"], boost=s["boost"], respin=s["kind"] == "ankh")
    log.add("finalWin", amount=payout_int, exact=rnd["total"], capped=bool(rnd["capped"]) or rnd["total"] >= C.WINCAP_INT)
    return log.events


def win_tier(total_int):
    """Palier de gain d'un book (clé « tier » des descripteurs) : les fences « epic » (>= 1000x) et « big » (100-999,9x) de
    game_optimization.py le cherchent pour imposer à la table la fréquence EXACTE des gros gains (exact.summary)."""
    if total_int >= C.WINCAP_INT:
        return "max"
    if total_int >= 1000 * C.SCALE:
        return "epic"
    if total_int >= 100 * C.SCALE:
        return "big"
    return "small" if total_int > 0 else "zero"


def describe_book(rnd):
    """Descripteurs « force » du book (optimiseur : fences par recherche de clés)."""
    kinds = []
    for s in rnd["spins"]:
        if s["bonus"] is not None:
            kinds.append(BONUS_EVENT_NAME[s["bonus_kind"]])
    out = {"bonus": "yes", "kind": kinds[-1]} if kinds else {"bonus": "no"}
    out["tier"] = win_tier(rnd["total"])
    out["wrath"] = "yes" if rnd.get("wrath") else "no"
    return out
