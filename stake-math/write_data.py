"""Écriture des fichiers au format math-sdk / RGS de Stake (même arborescence que games/<jeu>/library/ du SDK) :

  library/books/books_<mode>.jsonl                  books bruts (une ligne JSON par book)
  library/lookup_tables/lookUpTable_<mode>.csv      n°, poids, payoutMultiplier   (3 entiers non signés, sans en-tête)
  library/forces/force_record_<mode>.json           descripteurs de books pour les fences de l'optimiseur (+ force.json)
  library/configs/math_config.json                  fichier lu par l'optimiseur Rust
  library/configs/config_fe_<jeu>.json              modes (coût, is_buybonus, RTP, plafond) pour le front
  library/publish_files/books_<mode>.jsonl.zst      ce qui part chez Stake (zstd ; repli .jsonl si aucun compresseur n'est disponible)
  library/publish_files/lookUpTable_<mode>_0.csv    table de poids (copie de la table brute tant que l'optimiseur n'a pas tourné)
  library/publish_files/index.json                  { "modes": [ { name, cost, events, weights } ] } — forme STRICTE exigée par le RGS

Dépendances : bibliothèque standard seulement. zstd (en flux) : module `compression.zstd` (Python 3.14), `zstandard`, `pyzstd` ou la commande
`zstd`, dans cet ordre ; sinon les books restent en .jsonl non compressé (à compresser avant l'envoi).
"""
import json
import os
import shutil
import subprocess

import game_config as C


def compress_file(src, dst):
    """Compresse src en zstd vers dst, en flux (les gros fichiers ne sont pas chargés en mémoire). Renvoie True si réussi."""
    try:
        from compression import zstd   # type: ignore  # Python >= 3.14
        with open(src, "rb") as fi, zstd.open(dst, "wb") as fo:
            shutil.copyfileobj(fi, fo, 1 << 20)
        return True
    except Exception:
        pass
    try:
        import zstandard   # type: ignore
        with open(src, "rb") as fi, open(dst, "wb") as fo:
            zstandard.ZstdCompressor().copy_stream(fi, fo)
        return True
    except Exception:
        pass
    try:
        import pyzstd   # type: ignore
        with open(src, "rb") as fi, open(dst, "wb") as fo:
            pyzstd.compress_stream(fi, fo)
        return True
    except Exception:
        pass
    exe = shutil.which("zstd")
    if exe:
        try:
            subprocess.run([exe, "-q", "-f", src, "-o", dst], check=True)
            return True
        except Exception:
            pass
    if os.path.exists(dst):
        os.remove(dst)
    return False


class ModeWriter:
    """Écrit les books d'un mode au fil de l'eau (aucun book gardé en mémoire : une production de millions de books tient)."""

    def __init__(self, lib, mode):
        self.lib, self.mode = lib, mode
        self.books_path = os.path.join(lib.books, "books_%s.jsonl" % mode)
        self.csv_path = os.path.join(lib.lookup, "lookUpTable_%s.csv" % mode)
        self.fb = open(self.books_path, "w", encoding="utf-8")
        self.fc = open(self.csv_path, "w", encoding="utf-8")
        self.recs = {}
        self.count = 0

    def add(self, book, desc):
        self.fb.write(json.dumps(book, ensure_ascii=False, separators=(",", ":")) + "\n")
        self.fc.write("%d,1,%d\n" % (book["id"], book["payoutMultiplier"]))
        key = tuple(sorted((str(k), str(v)) for k, v in desc.items()))
        r = self.recs.setdefault(key, {"timesTriggered": 0, "bookIds": []})
        r["timesTriggered"] += 1
        r["bookIds"].append(book["id"])
        self.count += 1

    def close(self):
        """Termine : compresse, copie la lookup en _0, écrit les forces. Renvoie (events_name, weights_name, compressé ?)."""
        self.fb.close()
        self.fc.close()
        lib, mode = self.lib, self.mode
        events_name = "books_%s.jsonl.zst" % mode
        comp = compress_file(self.books_path, os.path.join(lib.publish, events_name))
        if not comp:
            events_name = "books_%s.jsonl" % mode
            shutil.copyfile(self.books_path, os.path.join(lib.publish, events_name))
        weights_name = "lookUpTable_%s_0.csv" % mode
        shutil.copyfile(self.csv_path, os.path.join(lib.publish, weights_name))
        out = [{"search": [{"name": k, "value": v} for k, v in key], "timesTriggered": r["timesTriggered"], "bookIds": r["bookIds"]}
               for key, r in self.recs.items()]
        with open(os.path.join(lib.forces, "force_record_%s.json" % mode), "w", encoding="utf-8") as f:
            json.dump(out, f, indent=4)
        force_path = os.path.join(lib.forces, "force.json")
        try:
            with open(force_path, encoding="utf-8") as f:
                force = json.load(f)
        except Exception:
            force = {}
        keys = {}
        for key in self.recs:
            for k, v in key:
                keys.setdefault(k, set()).add(v)
        force[mode] = {k: sorted(v) for k, v in keys.items()}
        with open(force_path, "w", encoding="utf-8") as f:
            json.dump(force, f, indent=4)
        return events_name, weights_name, comp


