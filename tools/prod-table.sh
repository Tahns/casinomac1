#!/usr/bin/env bash
# Table de production d'Anubis Unchained : books (200 000 par mode) + optimiseur Rust de Stake, pour les 10 modes.
# À lancer par l'utilisateur (HOA_BIG=1 est réservé à lui). Usage : tools/prod-table.sh /chemin/vers/math-sdk [books_par_mode]
set -euo pipefail
SDK="${1:?chemin du math-sdk (git clone https://github.com/StakeEngine/math-sdk)}"; N="${2:-200000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; LIB="$SDK/games/anubis_unchained/library"
MODES="std plus safe bold plus_safe plus_bold bonus_scarab bonus_weigh bonus_vault bonus_fury"
cd "$ROOT"
node tools/tune-pacts.js && node tools/gen-stats.js && node tools/export-parity.js
python3 -m unittest discover -s stake-math/tests
HOA_BIG=1 python3 stake-math/run.py --books "$N" --prepare-optimizer --out "$LIB"
for m in $MODES; do
  echo "=== optimisation : $m"
  cp "$LIB/optimization_files/setup_$m.toml" "$SDK/optimization_program/src/setup.toml"
  (cd "$SDK/optimization_program" && cargo run --release)
done
python3 -c "import sys; sys.path.insert(0,'stake-math'); import verify; print(verify.verify_library('$LIB/publish_files'))"
echo "Terminé : contrôle ensuite RTP 96,2 % par mode avec l'outil de Stake, et écart-type Scribe < Balance < Chacal."
