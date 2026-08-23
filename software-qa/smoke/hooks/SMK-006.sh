#!/usr/bin/env bash
set -euo pipefail
js=js/app.js
grep -q "createLandmarker" "$js"
grep -q 'createLandmarker("GPU")' "$js"
grep -q 'createLandmarker("CPU")' "$js"
grep -q "startCamera" "$js"
grep -q "useDemo" "$js"
echo "camera fallback ok"
