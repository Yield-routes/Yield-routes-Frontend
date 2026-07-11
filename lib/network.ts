// ─── Stellar network constants ───────────────────────────────────────────────

export type NetworkId = 'testnet' | 'mainnet';

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  /** Soroban RPC endpoint */
  rpcUrl: string;
  /** Stellar network passphrase used for transaction signing */
  passphrase: string;
  /** Stellar Expert base URL for transaction/account links */
  explorerBase: string;
  /** Horizon REST API base */
  horizonUrl: string;
  /** Whether this is production — gates the confirmation modal */
  isProduction: boolean;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  testnet: {
    id: 'testnet',
    label: 'Testnet',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    explorerBase: 'https://stellar.expert/explorer/testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    isProduction: false,
  },
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    rpcUrl: 'https://mainnet.stellar.validationcloud.io/v1/YOUR_KEY',
    passphrase: 'Public Global Stellar Network ; September 2015',
    explorerBase: 'https://stellar.expert/explorer/public',
    horizonUrl: 'https://horizon.stellar.org',
    isProduction: true,
  },
};

/** The network baked in at build time from NEXT_PUBLIC_STELLAR_NETWORK */
export const BUILD_NETWORK: NetworkId =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

/** Quick helpers */
export const getNetwork = (id: NetworkId): NetworkConfig => NETWORKS[id];
export const isMainnet = (id: NetworkId): boolean => id === 'mainnet';

/** Build an explorer link for a transaction hash */
export const explorerTxLink = (network: NetworkId, txHash: string): string =>
  `${NETWORKS[network].explorerBase}/tx/${txHash}`;

/** Build an explorer link for an account address */
export const explorerAccountLink = (network: NetworkId, address: string): string =>
  `${NETWORKS[network].explorerBase}/account/${address}`;
