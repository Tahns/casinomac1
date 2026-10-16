"""Calcul EXACT du RTP, de l'écart-type, du taux de gain et des prix d'achat — aucun tirage.

Port de tools/rtp-exact.js : moments d'ordre 1 et 2 de chaque bonus (énumération / récurrence), puis de la roue avec l'Oracle,
la Fureur d'Anubis (8 %) et le Sanctuaire des Marées (4 %). Les tables sont celles de game_config (en x la mise, flottants), comme
dans le JS : les résultats doivent coïncider à 1e-9 près avec ceux de tools/rtp-exact.js (tests/test_exact.py).
Résultats AVEC le plafond (loi exacte : distribution / summary) ; moments sans plafond dans « uncapped ». Colère d'Anubis comprise.
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
BUY_MODE = {"scarab": "bonus_scarab", "weigh": "bonus_weigh", "vault": "bonus_vault", "hand": "bonus_fury"}
SRC_NAME = {"num": "cases ×", "scarab": "Scarabées", "weigh": "Pesée", "vault": "Trésor", "hand": "Fureur", "crypt": "Sanctuaire"}


def cell_counts(wrath):
    """Cases où la roue peut finir un tour (sans les Ankh) ; pendant la Colère d'Anubis, seulement C.WRATH_KINDS."""
    return {k: d["count"] for k, d in C.KINDS.items() if not (d["respin"] or (wrath and k not in C.WRATH_KINDS))}


def wrath_ladder():
    """Loi EXACTE du multiplicateur final de la Colère : cran de départ (WRATH_START) + nombre L d'Ankh avant la case finale.
    Sur la roue de la Colère, P(Ankh) = a ; L < MAX_CHAIN : a^L (1 - a) ; L = MAX_CHAIN : a^MAX_CHAIN (la dernière relance est retirée hors Ankh)."""
    n = sum(1 for k in C.LAYOUT if k in C.WRATH_KINDS)
    a = C.KINDS["ankh"]["count"] / n
    ws = sum(t[1] for t in C.WRATH_START)
    pm = {}
    for st in C.WRATH_START:
        for l in range(C.MAX_CHAIN + 1):
            pl = a ** l * (1 - a) if l < C.MAX_CHAIN else a ** C.MAX_CHAIN
            m = C.WRATH_LADDER[min(st[0] + l, C.WRATH_TOP)]
            pm[m] = pm.get(m, 0.0) + st[1] / ws * pl
    return [[m, pm[m]] for m in C.WRATH_LADDER if pm.get(m)]


