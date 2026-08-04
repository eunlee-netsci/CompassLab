#!/usr/bin/env python3
"""Bump the ?v= cache-busting token on every local CSS/JS reference.

GitHub Pages tells browsers to cache assets, so after a deploy a visitor
(or you) can keep running the OLD site.css / config.js for a while. Adding
a version token to the URL makes the browser treat it as a new file.

Run from the repo root whenever you change anything under assets/:

    python3 tools/bump_cache.py            # token = today's date
    python3 tools/bump_cache.py 20260804b  # or set it yourself

Then commit and push as usual.
"""
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
token = sys.argv[1] if len(sys.argv) > 1 else date.today().strftime("%Y%m%d")

# href="assets/css/site.css"  or  src="assets/js/site.js"   (with or without ?v=)
PAT = re.compile(r'((?:href|src)=")(assets/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?(")')

changed = 0
for p in sorted(ROOT.glob("*.html")):
    t = p.read_text(encoding="utf-8")
    new = PAT.sub(lambda m: f"{m.group(1)}{m.group(2)}?v={token}{m.group(3)}", t)
    if new != t:
        p.write_text(new, encoding="utf-8")
        changed += 1
        print("updated", p.name)

print(f"\ncache token = {token}  ({changed} file(s) updated)")
print("이제 git add -A && git commit && git push 하면 브라우저가 새 파일을 받아옵니다.")
