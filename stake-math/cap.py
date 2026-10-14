"""Plafond de sécurité : jamais plus de 1000 tours / books / tirages, sauf demande explicite de l'utilisateur.

Équivalent Python de tools/cap.js. La variable d'environnement HOA_BIG=1 (ou ANUBIS_BIG=1, le nom utilisé par les outils Node)
lève le plafond : elle est réservée à l'utilisateur qui lance LUI-MÊME une vraie production. Les tests ne la lisent jamais
(ils appellent cap.cap(n, strict=True) ou ne dépassent jamais LIMIT).
"""
import os

LIMIT = 1000


def big_allowed():
    return os.environ.get("HOA_BIG") == "1" or os.environ.get("ANUBIS_BIG") == "1"


def cap(n, limit=LIMIT):
    """Renvoie n, plafonné à `limit` sauf si HOA_BIG=1."""
    n = int(n)
    return n if big_allowed() else min(n, limit)