@functools.lru_cache(maxsize=None)
def compute():
    """Résultats exacts (mis en cache : à ne pas modifier). RTP, écart-type et taux de gain AVEC plafond (loi exacte, summary) ;
    moments sans plafond dans « uncapped » et décomposition par source dans « comps »."""
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
    w = sum(t[1] for t in C.ORACLE_KIND_W)

    def spin_components(qo, wrath):
        cc = cell_counts(wrath)
        nn = sum(cc.values())
        out = []
        for k, cnt in cc.items():
            d = C.KINDS[k]
            pk = cnt / nn
            wk = sum(t[1] for t in C.ORACLE_KIND_W if t[0] == k)
            b = wmom(C.ORACLE_BOOST["bonus" if d["bonus"] else "num"])
            po = qo * wk / w
            if d["bonus"]:
                parts = [[k, (1 - s) * (1 - h), bon[k]["std"], 0.5 if k == "weigh" else 1], ["hand", (1 - s) * h, hh, 1], ["crypt", s, cm, 1]]
            else:
                parts = [["num", 1, [d["mult"], d["mult"] * d["mult"]], 1 if d["mult"] > 0 else 0]]
            for pt in parts:
                out.append({"src": pt[0], "kind": k, "oracle": False, "p": pk * pt[1] * (1 - po), "m1": pt[2][0], "m2": pt[2][1], "hit": pt[3]})
                if po:
                    out.append({"src": pt[0], "kind": k, "oracle": True, "p": pk * pt[1] * po, "m1": pt[2][0] * b[0], "m2": pt[2][1] * b[1], "hit": pt[3]})
        return out

    def round_(md):
        qw = md.get("wrath", 0) or 0
        comps = []
        for c in spin_components(md["oracle"], False):
            c["p"] *= 1 - qw
            c["wrath"] = 1
            comps.append(c)
        if qw:
            for mult, pm in wrath_ladder():
                for c in spin_components(md["oracle"], True):
                    c["p"] *= qw * pm
                    c["wrath"] = mult
                    c["m1"] *= mult
                    c["m2"] *= mult * mult
                    comps.append(c)
        e = e2 = hit = pb = 0.0
        for c in comps:
            e += c["p"] * c["m1"]
            e2 += c["p"] * c["m2"]
            hit += c["p"] * c["hit"]
            if c["src"] != "num":
                pb += c["p"]
        return {"mean": e, "sd": math.sqrt(e2 - e * e), "hit": hit, "bonusProb": pb, "comps": comps}

    std, plus = round_(C.MODES["std"]), round_(C.MODES["plus"])
    ss, sp = summary("std"), summary("plus")
    buy = {}
    for k in ("scarab", "weigh", "vault", "hand"):
        sm = summary(BUY_MODE[k])
        buy[k] = {"mean": sm["mean"], "sd": sm["sd"], "hit": sm["hit"], "price": C.BUY[k], "rtp": sm["mean"] / C.BUY[k],
                  "sdRel": sm["sd"] / C.BUY[k], "fair": sm["mean"] / 0.96}
    wl = wrath_ladder()
    cost = C.MODES["plus"]["cost"]
    return {
        "std": {"mean": ss["mean"], "sd": ss["sd"], "hit": ss["hit"]},
        "plus": {"mean": sp["mean"] / cost, "sd": sp["sd"], "sdRel": sp["sd"] / cost, "hit": sp["hit"]},
        "uncapped": {"std": {"mean": std["mean"], "sd": std["sd"], "hit": std["hit"]},
                     "plus": {"mean": plus["mean"] / cost, "sd": plus["sd"], "hit": plus["hit"]},
                     "buy": {"scarab": rep["scarab"], "weigh": rep["weigh"], "vault": rep["vault"], "hand": hh}},
        "buy": buy, "bonusEvery": 1 / std["bonusProb"], "bonus": bon, "hand": hh, "replaced": rep1, "crypt": cm,
        "wrath": {"ladder": wl, "mean": sum(x[0] * x[1] for x in wl), "m2": sum(x[0] * x[0] * x[1] for x in wl)},
        "comps": {"std": std["comps"], "plus": plus["comps"]},
    }


# ---------------------------------------------------------------------------------------------------------------------
# Loi EXACTE du gain d'un tour (port de la seconde moitié de tools/rtp-exact.js) : gains en DIXIÈMES de mise (entiers), plafonnés.
# Dictionnaires {gain en dixièmes : probabilité}, remplis dans le même ordre que les Map du JS (mêmes sommes, mêmes arrondis).
# ---------------------------------------------------------------------------------------------------------------------
CAPU = C.WINCAP * 10


def tenth(x):
    return int(math.floor(x * 10 + 0.5))


def d_add(d, v, p):
    if v > CAPU:
        v = CAPU
    d[v] = d.get(v, 0.0) + p


def d_scale(d, f):
    o = {}
    for v, p in d.items():
        d_add(o, v * f, p)
    return o


def d_mix(lst):
    o = {}
    for dist, wt in lst:
        for v, p in dist.items():
            d_add(o, v, p * wt)
    return o


def d_conv(a, b):
    o = {}
    for v, p in a.items():
        for w_, q in b.items():
            d_add(o, v + w_, p * q)
    return o


def scarab_dist(prof):
    one, bn = {}, [1, 8, 28, 56, 70, 56, 28, 8, 1]
    for i, x in enumerate(C.SCARAB_PROFILES[prof]):
        d_add(one, tenth(x), bn[i] / 256)
    return d_conv(d_conv(one, one), one)


def weigh_dist(prof):
    d, tab = {}, C.WEIGH_PROFILES[prof]
    sw = sum(t[1] for t in tab)
    for (a, b), wt in tab:
        p = wt / sw
        d_add(d, 0, p / 2)
        d_add(d, tenth(a), p / 4)
        d_add(d, tenth(b), p / 4)
    return d


def vault_dist(vp):
    pool = vp["tokens"] + [["seal", vp["seal"]]]
    wt = sum(t[1] for t in pool)
    wns = wt - vp["seal"]
    out, layer = {}, {(C.VAULT_BASE_PICKS, 0): 1.0}
    for i in range(C.VAULT_PICK_CAP):
        nxt = {}
        for (allowed, total), p in layer.items():
            if i >= allowed:
                d_add(out, tenth(total + C.VAULT_FINISH), p)
                continue
            for t in pool:
                k = t[0]
                pr = (0 if k == "seal" else t[1] / wns) if i < 2 else t[1] / wt
                if not pr:
                    continue
                if k == "seal":
                    d_add(out, tenth(total), p * pr)
                    continue
                al, tt = allowed, total
                if k == "key":
                    al = min(C.VAULT_PICK_CAP, allowed + C.VAULT_KEY_PICKS)
                elif k == "scepter":
                    tt = total * 2
                else:
                    tt = total + k
                nxt[(al, tt)] = nxt.get((al, tt), 0.0) + p * pr
        layer = nxt
    for (allowed, total), p in layer.items():
        d_add(out, tenth(total + C.VAULT_FINISH), p)
    return out