class Library:
    def __init__(self, root):
        self.root = root
        self.books = os.path.join(root, "books")
        self.lookup = os.path.join(root, "lookup_tables")
        self.forces = os.path.join(root, "forces")
        self.configs = os.path.join(root, "configs")
        self.publish = os.path.join(root, "publish_files")
        self.optim = os.path.join(root, "optimization_files")
        for p in (self.books, self.lookup, self.forces, self.configs, self.publish, self.optim):
            os.makedirs(p, exist_ok=True)

    def open_mode(self, mode):
        return ModeWriter(self, mode)

    def write_mode(self, mode, books, descriptors):
        """Variante en bloc (tests, petits volumes) : books et descripteurs déjà en mémoire."""
        w = ModeWriter(self, mode)
        for b, d in zip(books, descriptors):
            w.add(b, d)
        return w.close()

    def write_index(self, config, files):
        """files : {mode: (events_name, weights_name)} ; forme stricte du RGS (aucune clé en plus)."""
        modes = []
        for bm in config.bet_modes:
            if bm.get_name() in files:
                ev, wt = files[bm.get_name()]
                modes.append({"name": bm.get_name(), "cost": float(bm.get_cost()), "events": ev, "weights": wt})
        with open(os.path.join(self.publish, "index.json"), "w", encoding="utf-8") as f:
            json.dump({"modes": modes}, f, indent=4)
        return modes

    def write_fe_config(self, config):
        info = {"gameID": config.game_id, "gameName": config.game_name, "rtp": config.rtp, "scale": config.scale,
                "wincap": config.wincap, "payoutStep": config.payout_step, "betModes": {}}
        for bm in config.bet_modes:
            info["betModes"][bm.get_name()] = {"cost": bm.get_cost(), "feature": bm.get_feature(), "buyBonus": bm.get_buybonus(),
                                               "rtp": bm.get_rtp(), "max_win": bm.get_wincap()}
        with open(os.path.join(self.configs, "config_fe_%s.json" % config.game_id), "w", encoding="utf-8") as f:
            json.dump(info, f, indent=4)

    def write_math_config(self, config):
        """math_config.json lu par optimization_program (copie de make_temp_math_config du SDK)."""
        js = {"game_id": config.game_id, "bet_modes": [], "fences": [], "dresses": [], "bias": []}
        for bm in config.bet_modes:
            mode = bm.get_name()
            if mode not in config.opt_params:
                continue
            obj = config.opt_params[mode]
            js["bet_modes"].append({"bet_mode": mode, "cost": bm.get_cost(), "rtp": bm.get_rtp(), "max_win": bm.get_wincap()})
            fences = []
            for name, fo in obj["conditions"].items():
                fi = {"name": name}
                for src, dst in (("av_win", "avg_win"), ("hr", "hr"), ("rtp", "rtp")):
                    if fo.get(src) is not None:
                        fi[dst] = str(fo[src])
                fi["identity_condition"] = {
                    "search": [{"name": str(k), "value": str(v)} for k, v in fo["force_search"].items()],
                    "win_range_start": fo["search_range"][0], "win_range_end": fo["search_range"][1], "opposite": False}
                fences.append(fi)
            js["fences"].append({"bet_mode": mode, "fences": fences})
            js["dresses"].append({"bet_mode": mode, "dresses": [
                {"fence": d["criteria"], "scale_factor": str(d["scale_factor"]),
                 "identity_condition_win_range": [d["win_range"][0], d["win_range"][1]], "prob": d["probability"]}
                for d in obj["scaling"]]})
            bias = obj.get("distribution_bias") or [{"criteria": "", "range": [0.0, 0.0], "prob": 0.0}]
            js["bias"].append({"bet_mode": mode, "bias": bias})
        with open(os.path.join(self.configs, "math_config.json"), "w", encoding="utf-8") as f:
            json.dump(js, f, indent=4)

    def write_setup_toml(self, config, mode, rust_threads=4):
        """setup.toml de l'optimiseur pour un mode (même clés que OptimizationExecution.run_opt_single_mode)."""
        p = dict(config.opt_params[mode]["parameters"])
        p.update({"game_name": config.game_id, "path_to_games": "../games/", "run_1000_batch": False, "bet_type": mode,
                  "threads_for_fence_construction": rust_threads, "threads_for_show_construction": rust_threads})
        lines = []
        for k, v in p.items():
            if isinstance(v, bool):
                lines.append("%s = %s" % (k, "true" if v else "false"))
            elif isinstance(v, (int, float)):
                lines.append("%s = %s" % (k, v))
            elif isinstance(v, str):
                lines.append('%s = "%s"' % (k, v))
            else:
                lines.append("%s = [ %s ]" % (k, ", ".join(str(x) for x in v)))
        path = os.path.join(self.optim, "setup_%s.toml" % mode)
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        return path
