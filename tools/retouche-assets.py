#!/usr/bin/env python3
"""Retouche reproductible des images du jeu (bibliothèque standard + Pillow uniquement).

    python3 tools/retouche-assets.py            # img-src/*  ->  img/*
    python3 tools/retouche-assets.py --sheet /chemin/planche.png   # + planche-contact avant/après

Entrée : img-src/ (originaux Higgsfield bruts, jamais modifiés). Sortie : img/ (ce que charge le jeu).
Étalonnage commun, identique pour TOUTES les images, pour qu'elles forment une seule famille « Égypte antique sombre » :
  1. teintes : chaque teinte est ramenée vers la palette (or patiné, lapis-lazuli, turquoise, cornaline sourde, noir obsidienne) ;
     les teintes hors palette (violet, vert vif, bleu électrique, rouge sang, jaune citron) sont décalées et désaturées ;
     la saturation est plafonnée (pas de néon) ;
  2. courbe tonale en S douce + virage chaud dans les hautes lumières, noirs froids (lapis) dans les ombres ;
     les hautes lumières sont écrêtées sous le blanc pur (l'or ne « brûle » plus en jaune flashy) ;
  3. arêtes : filet clair (côté torche, haut-gauche) et filet sombre (bas-droite) calculés sur la luminance + netteté, comme un biseau gravé ;
  4. grain de pierre commun (bruit fin + bruit grossier, graine fixe => sortie déterministe), modulé par la luminance ;
  5. vignettage selon la catégorie ; 6. noir pur des logos détourés conservé (js/game.js `cutout` : alpha = max(R,V,B), seuil 10).
"""
import os, sys, random, math
from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DST = os.path.join(ROOT, 'img-src'), os.path.join(ROOT, 'img')

# catégories : icon (fond noir pur, détourage par luminance), ui (cadres/boutons, fond noir pur), scene (décors), texture, hero (médaillon, logo)
CAT = {
    'icon': dict(gain=1.2, vig=0.0, grain=0.55, bevel=0.55, sharp=70, floor=10, size=640, fmt='jpg'),
    'ui': dict(gain=1.0, vig=0.0, grain=0.45, bevel=0.50, sharp=60, floor=8, size=900, fmt='webp'),
    'hero': dict(gain=1.0, vig=0.0, grain=0.40, bevel=0.45, sharp=55, floor=6, size=1000, fmt='webp'),
    'scene': dict(gain=1.0, vig=0.55, grain=0.80, bevel=0.0, sharp=25, floor=0, size=1280, fmt='webp'),
    'texture': dict(gain=1.0, vig=0.0, grain=0.35, bevel=0.0, sharp=0, floor=0, size=512, fmt='jpg'),
}
OF = {  # fichier -> catégorie (les ic_*.jpg gardent leur nom : js/imgs.js)
    'abyss': 'scene', 'judgment': 'scene', 'key': 'scene', 'vault': 'scene', 'scarabwall': 'scene', 'splash': 'scene', 'splashp': 'scene',
    'bigwin': 'scene', 'hudframe': 'ui', 'plaque': 'ui', 'pill': 'ui', 'spinbtn': 'ui', 'logo': 'hero', 'medal': 'hero', 'fury': 'hero',
    'eye': 'icon', 'gold': 'texture',
}
# réglages propres à un fichier (teinte plus forte, etc.) : clé -> dict
TUNE = {
    'gold': dict(desat=0.85, dark=0.80), 'ic_pointer': dict(desat=0.9),
}

# --- teintes : (degrés source) -> (degrés cible, multiplicateur de saturation) -------------------------------------------------------------
HUE = [(0, 4, .62), (15, 22, .78), (30, 36, .92), (48, 42, .88), (62, 43, .55), (85, 45, .35), (110, 150, .40), (150, 168, .70),
       (170, 172, .92), (190, 190, .88), (205, 216, .85), (225, 224, .90), (245, 226, .72), (270, 226, .46), (300, 340, .34),
       (330, 355, .42), (360, 4, .62)]


def hue_luts(strength=1.0):
    hl, sl = [], []
    for v in range(256):
        d = v * 360.0 / 255.0
        for (a, ta, wa), (b, tb, wb) in zip(HUE, HUE[1:]):
            if a <= d <= b:
                t = (d - a) / (b - a) if b > a else 0
                nd = ta + (tb - ta) * t
                w = wa + (wb - wa) * t
                break
        hl.append(int(round((nd % 360) * 255.0 / 360.0)) % 256)
        sl.append(max(0, min(255, int(round(255 * (1 - strength * (1 - w)))))))  # poids 0..255
    return hl, sl