def hand_dist():
    segs, n = C.HAND_SEGS, len(C.HAND_SEGS)
    q = sum(1 for sg in segs if sg.get("d") == 0) / n
    bd = {"scarab": scarab_dist("std"), "weigh": weigh_dist("std"), "vault": vault_dist(C.VAULT_PROFILES["std"])}

    def seg(excl, m):
        lst = []
        for sg in segs:
            if sg.get("d") == 0 or (excl and "d" in sg):
                continue
            if "n" in sg:
                d = {}
                d_add(d, tenth(sg["n"]), 1)
            elif "d" in sg:
                d = {}
                d_add(d, tenth(C.HAND_MIN_N), 1)
            else:
                d = d_scale(bd[sg["b"]], sg["x"])
            lst.append([d_scale(d, m), 1])
        for e in lst:
            e[1] = 1 / len(lst)
        return d_mix(lst)

    parts = [[seg(False, 2 ** lv), q ** lv * (1 - q)] for lv in range(C.HAND_MAX_CHAIN)]
    parts.append([seg(True, 2 ** C.HAND_MAX_CHAIN), q ** C.HAND_MAX_CHAIN])
    return d_mix(parts)


def crypt_dist():
    """Sanctuaire : propagation À REBOURS sur (E, F) = (produit des éclipses suivantes, offrande des tablettes suivantes pour une marée x1).
    Tablette : F += v·E ; marée xk : F *= k ; éclipse xe : E *= e ; gain = max(F, 1). Valeurs entières en x la mise, plafonnées à WINCAP."""
    wt = sum(t[1] for t in C.CRYPT_TYPES)
    pr = {t[0]: t[1] / wt for t in C.CRYPT_TYPES}
    vals = {}
    for k, tab in C.CRYPT_VALUES.items():
        sw = sum(t[1] for t in tab)
        vals[k] = [(t[0], pr[k] * t[1] / sw) for t in tab]
    cap, kk = C.WINCAP, 32768
    st = {1 * kk + 0: 1.0}
    pd = pr["dust"]
    for _ in range(C.CRYPT_CELLS):
        nx = {}
        g = nx.get
        for key, p in st.items():
            e, f = divmod(key, kk)
            nx[key] = g(key, 0.0) + p * pd
            base = e * kk
            for v, q in vals["tab"]:
                ff = f + v * e
                k2 = base + (ff if ff < cap else cap)
                nx[k2] = g(k2, 0.0) + p * q
            for v, q in vals["tide"]:
                ff = f * v
                k2 = base + (ff if ff < cap else cap)
                nx[k2] = g(k2, 0.0) + p * q
            for v, q in vals["eclipse"]:
                ee = e * v
                k2 = (ee if ee < cap else cap) * kk + f
                nx[k2] = g(k2, 0.0) + p * q
        st = nx
    out = {}
    for key, p in st.items():
        d_add(out, 10 * max(key % kk, 1), p)
    return out


@functools.lru_cache(maxsize=None)
def bonus_dists():
    h, s = C.HAND_UPGRADE, C.SECRET_UPGRADE
    hd, cd = hand_dist(), crypt_dist()
    o = {"hand": hd, "crypt": cd, "buy": {}, "wheel": {}}
    for k, d in (("scarab", scarab_dist("std")), ("weigh", weigh_dist("std")), ("vault", vault_dist(C.VAULT_PROFILES["std"]))):
        o[k] = d
        o["buy"][k] = d_mix([[d, 1 - h], [hd, h]])
        o["wheel"][k] = d_mix([[o["buy"][k], 1 - s], [cd, s]])
    o["buy"]["hand"] = hd
    return o


def spin_dist(qo, wrath):
    cc, bd = cell_counts(wrath), bonus_dists()
    wo = sum(t[1] for t in C.ORACLE_KIND_W)
    nn = sum(cc.values())
    lst = []
    for k, cnt in cc.items():
        d = C.KINDS[k]
        pk = cnt / nn
        wk = sum(t[1] for t in C.ORACLE_KIND_W if t[0] == k)
        tb = C.ORACLE_BOOST["bonus" if d["bonus"] else "num"]
        if d["bonus"]:
            base = bd["wheel"][k]
        else:
            base = {}
            d_add(base, tenth(d["mult"]), 1)
        po = qo * wk / wo
        lst.append([base, pk * (1 - po)])
        sb = sum(t[1] for t in tb)
        if po:
            for bv, bw in tb:
                lst.append([d_scale(base, bv), pk * po * bw / sb])
    return d_mix(lst)


