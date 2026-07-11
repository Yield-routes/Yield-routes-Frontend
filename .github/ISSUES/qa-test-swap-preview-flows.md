# 🧪 QA: Manual testing of the swap quote and preview flows

**Labels**: `QA`, `good first issue`, `testing`, `help wanted`
**Complexity**: 🟢 Beginner — browser testing, no coding needed

## Summary
The `/swap` page fetches live quotes with price impact estimates and a 60-second TTL. The `/vault` page shows SEP-56 deposit/redeem previews. These need systematic manual testing.

## Test scenarios

### Swap page (/swap)
1. Select token pair, enter amount 1000, click "Get Quote"
2. Verify quote appears with: expectedOut, priceImpactBps, protocolFee, validUntil
3. Wait 65+ seconds without submitting → verify "Quote expired" behavior
4. Enter amount 0 → verify validation error before quote request
5. Enter negative amount → verify validation error
6. Switch token direction (⇅ button) → verify tokenIn/tokenOut swapped
7. Set slippage to 0.1%, then 1.0% → verify the value is reflected in the estimate panel

### Vault page (/vault)
1. Navigate to `/vault`
2. In "deposit" mode, enter 1000 in amount field
3. Verify "You will receive N shares" preview appears
4. Switch to "redeem" mode
5. Enter 1000 shares, verify "You will get back N USDC" appears
6. Enter 0 → verify disabled submit button
7. Enter wallet address shorter than 56 chars → verify submit stays disabled

### Oracle page (/oracle)
- [ ] Page loads without errors
- [ ] "No price data yet" message appears when no prices submitted
- [ ] Oracle documentation section renders correctly

## Deliverable
`docs/qa/swap-vault-test-report.md` with pass/fail for each test case.

## GrantFox
Points: 60 | Complexity: 🟢 Beginner
