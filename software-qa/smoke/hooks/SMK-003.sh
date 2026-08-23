#!/usr/bin/env bash
set -euo pipefail
node --input-type=module <<'JS'
import { analyze, SAMPLE, MOVES } from "./js/model.js";
const captures = {};
for (const m of MOVES) captures[m.id] = { landmarks: SAMPLE[m.id], shot: null };
const r = analyze(captures);
if (!r.scales || r.scales.length < 1) { console.error("no scales"); process.exit(1); }
if (!r.ratios["Thigh to lower leg"]) { console.error("missing thigh ratio"); process.exit(1); }
if (!String(r.disclaimer).toLowerCase().includes("not a medical")) { console.error("disclaimer"); process.exit(1); }
if (!r.hour) { console.error("no hour"); process.exit(1); }
console.log(JSON.stringify({
  hour: r.hour,
  notes: r.notes.length,
  scales: r.scales,
  ratios: r.ratios
}, null, 2));
JS
