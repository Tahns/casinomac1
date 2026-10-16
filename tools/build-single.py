# Construit un fichier HTML unique (CSS, polices, JS et images en data: URI). Usage : python3 -I tools/build-single.py sortie.html
import re, base64, sys, os
r = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
b64 = lambda p: base64.b64encode(open(r + p, 'rb').read()).decode()
html = open(r + 'index.html').read()
body = html[html.index('<canvas'):html.index('<script src="js/math.js">')]
css = re.sub(r"url\(['\"]?(\.\./)?fonts/([^)'\"]+)['\"]?\)", lambda m: 'url(data:font/woff2;base64,' + b64('fonts/' + m.group(2)) + ')', open(r + 'css/style.css').read() + open(r + 'css/rgs.css').read())
css = re.sub(r"url\(['\"]?\.\./img/([^)'\"]+)['\"]?\)", lambda m: 'url(data:image/' + ('webp' if m.group(1).endswith('webp') else 'jpeg') + ';base64,' + b64('img/' + m.group(1)) + ')', css)
js = ''
for n in ['build', 'math', 'rgs', 'art', 'chains', 'audio', 'fx', 'i18n', 'social', 'currency', 'grade', 'imgs', 'game', 'bonuses', 'stats', 'wrath', 'rules', 'main']:
    t = open(r + 'js/' + n + '.js').read()
    if n == 'imgs':
        t = re.sub(r"'img/([a-z_]+)\.(jpg|webp)'", lambda m: "'data:image/" + ('webp' if m.group(2) == 'webp' else 'jpeg') + ";base64," + b64('img/' + m.group(1) + '.' + m.group(2)) + "'", t)
    js += t + '\n'
open(sys.argv[1], 'w').write('<title>Anubis Unchained</title><style>' + css + '</style>' + body + '<script>' + js + '</script>')
