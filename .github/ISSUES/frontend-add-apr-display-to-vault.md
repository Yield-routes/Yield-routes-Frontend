# 📊 Frontend: Add estimated APR display to the vault stats panel

**Labels**: `frontend`, `enhancement`, `help wanted`
**Complexity**: 🟢 Beginner-to-Medium — React/Tailwind, basic math

## Summary
The vault stats panel shows `totalAssets`, `sharePrice`, and `harvestCount` but doesn't show an estimated APR (Annual Percentage Rate). Contributors and users want to know approximately what yield they're earning annually.

## What needs to be done

### APR calculation
Using available data from `GET /api/v1/vault` and `GET /api/v1/vault/harvests`:
```
APR estimate = (totalYieldHarvested / totalAssets) × (365 / days_since_first_harvest) × 100
```
If `totalAssets = 0` or no harvests yet, show "—" instead of dividing by zero.

### UI changes
1. Add a 5th stat card to the stats row: **"Est. APR"** showing the calculated percentage
2. Add a tooltip or small explanation (ℹ icon) next to "Est. APR" that says "Based on harvested yield since launch. Past performance does not indicate future returns."
3. Style: `text-yield-400` for the percentage number, gray for the label

## Files to modify
- `frontend/app/vault/page.tsx` — add 5th stat card and APR calculation

## Acceptance criteria
- [ ] APR card visible in the stats row
- [ ] Returns "—" gracefully when no data yet
- [ ] Tooltip present with disclaimer
- [ ] No division-by-zero errors in the console
- [ ] Looks correct on mobile and desktop
- [ ] Screenshot attached to PR

## GrantFox
Points: 100 | Complexity: 🟢 Beginner — frontend developers welcome
