'use client';
import { useState, useCallback } from 'react';
import { useWalletStore, WalletProviderId } from '@/lib/wallet-store';
import { useNetworkStore } from '@/lib/network-store';
import { getNetwork } from '@/lib/network';
import { toast } from '@/lib/toast-store';

export interface TransactionPayload {
  xdr?: string;
  transactionXdr?: string;
  txXdr?: string;
}

export interface WalletSigner {
  address: string | null;
  provider: WalletProviderId | null;
  isConnected: boolean;
  isSigning: boolean;
  connect: (providerId?: WalletProviderId) => Promise<string | null>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  executeWithSigning: <T>(
    fetchXdr: (address: string) => Promise<TransactionPayload | Record<string, unknown>>,
    submitSigned: (signedXdr: string) => Promise<T>,
    actionName?: string,
  ) => Promise<T>;
}

export function useWalletSigner(): WalletSigner {
  const { address, provider, connect, disconnect, signTransaction: storeSignTx } = useWalletStore();
  const networkId = useNetworkStore((s) => s.network);
  const [isSigning, setIsSigning] = useState(false);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const netConfig = getNetwork(networkId);
      setIsSigning(true);
      try {
        const signed = await storeSignTx(xdr, netConfig.passphrase);
        return signed;
      } finally {
        setIsSigning(false);
      }
    },
    [networkId, storeSignTx],
  );

  const executeWithSigning = useCallback(
    async <T,>(
      fetchXdr: (address: string) => Promise<TransactionPayload | Record<string, unknown>>,
      submitSigned: (signedXdr: string) => Promise<T>,
      actionName = 'Transaction',
    ): Promise<T> => {
      if (!address) {
        toast.warning('Wallet Required', `Please connect your wallet before proceeding with ${actionName}.`);
        throw new Error('Wallet not connected');
      }

      setIsSigning(true);
      try {
        toast.info('Preparing Transaction', `Requesting transaction payload from network...`);
        const payload = (await fetchXdr(address)) as TransactionPayload;

        // If backend returned an unsigned XDR blob, sign it with Freighter
        const rawXdr = payload?.xdr || payload?.transactionXdr || payload?.txXdr;
        let signedXdr = typeof rawXdr === 'string' ? rawXdr : '';

        if (rawXdr && typeof rawXdr === 'string') {
          toast.info('Awaiting Signature', `Please confirm the ${actionName} transaction in your wallet...`);
          const netConfig = getNetwork(networkId);
          signedXdr = await storeSignTx(rawXdr, netConfig.passphrase);
        }

        toast.info('Broadcasting', `Submitting ${actionName} to the Stellar network...`);
        const result = await submitSigned(signedXdr);

        toast.success(
          `${actionName} Successful`,
          `${actionName} was successfully processed and confirmed on-chain.`,
        );
        return result;
      } catch (err: unknown) {
        let errorMsg = `Failed to complete ${actionName}`;
        if (err && typeof err === 'object') {
          const res = (err as { response?: { data?: { error?: string; detail?: string } } }).response;
          if (res?.data?.error) {
            errorMsg = res.data.error;
          } else if (res?.data?.detail) {
            errorMsg = res.data.detail;
          } else if ('message' in err && typeof (err as { message?: string }).message === 'string') {
            errorMsg = (err as { message: string }).message;
          }
        }
        toast.error(`${actionName} Failed`, errorMsg);
        throw err;
      } finally {
        setIsSigning(false);
      }
    },
    [address, networkId, storeSignTx],
  );

  return {
    address,
    provider,
    isConnected: !!address,
    isSigning,
    connect,
    disconnect,
    signTransaction,
    executeWithSigning,
  };
}
