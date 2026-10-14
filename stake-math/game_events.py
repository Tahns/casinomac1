"""Anubis Unchained — événements d'un book (ce que le front rejoue, dans l'ordre).

Tout ce que l'écran affiche est dans les événements : le front ne tire aucun nombre. Les noms et champs sont ceux de
tools/stake-export.js (lus par js/rgs.js : bookToRound), complétés par des champs additionnels (`index`, `spin`, `bonusEnd`, `plates`...).
Tous les montants sont des ENTIERS à l'échelle 100 (100 = 1,00 x la mise) sauf mention contraire.

Choix du joueur (README, section « Choix du joueur ») : un book est un résultat figé, aucun choix ne change le gain.
  - Fureur d'Anubis : le script est écrit pour la couleur 0 = « la couleur choisie » ; le front fait pivoter les noms de couleurs
    (couleur affichée = (d + couleur choisie) mod 3 pour un segment DOUBLE de couleur relative d).
  - Pesée : les deux plateaux sont décrits (`plates`) ; `playerMult`, `playerWins` et `win` valent pour le plateau que le joueur touche
    (si c'est l'autre que `bookPick`, le front permute les deux plateaux : même loi, même gain).
  - Trésor / Sanctuaire : tout est tiré d'avance, la tuile touchée est neutre.
  - Profil (Prudent / Équilibré / Audacieux) : seul l'Équilibré est joué (`profileChoice.binding = false`).
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


def bonus_events(log, kind, b, nested=None):
    """Ajoute les événements d'un bonus (kind : scarab | weigh | vault | hand | crypt). `nested` : bande de la Fureur qui l'a lancé."""
    extra = {"nested": nested} if nested else {}
    if kind == "scarab":
        log.add("profileChoice", binding=False, profile=b["profile"], **extra)
        for k, ba in enumerate(b["balls"]):
            log.add("scarabDrop", ball=k + 1, path=ba["path"], slot=ba["slot"], win=ba["value"], **extra)
    elif kind == "weigh":
        pk = b["pick"]                                  # plateau du joueur tel que le book le fige (0 plume, 1 coeur)
        mine, other = b["mults"][pk], b["mults"][1 - pk]
        wins = b["heavy"] == pk
        log.add("profileChoice", binding=False, profile=b["profile"], **extra)
        log.add("weighReveal", mults=[mine, other], playerMult=mine, playerWins=wins, win=mine if wins else 0, bookPick=pk,
                plates={"feather": {"mult": b["mults"][0], "heavier": b["heavy"] == 0},
                        "heart": {"mult": b["mults"][1], "heavier": b["heavy"] == 1}},
                mirror="si le joueur touche l'autre plateau, permuter les deux plateaux (résultat inchangé)", **extra)
    elif kind == "vault":
        log.add("profileChoice", binding=False, profile=b["profile"], **extra)
        log.add("vaultStart", chests=C.VAULT_TILES, picks=C.VAULT_BASE_PICKS, keyPicks=C.VAULT_KEY_PICKS, pickCap=C.VAULT_PICK_CAP, **extra)
        for k, p in enumerate(b["picks"]):
            log.add("vaultPick", pick=k + 1, token=_vault_token(p["token"]), chestsLeft=p["left"], runningTotal=p["total"], **extra)
        log.add("vaultEnd", ended=b["ended"], finishBonus=b["bonus_finish"], win=b["total"], **extra)
    elif kind == "hand":
        log.add("furyColor", colourIndex=0, note="couleur du joueur = 0 ; le front fait pivoter les noms de couleurs", **extra)
        for k, s in enumerate(b["spins"]):
            seg = C.HAND_SEGS[s["idx"]]
            e = {"spin": k + 1, "segment": s["idx"], "kind": s["kind"], "tier": s["mult"], "final": s["final"]}
            if "d" in seg:
                e["doubleColour"] = seg["d"]            # 0 = couleur du joueur, 1 et 2 = les deux autres
            if s["kind"] == "num":
                e["number"] = s["base"]
            if s["kind"] == "band":
                e["band"] = s["band"]
                e["bandMult"] = s["x"]
            log.add("furySpin", **e)
            if s["kind"] == "band":
                bonus_events(log, s["band"], s["bonus"], nested=s["band"])
        log.add("furyEnd", win=b["total"])
    elif kind == "crypt":
        for k, st in enumerate(b["steps"]):
            log.add("sanctuaryTablet", tablet=k + 1, tablet_type=st["t"], value=st["v"], tideBefore=st["tide_before"],
                    offering=st["pool"], tide=st["tide"])
        log.add("sanctuaryEnd", offering=b["pool"], tide=b["tide"], win=b["total"])


def book_events(rnd, payout_int):
    """Événements ordonnés d'un tour (dictionnaire rendu par game_calculations.play_mode)."""
    log = EventLog()
    log.add("roundStart", mode=rnd["mode"], modeName=rnd.get("mode_name", rnd["mode"]), cost=C.S(rnd["cost"]),
            scale=C.SCALE, wincap=C.WINCAP_INT)
    for k, s in enumerate(rnd["spins"]):
        n = k + 1
        if s["oracle"]:
            log.add("oracle", spin=n, kind=s["oracle"]["kind"], boost=s["oracle"]["boost"], sealed=True, revealOn="wheelStop")
        if s["index"] >= 0:
            log.add("wheelStop", spin=n, index=s["index"], kind=s["kind"], boost=s["boost"], respin=s["kind"] == "ankh")
        if s["bonus"] is not None:
            kind = s["bonus_kind"]
            log.add("bonusStart", spin=n, bonus=kind, name=BONUS_EVENT_NAME[kind], secret=bool(s["secret"]),
                    bought=rnd["mode"] == "buy", upgraded=bool(s["upgraded"]), wheelKind=s["kind"])
            bonus_events(log, kind, s["bonus"])
            log.add("bonusEnd", spin=n, bonus=kind, win=s["base"])
        log.add("spinWin", spin=n, win=s["pay"], base=s["base"], boost=s["boost"], respin=s["kind"] == "ankh")
    log.add("finalWin", amount=payout_int, exact=rnd["total"], capped=bool(rnd["capped"]) or rnd["total"] >= C.WINCAP_INT)
    return log.events


def describe_book(rnd):
    """Descripteurs « force » du book (optimiseur : fences par recherche de clés)."""
    kinds = []
    for s in rnd["spins"]:
        if s["bonus"] is not None:
            kinds.append(BONUS_EVENT_NAME[s["bonus_kind"]])
    if kinds:
        return {"bonus": "yes", "kind": kinds[-1]}
    return {"bonus": "no"}
