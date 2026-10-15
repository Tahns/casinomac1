#!/usr/bin/env python3
"""Anubis Unchained — génération des books, tables de lookup et index.json au format math-sdk de Stake.

    python3 stake-math/run.py                          # 1000 books par mode (plafond), dans stake-math/library/
    python3 stake-math/run.py --books 200 --modes std,bonus_fury
    python3 stake-math/run.py --step 10                # garde-fou : arrondit le total d'un tour au multiple de 10 (sans effet : les gains sont des dixièmes)
    HOA_BIG=1 python3 stake-math/run.py --books 1000000   # VRAIE production : seulement lancée par l'utilisateur

PLAFOND : sans HOA_BIG=1 (ou ANUBIS_BIG=1), jamais plus de 1000 books par mode, quel que soit --books. Ce que ce script écrit avec le
plafond n'est qu'une démonstration du format : les poids sont tous égaux à 1, rien n'est optimisé. La table de production (poids
optimisés pour RTP 96,2 % par l'optimiseur de Stake) reste à produire par l'utilisateur avec la grosse simulation — voir README.md.
"""
import argparse
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import cap                      # noqa: E402
import game_config as C         # noqa: E402
import game_optimization        # noqa: E402
import verify                   # noqa: E402
from gamestate import GameState  # noqa: E402
from write_data import Library  # noqa: E402


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--books", type=int, default=1000, help="books par mode (plafonné à 1000 sans HOA_BIG=1)")
    ap.add_argument("--modes", default=",".join(C.MODE_ORDER), help="liste de modes séparés par des virgules")
    ap.add_argument("--seed", type=int, default=2026)
    ap.add_argument("--out", default=os.path.join(HERE, "library"), help="dossier library/ de sortie")
    ap.add_argument("--step", type=int, default=C.PAYOUT_STEP, choices=(1, 10),
                    help="pas d'arrondi du total : 1 = exact, sans arrondi (défaut ; conforme car tous les gains sont des multiples de 0,1) ; 10 = arrondi au multiple de 10")
    ap.add_argument("--prepare-optimizer", action="store_true", help="écrit aussi optimization_files/setup_<mode>.toml pour l'optimiseur Rust")
    args = ap.parse_args(argv)

    n = cap.cap(args.books)
    if n != args.books:
        print("Plafond : %d books demandés, %d générés par mode (HOA_BIG=1 lève le plafond ; réservé à l'utilisateur)." % (args.books, n))
    modes = [m for m in args.modes.split(",") if m]
    for m in modes:
        if m not in C.MODE_ORDER:
            ap.error("mode inconnu : %s (modes : %s)" % (m, ", ".join(C.MODE_ORDER)))

    config = C.GameConfig()
    game_optimization.OptimizationSetup(config)
    config.payout_step = args.step
    state = GameState(config, payout_step=args.step, seed=args.seed)
    lib = Library(args.out)
    files, compressed_all = {}, True
    t0 = time.time()
    for mode in modes:
        plan = state.criteria_plan(mode, n)
        writer, counts = lib.open_mode(mode), {}
        for sim, crit in enumerate(plan):
            book, desc, _ = state.run_spin(sim, mode, crit)
            writer.add(book, desc)
            counts[crit] = counts.get(crit, 0) + 1
        ev, wt, comp = writer.close()
        files[mode] = (ev, wt)
        compressed_all = compressed_all and comp
        cost = config.mode_cost(mode)
        print("%-10s %5d books  critères %s  coût x%s  (poids tous égaux, gain maximal et bonus sur-représentés : aucun RTP à en tirer)"
              % (mode, writer.count, counts, cost))
    lib.write_index(config, files)
    lib.write_fe_config(config)
    lib.write_math_config(config)
    if args.prepare_optimizer:
        for mode in modes:
            print("setup optimiseur :", lib.write_setup_toml(config, mode))
    if not compressed_all:
        print("ATTENTION : aucun compresseur zstd disponible (module compression.zstd, zstandard, pyzstd ou commande zstd) : "
              "les books publiés sont en .jsonl NON compressé ; le RGS exige .jsonl.zst. `pip install zstandard` puis relancer.")
    bad = verify.verify_library(lib.publish, payout_step=args.step)
    print("Contrôle de format : %s" % ("conforme" if not bad else "%d anomalies" % len(bad)))
    for b in bad[:20]:
        print("  -", b)
    print("Écrit dans %s en %.1f s (payout_step=%d)" % (args.out, time.time() - t0, args.step))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
