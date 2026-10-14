"""Chemins et chargements communs aux tests (unittest, bibliothèque standard seulement).

AUCUN test ne lit HOA_BIG / ANUBIS_BIG : ils ne dépassent jamais cap.LIMIT (1000) tours, books ou tirages.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                 # stake-math/
REPO = os.path.dirname(ROOT)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

PARITY_FILE = os.path.join(HERE, "parity_draws.json")


def load_parity(path=None):
    with open(path or PARITY_FILE, encoding="utf-8") as f:
        return json.load(f)