@functools.lru_cache(maxsize=None)
def distribution(mode):
    """Loi exacte du gain d'un tour du mode (dixièmes de mise, plafonné) : std | plus | bonus_scarab | bonus_weigh | bonus_vault | bonus_fury."""
    if mode in C.BUY_KIND_OF:
        return bonus_dists()["buy"][C.BUY_KIND_OF[mode]]
    md = C.MODES[mode]
    qw = md.get("wrath", 0) or 0
    lst = [[spin_dist(md["oracle"], False), 1 - qw]]
    if qw:
        sw = spin_dist(md["oracle"], True)
        for mult, pm in wrath_ladder():
            lst.append([d_scale(sw, mult), qw * pm])
    return d_mix(lst)


# paliers de gain (x la mise, bornes incluses), identiques à TIERS de tools/rtp-exact.js
TIERS = [["0", 0, 0], ["<1", 0.1, 0.9], ["1-10", 1, 9.9], ["10-100", 10, 99.9], ["100-1000", 100, 999.9], ["1000+", 1000, C.WINCAP - 0.1],
         ["max", C.WINCAP, C.WINCAP]]


def mode_cost(mode):
    return C.BUY[C.BUY_KIND_OF[mode]] if mode in C.BUY_KIND_OF else C.MODES[mode]["cost"]


@functools.lru_cache(maxsize=None)
def summary(mode):
    d, cost = distribution(mode), mode_cost(mode)
    e = e2 = 0.0
    tiers = {t[0]: {"p": 0.0, "mean": 0.0} for t in TIERS}
    bounds = [(t[0], tenth(t[1]), tenth(t[2])) for t in TIERS]
    for v, p in d.items():
        x = v / 10
        e += p * x
        e2 += p * x * x
        for name, lo, hi in bounds:
            if lo <= v <= hi:
                tiers[name]["p"] += p
                tiers[name]["mean"] += p * x
    for t in tiers.values():
        t["rtp"] = t["mean"] / cost
        t["mean"] = t["mean"] / t["p"] if t["p"] else 0.0
    sd = math.sqrt(e2 - e * e)
    return {"mode": mode, "cost": cost, "mean": e, "rtp": e / cost, "sd": sd, "sdRel": sd / cost, "zero": d.get(0, 0.0),
            "hit": 1 - d.get(0, 0.0), "tiers": tiers, "support": len(d)}


def at_least(mode, x):
    """Probabilité exacte d'un gain d'au moins x fois la mise (plafond compris)."""
    lim = tenth(x)
    return sum(p for v, p in distribution(mode).items() if v >= lim)


def table_floor_sd(mode, cuts):
    """Écart-type MINIMAL d'une table dont chaque palier [cuts[i], cuts[i+1]) garde sa probabilité et son gain moyen exacts (inégalité de Jensen :
    quel que soit le façonnage de l'optimiseur à l'intérieur des paliers). cuts en x la mise, croissants, le dernier au-delà du plafond."""
    d = distribution(mode)
    ps, s1 = [0.0] * len(cuts), [0.0] * len(cuts)
    mu = 0.0
    for v, p in d.items():
        x = v / 10
        mu += p * x
        for i in range(len(cuts) - 1, -1, -1):
            if v >= tenth(cuts[i]):
                ps[i] += p
                s1[i] += p * x
                break
    fl = sum(s1[i] * s1[i] / ps[i] for i in range(len(cuts)) if ps[i])
    return math.sqrt(max(fl - mu * mu, 0.0))


def _fence_stats(d):
    p = sum(d.values())
    if p <= 0:
        return {"p": 0.0, "mean": 0.0, "median": 0.0, "values": 0}
    mean = sum(v * q for v, q in d.items()) / p / 10
    cum, median = 0.0, 0.0
    for v in sorted(d):
        cum += d[v]
        if cum >= p / 2:
            median = v / 10
            break
    return {"p": p, "mean": mean, "median": median, "values": len(d)}


