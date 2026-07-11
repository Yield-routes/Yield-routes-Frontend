// ─── Shared domain types for YieldRoutes frontend ───────────────────────────
// These mirror the Prisma models + API response shapes from the backend.

export interface RouteQuote {
  id: string;
  onChainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  expectedOut: number;
  priceImpactBps: number;
  protocolFee: number;
  validUntil: string;
  executed: boolean;
  executedOut: number | null;
  createdAt: string;
  legs?: RouteLeg[];
}

export interface RouteLeg {
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  expectedOut: number;
  pool?: string;
  feeBps: number;
}

export interface RouteStats {
  totalQuotes: number;
  executedQuotes: number;
  totalVolumeIn: number;
  totalVolumeOut: number;
}

export interface VaultStats {
  asset: string;
  totalAssets: number;
  totalShares: number;
  sharePrice: number;
  harvestCount: number;
  isPaused: boolean;
  depositCount: number;
  withdrawCount: number;
  totalYieldHarvested: number;
}

export interface VaultDeposit {
  id: string;
  depositor: string;
  tokenId: string;
  amount: number;
  sharesIssued: number;
  txHash: string | null;
  createdAt: string;
}

export interface VaultWithdrawal {
  id: string;
  depositor: string;
  shares: number;
  amountOut: number;
  txHash: string | null;
  createdAt: string;
}

export interface HarvestEvent {
  id: string;
  yieldAmount: number;
  totalAssets: number;
  sharePrice: number;
  txHash: string | null;
  harvestedAt: string;
}

export interface PreviewResult {
  assets?: number;
  shares?: number;
}

export interface DepositorInfo {
  depositor: string;
  shares: number;
  sharePrice: number;
  estimatedValue: number;
  deposits: VaultDeposit[];
}

export interface RegisteredPool {
  id: string;
  tokenA: string;
  tokenB: string;
  poolAddress: string;
  active: boolean;
  createdAt: string;
}

export interface PriceSnapshot {
  id: string;
  baseToken: string;
  quoteToken: string;
  price: number;
  twapPrice: number;
  reporter: string;
  recordedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
  };
}

export interface ApiError {
  error: string;
  detail?: string;
  details?: unknown;
}

// UI store types
export type DrawerView = 'pools' | 'oracle' | 'profile' | null;

// Token definition
export interface Token {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
}
