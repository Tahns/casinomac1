"""Contrôles de format d'une bibliothèque générée — reprise des vérifications de utils/rgs_verification.py du math-sdk.

  - index.json : forme stricte { "modes": [ { name, cost, events, weights } ] }, fichiers présents ;
  - lookup : trois entiers non signés par ligne, payout multiple de 10 et >= 10 s'il n'est pas nul ;
  - books : id, events, payoutMultiplier présents, payoutMultiplier == colonne 3 de la lookup (même suite d'entiers), <= plafond ;
  - chaque book commence par roundStart et finit par finalWin dont `amount` == payoutMultiplier.
Renvoie la liste des anomalies (vide = conforme).
"""
import io
import json
import os

import game_config as C


def _open_text(path):
    """Ouvre un .jsonl ou .jsonl.zst en flux de texte ; lève RuntimeError si aucun décompresseur zstd n'est disponible."""
    if not path.endswith(".zst"):
        return open(path, encoding="utf-8")
    try:
        from compression import zstd   # type: ignore
        return io.TextIOWrapper(zstd.open(path, "rb"), encoding="utf-8")
    except Exception:
        pass
    try:
        import zstandard   # type: ignore
        return io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(open(path, "rb")), encoding="utf-8")
    except Exception:
        pass
    raise RuntimeError("impossible de décompresser %s (aucun module zstd)" % path)


def iter_books(path):
    with _open_text(path) as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def read_books(path):
    return list(iter_books(path))


def verify_library(publish_dir, payout_step=None, books_by_mode=None):
    step = C.PAYOUT_STEP if payout_step is None else payout_step
    bad = []
    idx_path = os.path.join(publish_dir, "index.json")
    with open(idx_path, encoding="utf-8") as f:
        index = json.load(f)
    if list(index.keys()) != ["modes"]:
        bad.append("index.json : clés inattendues %r" % list(index.keys()))
    for m in index["modes"]:
        if sorted(m.keys()) != ["cost", "events", "name", "weights"]:
            bad.append("index.json : clés du mode %s : %r" % (m.get("name"), sorted(m.keys())))
        for k in ("events", "weights"):
            if not os.path.exists(os.path.join(publish_dir, m[k])):
                bad.append("fichier manquant : %s" % m[k])
        if not isinstance(m["cost"], float):
            bad.append("%s : cost doit être un flottant" % m["name"])
        pay = []
        with open(os.path.join(publish_dir, m["weights"]), encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split(",")
                if len(parts) != 3 or not all(p.isdigit() for p in parts):
                    bad.append("%s : ligne lookup invalide %r" % (m["name"], line))
                    break
                payout = int(parts[2])
                if payout > 0 and payout < 10:
                    bad.append("%s : payout non nul < 10" % m["name"])
                if payout % 10:   # règle du SDK, quel que soit le pas d'arrondi choisi
                    bad.append("%s : payout %d non multiple de 10" % (m["name"], payout))
                pay.append(payout)
        if books_by_mode is not None and m["name"] in books_by_mode:
            books = iter(books_by_mode[m["name"]])
        else:
            try:
                books = iter_books(os.path.join(publish_dir, m["events"]))
            except RuntimeError:
                continue
        n_books = 0
        for i, b in enumerate(books):
            n_books += 1
            if i >= len(pay) or b["payoutMultiplier"] != pay[i]:
                bad.append("%s : payoutMultiplier du book %s != lookup" % (m["name"], b.get("id")))
                break
            if b["id"] != i + 1:
                bad.append("%s : id %r attendu %d" % (m["name"], b["id"], i + 1))
                break
            if not (isinstance(b["payoutMultiplier"], int) and 0 <= b["payoutMultiplier"] <= C.WINCAP_INT):
                bad.append("%s : payout hors plage dans le book %d" % (m["name"], b["id"]))
            ev = b["events"]
            if not ev or ev[0]["type"] != "roundStart" or ev[-1]["type"] != "finalWin" or ev[-1]["amount"] != b["payoutMultiplier"]:
                bad.append("%s : book %d mal formé (roundStart/finalWin)" % (m["name"], b["id"]))
            if [e["seq"] for e in ev] != list(range(len(ev))):
                bad.append("%s : seq d'événements non consécutifs (book %d)" % (m["name"], b["id"]))
        else:
            if n_books != len(pay):
                bad.append("%s : %d books pour %d lignes de lookup" % (m["name"], n_books, len(pay)))
    return bad
