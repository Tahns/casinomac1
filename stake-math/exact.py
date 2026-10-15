"""Calcul EXACT du RTP, de l'écart-type, du taux de gain et des prix d'achat — aucun tirage.

Port de tools/rtp-exact.js : moments d'ordre 1 et 2 de chaque bonus (énumération / récurrence), puis de la roue avec l'Oracle,
la Fureur d'Anubis (8 %) et le Sanctuaire des Marées (4 %). Les tables sont celles de game_config (en x la mise, flottants), comme
dans le JS : les résultats doivent coïncider à 1e-9 près avec ceux de tools/rtp-exact.js (tests/test_exact.py).
Hypothèses identiques au JS : gains non plafonnés (le plafond n'a d'effet qu'aux achats de la Fureur, < 0,01 point).
"""
import functools
import math

import game_config as C


def wmom(tab):
    s = sum(t[1] for t in tab)
    a = sum(t[1] * t[0] for t in tab)
    b = sum(t[1] * t[0] * t[0] for t in tab)
    return [a / s, b / s]


def type_probs():
    w = sum(t[1] for t in C.CRYPT_TYPES)
    return {t[0]: t[1] / w for t in C.CRYPT_TYPES}


def crypt_moments():
    """[E[gain], E[gain^2]] du Sanctuaire : état (P, T) -> moments m = [P^2, PT, T^2, P, T] ; 9 tablettes indépendantes."""
    pr = type_probs()
    vm = {k: wmom(C.CRYPT_VALUES[k]) for k in ("tab", "tide", "eclipse")}
    m = [0.0, 0.0, 1.0, 0.0, 1.0]
    for _ in range(C.CRYPT_CELLS):
        a, b, c, p, t = m
        v1, v2 = vm["tab"]
        k1, k2 = vm["tide"]
        e1, e2 = vm["eclipse"]
        m = [
            pr["dust"] * a + pr["tab"] * (a + 2 * v1 * b + v2 * c) + pr["tide"] * a + pr["eclipse"] * e2 * a,
            pr["dust"] * b + pr["tab"] * (b + v1 * c) + pr["tide"] * k1 * b + pr["eclipse"] * e1 * b,
            pr["dust"] * c + pr["tab"] * c + pr["tide"] * k2 * c + pr["eclipse"] * c,
            pr["dust"] * p + pr["tab"] * (p + v1 * t) + pr["tide"] * p + pr["eclipse"] * e1 * p,
            pr["dust"] * t + pr["tab"] * t + pr["tide"] * k1 * t + pr["eclipse"] * t,
        ]
    q = (1 - pr["tab"]) ** C.CRYPT_CELLS   # aucune tablette : offrande 0 relevée au plancher x1
    return [m[3] + q, m[0] + q]


def scarab(prof):
    v = C.SCARAB_PROFILES[prof]
    bn = [1, 8, 28, 56, 70, 56, 28, 8, 1]
    m1 = sum(bn[i] / 256 * x for i, x in enumerate(v))
    m2 = sum(bn[i] / 256 * x * x for i, x in enumerate(v))
    return [3 * m1, 3 * (m2 - m1 * m1) + 9 * m1 * m1]


def weigh(prof):
    tab = C.WEIGH_PROFILES[prof]
    s = sum(t[1] for t in tab)
    a = sum(t[1] * 0.5 * (t[0][0] + t[0][1]) / 2 for t in tab)
    b = sum(t[1] * 0.5 * (t[0][0] ** 2 + t[0][1] ** 2) / 2 for t in tab)
    return [a / s, b / s]


def vault_of(vp):
    pool = vp["tokens"] + [["seal", vp["seal"]]]
    w = sum(t[1] for t in pool)
    e = e2 = 0.0
    wns = w - vp["seal"]
    layer = {(C.VAULT_BASE_PICKS, 0): 1.0}   # (coffres permis, total) -> probabilité
    for i in range(C.VAULT_PICK_CAP):
        nxt = {}
        for (allowed, total), p in layer.items():
            if i >= allowed:
                f = total + C.VAULT_FINISH
                e += p * f
                e2 += p * f * f
                continue
            for t in pool:
                k = t[0]
                pr = (0 if k == "seal" else t[1] / wns) if i < 2 else t[1] / w
                if not pr:
                    continue
                if k == "seal":
                    e += p * pr * total
                    e2 += p * pr * total * total
                    continue
                al, tt = allowed, total
                if k == "key":
                    al = min(C.VAULT_PICK_CAP, allowed + C.VAULT_KEY_PICKS)
                elif k == "scepter":
                    tt = total * 2
                else:
                    tt = total + k
                nk = (al, tt)
                nxt[nk] = nxt.get(nk, 0.0) + p * pr
        layer = nxt
    for (allowed, total), p in layer.items():
        f = total + C.VAULT_FINISH
        e += p * f
        e2 += p * f * f
    return [e, e2]


def vault(prof):
    return vault_of(C.VAULT_PROFILES[prof])


FN = {"scarab": scarab, "weigh": weigh, "vault": vault}
PROFILES = ["safe", "std", "bold"]


