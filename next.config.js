/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['recharts', '@stellar/stellar-sdk', 'date-fns'],
  },

  env: {
    // Single-backend setup — used when per-network URLs aren't set
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3004',

    // Per-network backend URLs — take precedence over the single URL above
    NEXT_PUBLIC_API_URL_TESTNET:
      process.env.NEXT_PUBLIC_API_URL_TESTNET ?? '',
    NEXT_PUBLIC_API_URL_MAINNET:
      process.env.NEXT_PUBLIC_API_URL_MAINNET ?? '',

    // Default network baked in at build time
    NEXT_PUBLIC_STELLAR_NETWORK:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet',

    // Contract IDs
    NEXT_PUBLIC_ROUTE_AGGREGATOR_ID:
      process.env.NEXT_PUBLIC_ROUTE_AGGREGATOR_ID ?? '',
    NEXT_PUBLIC_YIELD_VAULT_ID:
      process.env.NEXT_PUBLIC_YIELD_VAULT_ID ?? '',
    NEXT_PUBLIC_FEE_DISTRIBUTOR_ID:
      process.env.NEXT_PUBLIC_FEE_DISTRIBUTOR_ID ?? '',
    NEXT_PUBLIC_PRICE_ORACLE_ID:
      process.env.NEXT_PUBLIC_PRICE_ORACLE_ID ?? '',
  },
};
