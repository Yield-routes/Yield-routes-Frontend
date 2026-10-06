import { renderHook, act } from '@testing-library/react';
import { useWalletStore } from '@/lib/wallet-store';
import { useWalletSigner } from '@/lib/use-wallet-signer';
import * as freighterApi from '@stellar/freighter-api';

jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn(),
  requestAccess: jest.fn(),
  getAddress: jest.fn(),
  signTransaction: jest.fn(),
}));

describe('useWalletSigner & useWalletStore', () => {
  const dummyPublicKey = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useWalletStore.getState().disconnect();
    });
  });

  it('initial state is disconnected', () => {
    const { result } = renderHook(() => useWalletSigner());
    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.provider).toBeNull();
    expect(result.current.isSigning).toBe(false);
  });

  it('connects to Freighter successfully when installed and approved', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue(true);
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue(dummyPublicKey);

    const { result } = renderHook(() => useWalletSigner());

    let addr: string | null = null;
    await act(async () => {
      addr = await result.current.connect('freighter');
    });

    expect(addr).toBe(dummyPublicKey);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe(dummyPublicKey);
    expect(result.current.provider).toBe('freighter');
  });

  it('handles Freighter not installed error gracefully', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useWalletSigner());

    let addr: string | null = null;
    await act(async () => {
      addr = await result.current.connect('freighter');
    });

    expect(addr).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
  });

  it('signs transaction with Freighter and returns signed XDR', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue(true);
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue(dummyPublicKey);
    (freighterApi.signTransaction as jest.Mock).mockResolvedValue('AAAA-SIGNED-XDR');

    const { result } = renderHook(() => useWalletSigner());

    await act(async () => {
      await result.current.connect('freighter');
    });

    let signed = '';
    await act(async () => {
      signed = await result.current.signTransaction('AAAA-RAW-XDR');
    });

    expect(signed).toBe('AAAA-SIGNED-XDR');
    expect(freighterApi.signTransaction).toHaveBeenCalledWith(
      'AAAA-RAW-XDR',
      expect.objectContaining({ address: dummyPublicKey }),
    );
  });

  it('executeWithSigning executes full flow with XDR signing', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue(true);
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue(dummyPublicKey);
    (freighterApi.signTransaction as jest.Mock).mockResolvedValue('AAAA-SIGNED-SWAP-XDR');

    const { result } = renderHook(() => useWalletSigner());

    await act(async () => {
      await result.current.connect('freighter');
    });

    const mockFetchXdr = jest.fn().mockResolvedValue({ xdr: 'AAAA-RAW-SWAP-XDR' });
    const mockSubmitSigned = jest.fn().mockResolvedValue({ txHash: '0x12345678', success: true });

    let actionRes: unknown;
    await act(async () => {
      actionRes = await result.current.executeWithSigning(
        mockFetchXdr,
        mockSubmitSigned,
        'Swap Test',
      );
    });

    expect(mockFetchXdr).toHaveBeenCalledWith(dummyPublicKey);
    expect(freighterApi.signTransaction).toHaveBeenCalledWith(
      'AAAA-RAW-SWAP-XDR',
      expect.objectContaining({ address: dummyPublicKey }),
    );
    expect(mockSubmitSigned).toHaveBeenCalledWith('AAAA-SIGNED-SWAP-XDR');
    expect(actionRes).toEqual({ txHash: '0x12345678', success: true });
  });

  it('executeWithSigning throws error if wallet is not connected', async () => {
    const { result } = renderHook(() => useWalletSigner());

    const mockFetchXdr = jest.fn();
    const mockSubmitSigned = jest.fn();

    await expect(
      result.current.executeWithSigning(mockFetchXdr, mockSubmitSigned, 'Swap'),
    ).rejects.toThrow('Wallet not connected');

    expect(mockFetchXdr).not.toHaveBeenCalled();
  });
});
