import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  isConnected as checkFreighterConnected,
  requestAccess,
  getAddress,
  signTransaction as freighterSignTx,
} from '@stellar/freighter-api';
import { toast } from '@/lib/toast-store';

export type WalletProviderId = 'freighter' | 'walletconnect' | 'ledger' | 'stellarx';

interface AccessResponse {
  address?: string;
  error?: string;
}

interface SignResponse {
  signedTxXdr?: string;
  error?: string;
}

interface WalletState {
  address: string | null;
  provider: WalletProviderId | null;
  isConnecting: boolean;
  connect: (providerId?: WalletProviderId) => Promise<string | null>;
  disconnect: () => void;
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      provider: null,
      isConnecting: false,

      connect: async (providerId = 'freighter') => {
        set({ isConnecting: true });
        try {
          if (providerId === 'freighter') {
            const connectedRes = await checkFreighterConnected();
            if (!connectedRes) {
              toast.error(
                'Freighter Not Detected',
                'Please install or enable the Freighter wallet extension in your browser.',
              );
              set({ isConnecting: false });
              return null;
            }

            const accessObj = (await requestAccess()) as string | AccessResponse | null;
            let addressStr = '';
            if (typeof accessObj === 'string') {
              addressStr = accessObj;
            } else if (accessObj && typeof accessObj === 'object' && typeof accessObj.address === 'string') {
              addressStr = accessObj.address;
            } else {
              const fallbackAddr = (await getAddress()) as string | AccessResponse | null;
              if (typeof fallbackAddr === 'string') {
                addressStr = fallbackAddr;
              } else if (fallbackAddr && typeof fallbackAddr === 'object' && typeof fallbackAddr.address === 'string') {
                addressStr = fallbackAddr.address;
              }
            }

            if (!addressStr) {
              throw new Error('No public key returned from Freighter.');
            }

            set({ address: addressStr, provider: 'freighter', isConnecting: false });
            toast.success(
              'Wallet Connected',
              `Connected as ${addressStr.slice(0, 4)}...${addressStr.slice(-4)}`,
            );
            return addressStr;
          }

          // Fallback demo connection for other wallet providers
          const demoAddress = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';
          set({ address: demoAddress, provider: providerId, isConnecting: false });
          toast.success(
            'Wallet Connected',
            `Connected via ${providerId} (${demoAddress.slice(0, 4)}...${demoAddress.slice(-4)})`,
          );
          return demoAddress;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'User denied wallet access or connection failed.';
          toast.error('Connection Failed', msg);
          set({ isConnecting: false });
          return null;
        }
      },

      disconnect: () => {
        set({ address: null, provider: null });
        toast.info('Wallet Disconnected', 'Your wallet has been disconnected.');
      },

      signTransaction: async (xdr: string, networkPassphrase?: string) => {
        const { provider, address } = get();
        if (!address) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        if (provider === 'freighter') {
          const signedRes = (await freighterSignTx(xdr, {
            networkPassphrase,
            address,
          })) as string | SignResponse;
          const signedXdr = typeof signedRes === 'string' ? signedRes : signedRes?.signedTxXdr;
          if (!signedXdr) {
            throw new Error('Freighter did not return a signed transaction.');
          }
          return signedXdr;
        }

        // Mock sign for demo/other providers (echoes XDR if simulating)
        return xdr;
      },
    }),
    {
      name: 'yr-wallet',
      partialize: (state) => ({ address: state.address, provider: state.provider }),
    },
  ),
);
