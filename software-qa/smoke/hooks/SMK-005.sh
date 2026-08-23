#!/usr/bin/env bash
set -euo pipefail
html=$(cat index.html)
echo "$html" | grep -q 'id="welcome"'
echo "$html" | grep -q 'id="goDetails"'
echo "$html" | grep -q '>Continue<'
if echo "$html" | grep -q 'Step 1 of'; then echo "step text leaked"; exit 1; fi
echo "$html" | grep -q 'id="phone"'
echo "$html" | grep -q 'id="email"'
echo "$html" | grep -q 'id="consent"'
echo "step one ok"
