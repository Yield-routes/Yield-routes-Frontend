#!/usr/bin/env bash
# gh-setup.sh — Create labels and open pre-drafted issues for yield-routes-frontend
set -euo pipefail

REPO="Yield-routes/Yield-routes-Frontend"

echo "==> Creating labels in $REPO..."
gh label create "good first issue"  --color "7057ff" --description "Good for newcomers — no deep Soroban knowledge required"             --repo "$REPO" --force
gh label create "help wanted"       --color "008672" --description "Extra attention is needed"                                      --repo "$REPO" --force
gh label create "documentation"     --color "0075ca" --description "Improvements or additions to documentation"                     --repo "$REPO" --force
gh label create "bug"               --color "d73a4a" --description "Something isn't working"                                       --repo "$REPO" --force
gh label create "enhancement"       --color "a2eeef" --description "New feature or improvement to existing functionality"            --repo "$REPO" --force
gh label create "frontend"          --color "e4e669" --description "Frontend / Next.js / UI work"                                  --repo "$REPO" --force
gh label create "testing"           --color "f9d0c4" --description "Adding or improving tests"                                     --repo "$REPO" --force
gh label create "QA"                --color "fef2c0" --description "Quality assurance, exploratory testing"                        --repo "$REPO" --force
gh label create "design"            --color "e99695" --description "UI/UX design or visual improvements"                           --repo "$REPO" --force
echo "    Labels created."

echo ""
echo "==> Opening issues..."

ISSUES_DIR=".github/ISSUES"

declare -A ISSUE_MAP
ISSUE_MAP["freighter-wallet-swap-integration.md"]="Wallet signing integration on the /swap and /vault pages|frontend,enhancement"
ISSUE_MAP["frontend-add-apr-display-to-vault.md"]="Add estimated APR display to the vault stats panel|frontend,enhancement,good first issue,help wanted"
ISSUE_MAP["price-history-chart-with-token-pair-selector.md"]="Price history chart with token pair selector on /oracle|frontend,enhancement"
ISSUE_MAP["qa-test-swap-preview-flows.md"]="QA: manual testing of the swap quote and preview flows|QA,testing,good first issue,help wanted"

CREATED=0
for file in "${!ISSUE_MAP[@]}"; do
  IFS='|' read -r title labels <<< "${ISSUE_MAP[$file]}"
  body_file="$ISSUES_DIR/$file"
  if [[ ! -f "$body_file" ]]; then
    echo "    SKIP: $body_file not found"
    continue
  fi
  echo "    Creating: $title"
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body-file "$body_file" \
    --label "$labels"
  sleep 1
  ((CREATED++))
done

echo ""
echo "==> Summary: created $CREATED issue(s) in $REPO"