@functools.lru_cache(maxsize=None)
def fence_targets(mode):
    """Probabilité, gain moyen et médian EXACTS (x la mise) de chaque fence de l'optimiseur, dans l'ordre de priorité :
    wincap (= 25 000 x), 0, epic (>= 1000 x), big (100-999,9 x), bonus (bonus joué, < 100 x), basegame (cases nombre, < 100 x).
    En Standard / Oracle+, « basegame » = les cases nombre hors Colère (Oracle compris : au plus 3 x 25 = 75 x < 100 x) ; tout le reste
    sous 100 x vient d'un bonus. Aux achats, tout gain non nul sous 100 x est « bonus »."""
    d = distribution(mode)
    hi, lo = tenth(1000), tenth(100)
    parts = {"wincap": {}, "0": {}, "epic": {}, "big": {}, "small": {}}
    for v, p in d.items():
        key = "wincap" if v >= CAPU else "0" if v == 0 else "epic" if v >= hi else "big" if v >= lo else "small"
        parts[key][v] = p
    base = {}
    if mode not in C.BUY_KIND_OF:
        md = C.MODES[mode]
        qw = md.get("wrath", 0) or 0
        cc = cell_counts(False)
        nn = sum(cc.values())
        wo = sum(t[1] for t in C.ORACLE_KIND_W)
        tb = C.ORACLE_BOOST["num"]
        sb = sum(t[1] for t in tb)
        for k, cnt in cc.items():
            dk = C.KINDS[k]
            if dk["bonus"] or not dk["mult"]:
                continue
            pk = (1 - qw) * cnt / nn
            po = md["oracle"] * sum(t[1] for t in C.ORACLE_KIND_W if t[0] == k) / wo
            d_add(base, tenth(dk["mult"]), pk * (1 - po))
            if po:
                for bv, bw in tb:
                    d_add(base, tenth(dk["mult"]) * bv, pk * po * bw / sb)
    bonus = {v: max(p - base.get(v, 0.0), 0.0) for v, p in parts["small"].items()}
    bonus = {v: p for v, p in bonus.items() if p > 1e-18}
    out = {"wincap": _fence_stats(parts["wincap"]), "0": _fence_stats(parts["0"]), "epic": _fence_stats(parts["epic"]),
           "big": _fence_stats(parts["big"]), "bonus": _fence_stats(bonus)}
    if base:
        out["basegame"] = _fence_stats(base)
    return out


def decompose(mode):
    """Part de E[X²] (moments sans plafond) par source : cases, chaque bonus, Oracle, Colère d'Anubis."""
    out, e, e2 = {}, 0.0, 0.0
    for c in compute()["comps"][mode]:
        name = ("Colère · " if c["wrath"] > 1 else "") + SRC_NAME[c["src"]] + (" + Oracle" if c["oracle"] else "")
        o = out.setdefault(name, {"p": 0.0, "rtp": 0.0, "m2": 0.0})
        o["p"] += c["p"]
        o["rtp"] += c["p"] * c["m1"]
        o["m2"] += c["p"] * c["m2"]
        e += c["p"] * c["m1"]
        e2 += c["p"] * c["m2"]
    return {"mean": e, "var": e2 - e * e, "m2": e2, "parts": out}


def mode_rtp(name, res=None):
    """RTP exact (plafond compris) d'un mode (clé du jeu : std, plus, bonus_scarab...)."""
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
    import sys
    r = compute()
    print("Standard : RTP %.2f %%   écart-type %.2fx   taux de gain %.1f %%   bonus 1 / %.1f"
          % (r["std"]["mean"] * 100, r["std"]["sd"], r["std"]["hit"] * 100, r["bonusEvery"]))
    print("Oracle+  : RTP %.2f %%   écart-type %.2fx (rapporté au coût)   taux de gain %.1f %%"
          % (r["plus"]["mean"] * 100, r["plus"]["sdRel"], r["plus"]["hit"] * 100))
    for k, b in r["buy"].items():
        print("Achat %-6s prix %sx   RTP %.2f %%   écart-type %.1fx (%.2f x le prix)   taux de gain %.1f %%"
              % (k, b["price"], b["rtp"] * 100, b["sd"], b["sdRel"], b["hit"] * 100))
    print("Colère d'Anubis : 1 tour sur %.0f, multiplicateur moyen x%.2f" % (1 / C.MODES["std"]["wrath"], r["wrath"]["mean"]))
    if "--loi" in sys.argv:
        for m in C.MODE_ORDER:
            sm = summary(m)
            print("%-13s RTP %.3f %%  écart-type %.2fx  zéro %.2f %%  " % (m, sm["rtp"] * 100, sm["sd"], sm["zero"] * 100)
                  + "  ".join(">=%d 1/%.0f" % (x, 1 / at_least(m, x)) for x in (100, 1000, C.WINCAP) if at_least(m, x)))
