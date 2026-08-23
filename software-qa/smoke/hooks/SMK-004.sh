#!/usr/bin/env bash
set -euo pipefail
# Public copy only. CDN module URLs in js/app.js are not visitor-facing sentences.
ui=$(cat index.html README.md css/app.css)
for b in Hermy Hormozi OpenCap "Ian Stanley" Kermy Squirmy Mercermy MediaPipe; do
  if echo "$ui" | grep -q "$b"; then
    echo "banned: $b"
    exit 1
  fi
done
echo "public copy clean"
