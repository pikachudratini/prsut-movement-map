#!/usr/bin/env bash
set -euo pipefail
css="css/app.css"
grep -q "max-width: 280px" "$css"
grep -q "background-position: right 1rem center" "$css"
grep -q "padding: 0.8rem 2.85rem 0.8rem 0.95rem" "$css"
echo "compact + chevron ok"
