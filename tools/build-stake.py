# Build de production pour Stake « Files » (Front End) : dossier dist-stake/ + archive dist-stake.zip (ignorés par git).
# Usage : python3 -I tools/build-stake.py [dossier-de-sortie=dist-stake]
#  - index.html à la racine, puis js/ css/ img/ fonts/ : seulement les fichiers réellement référencés (index.html, css, js) ;
#    jamais de .md, .py, tools/, docs/, stake-math/, brand/ ;
#  - js/build.js devient « window.ANUBIS_BUILD = 'stake' » : sans sessionID / rgs_url ni replay, le jeu affiche
#    « Lancez le jeu depuis Stake » (aucune démo locale, aucun tirage dans le navigateur, aucun solde fictif) ;
#  - chemins relatifs uniquement, aucun hôte externe (vérifié), taille totale et liste des fichiers affichées ; sortie 1 au premier défaut.
import os, re, shutil, sys, zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'dist-stake')
ZIP = OUT + '.zip'
MAX_MB = 50          # garde-fou : un front de jeu ne doit pas approcher cette taille
TEXT = ('.html', '.js', '.css', '.json', '.svg')
ALLOWED_EXT = {'.txt', '.html', '.js', '.css', '.woff2', '.webp', '.jpg', '.png', '.svg', '.json'}
BUILD_JS = "/* Build flag written by tools/build-stake.py: production build for Stake (no local demo). */\nwindow.ANUBIS_BUILD = 'stake';\n"

errors = []
def fail(msg):
    errors.append(msg)
    print('ÉCHEC  ' + msg)

def rd(p):
    with open(os.path.join(ROOT, p), encoding='utf8') as f:
        return f.read()

html = rd('index.html')
files = {'index.html'}

def need(path, origin):
    path = os.path.normpath(path).replace(os.sep, '/')
    if path.startswith('..') or os.path.isabs(path):
        return fail('%s : chemin hors du dossier du jeu (%s)' % (origin, path))
    if not os.path.isfile(os.path.join(ROOT, path)):
        return fail('%s : fichier absent (%s)' % (origin, path))
    files.add(path)

# 1. index.html : feuilles de style, polices préchargées, scripts
for m in re.finditer(r'<(?:link|script)\b[^>]*?(?:href|src)="([^"]+)"', html):
    u = m.group(1)
    if u.startswith('data:'):
        continue
    if re.match(r'^[a-z][a-z0-9+.-]*:|^//|^/', u, re.I):
        fail('index.html : référence non relative (%s)' % u)
    else:
        need(u.split('?')[0], 'index.html')

# 2. CSS : url(...) relatifs au fichier css
for css in sorted(f for f in list(files) if f.endswith('.css')):
    for m in re.finditer(r'url\(\s*[\'"]?([^)\'"]+)[\'"]?\s*\)', rd(css)):
        u = m.group(1).strip()
        if u.startswith('data:') or u.startswith('#'):
            continue
        if re.match(r'^[a-z][a-z0-9+.-]*:|^//|^/', u, re.I):
            fail('%s : url non relative (%s)' % (css, u))
        else:
            need(os.path.join(os.path.dirname(css), u.split('?')[0].split('#')[0]), css)

# 3. JS : images / polices citées par leur chemin (js/imgs.js, game.js…)
for js in sorted(f for f in list(files) if f.endswith('.js')):
    for m in re.finditer(r"""['"`]((?:img|fonts)/[A-Za-z0-9_.\-/]+\.(?:webp|jpg|png|svg|woff2))['"`]""", rd(js)):
        need(m.group(1), js)

if os.path.exists(os.path.join(ROOT, 'fonts', 'OFL.txt')):
    files.add('fonts/OFL.txt')   # licence des polices embarquées

if errors:
    sys.exit(1)

# 4. copie (js/build.js réécrit)
if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)
for p in sorted(files):
    dst = os.path.join(OUT, p)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if p == 'js/build.js':
        with open(dst, 'w', encoding='utf8') as f:
            f.write(BUILD_JS)
    else:
        shutil.copyfile(os.path.join(ROOT, p), dst)

# 5. contrôles du résultat
total = 0
listing = []
for a, _, fs in os.walk(OUT):
    for f in fs:
        full = os.path.join(a, f)
        rel = os.path.relpath(full, OUT).replace(os.sep, '/')
        size = os.path.getsize(full)
        total += size
        listing.append((rel, size))
        ext = os.path.splitext(f)[1].lower()
        top = rel.split('/')[0]
        if ext not in ALLOWED_EXT:
            fail('type de fichier non prévu : ' + rel)
        if rel != 'index.html' and top not in ('js', 'css', 'img', 'fonts'):
            fail('fichier hors js/ css/ img/ fonts/ : ' + rel)
        if rel.endswith(('.md', '.py')) or '/tools/' in '/' + rel or top in ('docs', 'stake-math', 'tools', 'brand'):
            fail('fichier de développement dans le build : ' + rel)
        if ext in TEXT:
            with open(full, encoding='utf8') as fh:
                txt = fh.read()
            # aucun hôte externe : seuls les espaces de noms XML (w3.org) et les exemples de la documentation en commentaire sont admis
            for m in re.finditer(r'(?:https?://|(?<=["\'(=])//)([a-z0-9][a-z0-9.-]*\.[a-z]{2,})(?::\d+)?', txt, re.I):
                host = m.group(1).lower()
                if host.endswith('w3.org') or host.startswith('rgs.exemple') or host.startswith('rgs.example'):
                    continue
                line = txt[:m.start()].count('\n') + 1
                before = txt[txt.rfind('\n', 0, m.start()) + 1:m.start()]
                if re.match(r'^\s*(//|\*|/\*)', before) or re.search(r'(^|\s)//\s', before):
                    continue   # simple commentaire
                fail('hôte externe « %s » dans %s ligne %d' % (host, rel, line))
if not re.search(r"ANUBIS_BUILD = 'stake'", open(os.path.join(OUT, 'js/build.js'), encoding='utf8').read()):
    fail("js/build.js : le drapeau « stake » n'est pas écrit")
if not os.path.isfile(os.path.join(OUT, 'index.html')):
    fail('index.html absent à la racine')
if total > MAX_MB * 1024 * 1024:
    fail('taille totale %.1f Mo > %d Mo' % (total / 1048576.0, MAX_MB))
if errors:
    sys.exit(1)

# 6. archive (ordre et dates fixes : même contenu -> même zip)
if os.path.exists(ZIP):
    os.remove(ZIP)
order = sorted(listing, key=lambda x: (x[0] != 'index.html', x[0]))
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for rel, _ in order:
        zi = zipfile.ZipInfo(rel, date_time=(2026, 1, 1, 0, 0, 0))
        zi.compress_type = zipfile.ZIP_DEFLATED
        zi.external_attr = 0o644 << 16
        with open(os.path.join(OUT, rel), 'rb') as fh:
            z.writestr(zi, fh.read())

for rel, size in order:
    print('%9.1f Ko  %s' % (size / 1024.0, rel))
print('\n%d fichiers, %.2f Mo (zip : %.2f Mo)' % (len(order), total / 1048576.0, os.path.getsize(ZIP) / 1048576.0))
print('Dossier : ' + OUT)
print('Archive : ' + ZIP)
print('Build « stake » prêt : à déposer dans Stake (Files > Front End).')
