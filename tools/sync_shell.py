#!/usr/bin/env python3
"""Copy the header and footer of index.html into every other page.

There is no build step on this site, so the nav bar is duplicated in each
HTML file. Change it in index.html, run this once, and every page matches:

    python3 tools/sync_shell.py

Only the <header class="site-header">…</header> and <footer class="site-footer">
…</footer> blocks are touched. admin.html is skipped (it has its own header).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"index.html", "admin.html", "404.html"}

HEADER_RE = re.compile(r'<header class="site-header">.*?</header>', re.S)
FOOTER_RE = re.compile(r'<footer class="site-footer">.*?</footer>', re.S)

src = (ROOT / "index.html").read_text(encoding="utf-8")
hm, fm = HEADER_RE.search(src), FOOTER_RE.search(src)
if not hm or not fm:
    sys.exit("index.html has no <header class=\"site-header\"> / <footer class=\"site-footer\">")
header, footer = hm.group(0), fm.group(0)

changed = 0
for p in sorted(ROOT.glob("*.html")):
    if p.name in SKIP:
        continue
    t = p.read_text(encoding="utf-8")
    new = FOOTER_RE.sub(lambda _: footer, HEADER_RE.sub(lambda _: header, t))
    if new != t:
        p.write_text(new, encoding="utf-8")
        changed += 1
        print("updated", p.name)

print(f"{changed} file(s) updated" if changed else "already in sync")
