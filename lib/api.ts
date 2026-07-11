import axios, { AxiosInstance } from 'axios';
import { useNetworkStore } from '@/lib/network-store';
import { toast } from '@/lib/toast-store';

// ─── API URL resolution ───────────────────────────────────────────────────────
// The API URL can be overridden per-network via env vars.
// Falls back to a single NEXT_PUBLIC_API_URL for simple single-backend setups.

function getApiBase(): string {
  const network = useNetworkStore.getState().network;
  if (network === 'mainnet') {
    return (
      process.env.NEXT_PUBLIC_API_URL_MAINNET ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:3004'
    );
  }
  return (
    process.env.NEXT_PUBLIC_API_URL_TESTNET ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3004'
  );
}

// Build a fresh axios instance pointing at the correct API base.
// Called on every request so network switches take effect immediately.
function makeHttp(): AxiosInstance {
  return axios.create({ baseURL: getApiBase(), timeout: 20_000 });
}

// ─── Network mismatch detection ───────────────────────────────────────────────
// After the first successful network-info call we cache the backend network
// and warn the user if it differs from their chosen frontend network.
let _backendNetworkChecked = false;

async function checkNetworkMismatch(http: AxiosInstance): Promise<void> {
  if (_backendNetworkChecked) return;
  try {
    const { data } = await http.get('/api/v1/network');
    const frontendNetwork = useNetworkStore.getState().network;
    if (data.network && data.network !== frontendNetwork) {
      toast.warning(
        'Network mismatch',
        `Frontend is on ${frontendNetwork} but the API is on ${data.network}. ` +
        `Set STELLAR_NETWORK=${frontendNetwork} on the backend.`,
      );
    }
    _backendNetworkChecked = true;
  } catch {
    // Backend unreachable — don't spam the warning
    _backendNetworkChecked = true;
  }
}

// Reset the check when the user switches networks so it re-validates
useNetworkStore.subscribe(() => { _backendNetworkChecked = false; });

// ─── API methods ─────────────────────────────────────────────────────────────

function http() {
  const instance = makeHttp();
  // Fire-and-forget mismatch check on first call
  checkNetworkMismatch(instance);
  return instance;
}

export const api = {
  // ── Network ────────────────────────────────────────────────────────────────
  getNetworkInfo: () =>
    http().get('/api/v1/network').then(r => r.data),

  // ── Routes ─────────────────────────────────────────────────────────────────
  getQuote: (tokenIn: string, tokenOut: string, amountIn: number, maxHops = 3) =>
    http().post('/api/v1/routes/quote', { tokenIn, tokenOut, amountIn, maxHops }).then(r => r.data),
  executeRoute: (quoteId: string, sender: string, minOut: number) =>
    http().post('/api/v1/routes/execute', { quoteId, sender, minOut }).then(r => r.data),
  listRouteQuotes: (page = 1) =>
    http().get('/api/v1/routes', { params: { page } }).then(r => r.data),
  getRouteStats: () =>
    http().get('/api/v1/routes/stats').then(r => r.data),

  // ── Vault (SEP-56) ─────────────────────────────────────────────────────────
  getVaultStats: () =>
    http().get('/api/v1/vault').then(r => r.data),
  getSharePrice: () =>
    http().get('/api/v1/vault/share-price').then(r => r.data),
  previewDeposit: (assets: number) =>
    http().get('/api/v1/vault/preview-deposit', { params: { assets } }).then(r => r.data),
  previewRedeem: (shares: number) =>
    http().get('/api/v1/vault/preview-redeem', { params: { shares } }).then(r => r.data),
  listDeposits: (page = 1) =>
    http().get('/api/v1/vault/deposits', { params: { page } }).then(r => r.data),
  listHarvests: () =>
    http().get('/api/v1/vault/harvests').then(r => r.data),
  getDepositorInfo: (address: string) =>
    http().get(`/api/v1/vault/depositor/${address}`).then(r => r.data),
  deposit: (depositor: string, amount: number) =>
    http().post('/api/v1/vault/deposit', { depositor, amount }).then(r => r.data),
  redeem: (depositor: string, shares: number) =>
    http().post('/api/v1/vault/redeem', { depositor, shares }).then(r => r.data),
  triggerHarvest: (grossYield: number) =>
    http().post('/api/v1/vault/harvest', { grossYield }).then(r => r.data),

  // ── Pools ──────────────────────────────────────────────────────────────────
  listPools: () =>
    http().get('/api/v1/pools').then(r => r.data),
  getPool: (tokenA: string, tokenB: string) =>
    http().get(`/api/v1/pools/${tokenA}/${tokenB}`).then(r => r.data),
  registerPool: (tokenA: string, tokenB: string, poolAddress: string) =>
    http().post('/api/v1/pools/register', { tokenA, tokenB, poolAddress }).then(r => r.data),

  // ── Oracle ─────────────────────────────────────────────────────────────────
  listLatestPrices: () =>
    http().get('/api/v1/oracle').then(r => r.data),
  getPrice: (baseToken: string, quoteToken: string) =>
    http().get(`/api/v1/oracle/${baseToken}/${quoteToken}`).then(r => r.data),
  getPriceHistory: (baseToken: string, quoteToken: string, hours = 24) =>
    http().get(`/api/v1/oracle/${baseToken}/${quoteToken}/history`, { params: { hours } }).then(r => r.data),
  submitPrice: (baseToken: string, quoteToken: string, price: number, reporter: string) =>
    http().post('/api/v1/oracle/submit', { baseToken, quoteToken, price, reporter }).then(r => r.data),
};
