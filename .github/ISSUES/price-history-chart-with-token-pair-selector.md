# Price history chart with token pair selector

**Complexity**: medium

## Summary
The `/oracle` page shows latest prices as static cards. Add an interactive chart with a dropdown to select a token pair and display 24h price history.

## Acceptance criteria
- [ ] Token pair dropdown populated from `GET /api/v1/oracle`
- [ ] On selection, fetches `GET /api/v1/oracle/:base/:quote/history?hours=24`
- [ ] Recharts LineChart showing both `price` and `twapPrice` over time
- [ ] Time axis formatted as HH:mm

## Stellar Wave
Points: 150 | Complexity: 🟡 Medium
