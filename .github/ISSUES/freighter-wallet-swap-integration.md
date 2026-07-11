# Freighter wallet swap integration

**Complexity**: medium

## Summary
The swap page on `/swap` calls the REST API. Production flow: build Soroban tx client-side, sign with Freighter, submit to RPC.

## Acceptance criteria
- [ ] `lib/stellar.ts`: `buildSwapTransaction(quoteOnChainId, sender, minOut)`
- [ ] Freighter `signTransaction()` integrated
- [ ] Swap result shown (actual output, slippage, tx link on Stellar Expert)
- [ ] Error states: wallet not connected, tx rejected, slippage exceeded

## Stellar Wave
Points: 150 | Complexity: 🟡 Medium
