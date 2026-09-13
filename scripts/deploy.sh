#!/bin/bash
# deploy.sh — QA-gated deploy: fails FAST if the plan data is broken (times/durations/chain)
set -e
cd "$(dirname "$0")/.."
echo "▶ 1/3 QA…"
node scripts/qa.mjs
echo "▶ 2/3 commit…"
git add -A
git -c user.name=aphiwatkr -c user.email=aphiwatgo5@users.noreply.github.com commit -m "deploy: $(date +%F' '%H:%M) — QA-passed" || echo "(nothing to commit)"
echo "▶ 3/3 push…"
git push
echo "✅ pushed — GitHub Pages will deploy in ~1 min: https://aphiwatgo5.github.io/tokyo-trip-planner/"