def curve(v, shadow_lift=0.0, hi=0.965):
    x = v / 255.0
    x = x ** 1.06                                   # un peu plus dense : patine
    x = x + 0.20 * (x - 0.5) * (1 - abs(2 * x - 1)) * 1.4   # S douce
    x = x * hi                                      # écrête le blanc : jamais de jaune brûlé
    return max(0.0, min(1.0, x + shadow_lift * (1 - x) ** 3))


def rng_noise(w, h, seed, k):
    r = random.Random(seed)
    nw, nh = max(1, w // k), max(1, h // k)
    im = Image.frombytes('L', (nw, nh), bytes(int(min(255, max(0, r.gauss(128, 38)))) for _ in range(nw * nh)))
    return im.resize((w, h), Image.BICUBIC) if k > 1 else im


def grade(im, cat, name, tune):
    c = CAT[cat]
    dark = tune.get('dark', 1.0)
    # 1. teintes
    hsv = im.convert('RGB').convert('HSV')
    H, S, V = hsv.split()
    hl, sl = hue_luts(tune.get('desat', 1.0))
    wmask = H.point(sl)
    H2 = H.point(hl)
    S2 = ImageChops.multiply(S, wmask).point(lambda s: int(min(s * 0.94, 214)))      # plafond de saturation : pas de néon
    # moins de saturation dans les très hautes lumières (reflets de l'or)
    hi_mask = V.point(lambda v: 0 if v < 200 else int((v - 200) * 2.2))
    S2 = ImageChops.subtract(S2, hi_mask.point(lambda m: int(m * 0.45)))
    out = Image.merge('HSV', (H2, S2, V)).convert('RGB')
    # 2. courbe tonale + virage (ombres lapis, hautes lumières or) ; noir pur conservé pour les logos
    lift = 0.0 if cat in ('icon', 'ui', 'hero') else 0.018
    base = [int(round(255 * curve(min(255, v * c['gain']), lift) * dark)) for v in range(256)]
    r = [int(min(255, b * 1.00 + 0)) for b in base]
    g = [int(min(255, b * 0.975)) for b in base]
    bl = [int(min(255, b * 0.90 + (6 if cat == 'scene' else 0) * (1 - b / 255.0) ** 2)) for b in base]
    out = Image.merge('RGB', (out.getchannel('R').point(r), out.getchannel('G').point(g), out.getchannel('B').point(bl)))
    # 3. arêtes : filet clair haut-gauche (torche), sombre bas-droite ; netteté
    if c['bevel'] > 0:
        L = out.convert('L').filter(ImageFilter.GaussianBlur(0.9))
        emb = L.filter(ImageFilter.Kernel((3, 3), (-1, -1, 0, -1, 0, 1, 0, 1, 1), 1, 128))   # 128 = plat
        amask = L.point(lambda v: 0 if v < 22 else min(255, (v - 22) * 5))
        lit = emb.point(lambda v: max(0, v - 128) * 3 if v > 128 else 0)
        shd = emb.point(lambda v: max(0, 128 - v) * 3 if v < 128 else 0)
        lit = ImageChops.multiply(lit, amask).point(lambda v: int(min(255, v) * c['bevel']))
        shd = ImageChops.multiply(shd, amask).point(lambda v: int(min(255, v) * c['bevel']))
        warm = Image.merge('RGB', (lit, lit.point(lambda v: int(v * 0.88)), lit.point(lambda v: int(v * 0.6))))
        out = ImageChops.subtract(ImageChops.add(out, warm), Image.merge('RGB', (shd, shd, shd)))
    if c['sharp']:
        out = out.filter(ImageFilter.UnsharpMask(radius=1.3, percent=c['sharp'], threshold=2))
    # 4. grain de pierre (graine fixe par fichier) ; module par la luminance : le noir pur reste pur
    w, h = out.size
    seed = sum(ord(ch) for ch in name) * 7919
    n = ImageChops.add(rng_noise(w, h, seed, 1), rng_noise(w, h, seed + 1, 3), 0.5, 0)
    n = n.point(lambda v: v)                                    # (déjà centré sur 128)
    gk = c['grain']
    nrgb = Image.merge('RGB', (n, n, n))
    shifted = ImageChops.subtract(nrgb, Image.new('RGB', (w, h), (128, 128, 128)))   # partie positive
    shifted_neg = ImageChops.subtract(Image.new('RGB', (w, h), (128, 128, 128)), nrgb)
    lum = out.convert('L').point(lambda v: min(255, int(v * 1.6)) if v > 12 else 0)
    pos = ImageChops.multiply(shifted, Image.merge('RGB', (lum, lum, lum))).point(lambda v: int(v * gk * 0.42))
    neg = ImageChops.multiply(shifted_neg, Image.merge('RGB', (lum, lum, lum))).point(lambda v: int(v * gk * 0.42))
    out = ImageChops.subtract(ImageChops.add(out, pos), neg)
    # 5. vignettage
    if c['vig']:
        rad = Image.radial_gradient('L').resize((w, h), Image.BICUBIC)       # 0 centre -> 255 bord
        vm = rad.point(lambda v: int(max(0, v - 70) * c['vig'] * 1.5))
        out = ImageChops.multiply(out, Image.merge('RGB', tuple(vm.point(lambda v: 255 - min(255, v)) for _ in range(3))))
    # 6. noir pur sous le seuil de détourage
    if c['floor']:
        f = c['floor']
        out = out.point(lambda v: 0 if v <= f else v)
    return out


ROUND = {'spinbtn': 0.985}


def round_edge(im, k):
    w, h = im.size; ss = 4
    m = Image.new('L', (w * ss, h * ss), 0)
    from PIL import ImageDraw
    r = min(w, h) * ss * k / 2.0
    ImageDraw.Draw(m).ellipse((w * ss / 2 - r, h * ss / 2 - r, w * ss / 2 + r, h * ss / 2 + r), fill=255)
    m = m.resize((w, h), Image.LANCZOS)
    return Image.composite(im, Image.new('RGB', (w, h), (0, 0, 0)), m)


def process(fn):
    name, ext = os.path.splitext(fn)
    cat = 'icon' if name.startswith('ic_') else OF.get(name, 'hero')
    c = CAT[cat]
    im = Image.open(os.path.join(SRC, fn)).convert('RGB')
    if max(im.size) > c['size']:
        k = c['size'] / float(max(im.size)); im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    out = grade(im, cat, name, TUNE.get(name, {}))
    if name in ROUND:   # bord net : masque circulaire sur-échantillonné (le disque d'origine a un bord en escalier)
        out = round_edge(out, ROUND[name])
    dst = os.path.join(DST, name + ('.jpg' if c['fmt'] == 'jpg' else '.webp'))
    if c['fmt'] == 'jpg':
        out.save(dst, 'JPEG', quality=88, optimize=True, subsampling=0 if cat == 'icon' else 2)
    else:
        out.save(dst, 'WEBP', quality=86, method=6)
    return name, dst, im, out


def ingest(folder):
    """Range des générations brutes (folder/<nom>.png) dans img-src/ : icônes en JPEG q95, le reste en WebP q92, 1024 px au plus."""
    os.makedirs(SRC, exist_ok=True)
    for fn in sorted(os.listdir(folder)):
        name, ext = os.path.splitext(fn)
        if ext.lower() != '.png':
            continue
        im = Image.open(os.path.join(folder, fn)).convert('RGB')
        if max(im.size) > 1024:
            k = 1024.0 / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        for old in (name + '.jpg', name + '.webp'):
            if os.path.exists(os.path.join(SRC, old)):
                os.remove(os.path.join(SRC, old))
        if name.startswith('ic_'):
            im.save(os.path.join(SRC, name + '.jpg'), 'JPEG', quality=95)
        else:
            im.save(os.path.join(SRC, name + '.webp'), 'WEBP', quality=92, method=6)
        print('ingéré', name, im.size)


def main():
    if '--ingest' in sys.argv:
        ingest(sys.argv[sys.argv.index('--ingest') + 1]); return
    os.makedirs(DST, exist_ok=True)
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(('.webp', '.jpg', '.png')))
    only = [a for a in sys.argv[1:] if not a.startswith('--') and not a.endswith('.png')]
    pairs, total = [], 0
    for fn in files:
        if only and os.path.splitext(fn)[0] not in only:
            continue
        name, dst, a, b = process(fn)
        total += os.path.getsize(dst)
        pairs.append((name, a, b))
        print('%-12s %s -> %d Ko' % (name, '%dx%d' % b.size, os.path.getsize(dst) // 1024))
    print('total img/ : %d Ko' % (total // 1024))
    if '--sheet' in sys.argv:
        from PIL import ImageDraw
        out = sys.argv[sys.argv.index('--sheet') + 1]
        T, cols = 200, 4
        rows = (len(pairs) + 1) // 2
        S = Image.new('RGB', (cols * T, ((len(pairs) * 2 + cols - 1) // cols) * (T + 14)), (70, 70, 70)); d = ImageDraw.Draw(S)
        for i, (name, a, b) in enumerate(pairs):
            for j, im in enumerate((a, b)):
                t = im.copy(); t.thumbnail((T - 4, T - 4)); k = i * 2 + j
                x, y = (k % cols) * T, (k // cols) * (T + 14)
                S.paste(t, (x + 2, y + 12)); d.text((x + 3, y), name + (' avant' if j == 0 else ' APRES'), fill=(255, 255, 255))
        S.save(out)


if __name__ == '__main__':
    main()
