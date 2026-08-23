#!/usr/bin/env python3
import json, re, sys
from pathlib import Path
from datetime import datetime
root = Path("/root/plaza-projects/prsut-movement-map")
html = (root/"index.html").read_text()
css = (root/"css/app.css").read_text()
js = (root/"js/app.js").read_text() + (root/"js/model.js").read_text()
pub = html + css + (root/"js/app.js").read_text() + (root/"README.md").read_text()
cases = []
def add(cid, ok, detail):
    cases.append({"id": cid, "ok": ok, "detail": detail})

add("SMK-001", "data-build" in html and "Movement Map" in html and "Step 1 of" not in html, "load markers")
add("SMK-002", "max-width: 280px" in css and ".actions" in css, "compact actions")
add("SMK-003", "Demo walkthrough" in html and "function analyze" in (root/"js/model.js").read_text() and "scales" in (root/"js/model.js").read_text(), "demo + analyze")
banned = ["Hermy", "Hormozi", "OpenCap", "MediaPipe"]
# MediaPipe may be in comments? check UI copy only
ui = html + (root/"js/app.js").read_text()
hits = [b for b in ["Hermy","Hormozi","Ian Stanley","Orzy"] if b in ui]
add("SMK-004", not hits, f"banned={hits}")
add("SMK-005", 'id="goDetails"' in html and "Continue" in html, "step1 continue")
failed = [c for c in cases if not c["ok"]]
stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
run = root/f"software-qa/runs/{stamp}"
run.mkdir(parents=True, exist_ok=True)
(run/"results.json").write_text(json.dumps({"cases": cases, "failed": len(failed)}, indent=2))
(run/"summary.md").write_text(f"failed={len(failed)} passed={len(cases)-len(failed)}\n")
print(run)
print("failed", len(failed))
for c in cases:
    print(c["id"], "PASS" if c["ok"] else "FAIL", c["detail"])
sys.exit(1 if failed else 0)