@functools.lru_cache(maxsize=None)
def compute():
    """Résultats exacts (mis en cache : à ne pas modifier)."""
    h, s = C.HAND_UPGRADE, C.SECRET_UPGRADE
    bon = {k: {p: FN[k](p) for p in PROFILES} for k in ("scarab", "weigh", "vault")}
    segs, n, maxl = C.HAND_SEGS, len(C.HAND_SEGS), C.HAND_MAX_CHAIN

    def v_(excl):
        cnt, a, b = 0, 0.0, 0.0
        for sg in segs:
            if sg.get("d") == 0 or (excl and "d" in sg):
                continue
            cnt += 1
            if "n" in sg:
                a += sg["n"]
                b += sg["n"] ** 2
            elif "d" in sg:
                a += C.HAND_MIN_N
                b += C.HAND_MIN_N ** 2
            else:
                m = bon[sg["b"]]["std"]
                a += m[0] * sg["x"]
                b += m[1] * sg["x"] ** 2
        return [a / cnt, b / cnt]

    q = sum(1 for sg in segs if sg.get("d") == 0) / n
    v22, v18 = v_(False), v_(True)
    hh = [0.0, 0.0]
    for lv in range(maxl):
        pr = q ** lv * (1 - q)
        m = 2 ** lv
        hh[0] += pr * m * v22[0]
        hh[1] += pr * m * m * v22[1]
    pr, m = q ** maxl, 2 ** maxl
    hh[0] += pr * m * v18[0]
    hh[1] += pr * m * m * v18[1]
    rep, rep1 = {}, 0.0
    for k in ("scarab", "weigh", "vault"):
        rep[k] = [(1 - h) * bon[k]["std"][0] + h * hh[0], (1 - h) * bon[k]["std"][1] + h * hh[1]]
        rep1 += rep[k][0] / 3
    cm = crypt_moments()

    def on_wheel(k):
        return [(1 - s) * rep[k][0] + s * cm[0], (1 - s) * rep[k][1] + s * cm[1]]

    nn = C.N - C.KINDS["ankh"]["count"]
    w = sum(t[1] for t in C.ORACLE_KIND_W)

    def round_(qo):
        e = e2 = hit = 0.0
        classes = {"basegame": [0.0, 0.0], "bonus": [0.0, 0.0]}   # [probabilité, RTP] des classes de critères
        for k, d in C.KINDS.items():
            if d["respin"]:
                continue
            v = on_wheel(k) if d["bonus"] else [d["mult"], d["mult"] ** 2]
            pk = d["count"] / nn
            wk = sum(t[1] for t in C.ORACLE_KIND_W if t[0] == k)
            tb = C.ORACLE_BOOST["bonus" if d["bonus"] else "num"]
            po = qo * wk / w
            b = wmom(tb)
            mean_k = pk * ((1 - po) * v[0] + po * b[0] * v[0])
            e += mean_k
            e2 += pk * ((1 - po) * v[1] + po * b[1] * v[1])
            hit += pk * ((1 if k != "weigh" else 1 - 0.5 * (1 - s) * (1 - h)) if d["bonus"] else (1 if d["mult"] > 0 else 0))
            cls = "bonus" if d["bonus"] else "basegame"
            classes[cls][1] += mean_k
            classes[cls][0] += pk if (d["bonus"] or d["mult"] > 0) else 0
        return {"mean": e, "sd": math.sqrt(e2 - e * e), "hit": hit, "classes": classes}

    std, plus = round_(C.MODES["std"]["oracle"]), round_(C.MODES["plus"]["oracle"])
    buy = {k: {"mean": rep[k][0], "sd": math.sqrt(rep[k][1] - rep[k][0] ** 2)} for k in ("scarab", "weigh", "vault")}
    buy["hand"] = {"mean": hh[0], "sd": math.sqrt(hh[1] - hh[0] ** 2)}
    for k in buy:
        b = buy[k]
        b["price"] = C.BUY[k]
        b["rtp"] = b["mean"] / b["price"]
        b["sdRel"] = b["sd"] / b["price"]
        b["fair"] = b["mean"] / 0.96
        # taux de gain d'un achat : seule la Pesée (hors Fureur) peut payer 0 (une chance sur deux de perdre) ; le Sanctuaire n'existe pas à l'achat
        b["hit"] = (1 - 0.5 * (1 - h)) if k == "weigh" else 1.0
    return {
        "std": std,
        "plus": {"mean": plus["mean"] / C.MODES["plus"]["cost"], "sd": plus["sd"], "sdRel": plus["sd"] / C.MODES["plus"]["cost"],
                 "hit": plus["hit"], "classes": plus["classes"]},
        "buy": buy, "bonusEvery": nn / 3, "bonus": bon, "hand": hh, "replaced": rep1, "crypt": cm,
    }


def mode_rtp(name, res=None):
    """RTP exact d'un mode (clé du jeu : std, plus, bonus_scarab...)."""
    res = res or compute()
    if name == "std":
        return res["std"]["mean"]
    if name == "plus":
        return res["plus"]["mean"]
    return res["buy"][C.BUY_KIND_OF[name]]["rtp"]


def mode_hit(name, res=None):
    res = res or compute()
    if name == "std":
        return res["std"]["hit"]
    if name == "plus":
        return res["plus"]["hit"]
    return res["buy"][C.BUY_KIND_OF[name]]["hit"]


if __name__ == "__main__":
    r = compute()
    print("Standard : RTP %.2f %%   écart-type %.2fx   taux de gain %.1f %%   bonus 1 / %.1f"
          % (r["std"]["mean"] * 100, r["std"]["sd"], r["std"]["hit"] * 100, r["bonusEvery"]))
    print("Oracle+  : RTP %.2f %%   écart-type %.2fx (rapporté au coût)   taux de gain %.1f %%"
          % (r["plus"]["mean"] * 100, r["plus"]["sdRel"], r["plus"]["hit"] * 100))
    for k, b in r["buy"].items():
        print("Achat %-6s prix %sx   RTP %.2f %%   écart-type %.1fx (%.2f x le prix)   taux de gain %.1f %%"
              % (k, b["price"], b["rtp"] * 100, b["sd"], b["sdRel"], b["hit"] * 100))
