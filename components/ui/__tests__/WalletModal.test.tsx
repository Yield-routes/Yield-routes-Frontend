/**
 * Component Tests for WalletModal
 * Issue #7: Add component tests for UI components
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WalletModal } from '@/components/ui/WalletModal';
import { useUIStore } from '@/lib/ui-store';

// Mock the zustand store
jest.mock('@/lib/ui-store', () => ({
  useUIStore: jest.fn(),
}));

const mockedUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const defaultStore = {
  walletModal: true,
  closeWalletModal: jest.fn(),
  openWalletModal: jest.fn(),
  drawer: null,
  openDrawer: jest.fn(),
  closeDrawer: jest.fn(),
};

describe('WalletModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUIStore.mockReturnValue(defaultStore);
  });

  describe('Rendering', () => {
    it('renders the modal when walletModal is true', () => {
      mockedUseUIStore.mockReturnValue({ ...defaultStore, walletModal: true });
      render(<WalletModal />);
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('returns null when walletModal is false', () => {
      mockedUseUIStore.mockReturnValue({ ...defaultStore, walletModal: false });
      const { container } = render(<WalletModal />);
      expect(container.innerHTML).toBe('');
    });

    it('renders the "Select wallet" section header', () => {
      render(<WalletModal />);
      expect(screen.getByText('Select wallet')).toBeInTheDocument();
    });

    it('renders the "Available on Stellar" section header', () => {
      render(<WalletModal />);
      expect(screen.getByText('Available on Stellar')).toBeInTheDocument();
    });

    it('renders the terms of service notice', () => {
      render(<WalletModal />);
      expect(screen.getByText(/By connecting, you agree to the Terms of Service/)).toBeInTheDocument();
    });
  });

  describe('Wallet list', () => {
    it('renders all four wallet options', () => {
      render(<WalletModal />);
      expect(screen.getByText('Freighter')).toBeInTheDocument();
      expect(screen.getByText('WalletConnect')).toBeInTheDocument();
      expect(screen.getByText('Ledger')).toBeInTheDocument();
      expect(screen.getByText('StellarX')).toBeInTheDocument();
    });

    it('renders wallet descriptions', () => {
      render(<WalletModal />);
      expect(screen.getByText('Stellar blockchain wallet')).toBeInTheDocument();
      expect(screen.getByText('Connect via QR code')).toBeInTheDocument();
      expect(screen.getByText('Hardware wallet support')).toBeInTheDocument();
      expect(screen.getByText('Web-based Stellar wallet')).toBeInTheDocument();
    });

    it('renders the "Recommended" badge only on Freighter', () => {
      render(<WalletModal />);
      expect(screen.getByText('Recommended')).toBeInTheDocument();
      // There should be only one "Recommended" badge
      const badges = screen.queryAllByText('Recommended');
      expect(badges).toHaveLength(1);
    });

    it('renders each wallet as a button element', () => {
      render(<WalletModal />);
      const walletButtons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent && (
          btn.textContent.includes('Freighter') ||
          btn.textContent.includes('WalletConnect') ||
          btn.textContent.includes('Ledger') ||
          btn.textContent.includes('StellarX')
        )
      );
      expect(walletButtons).toHaveLength(4);
    });
  });

  describe('Stellar assets', () => {
    it('renders all three Stellar assets', () => {
      render(<WalletModal />);
      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.getByText('XLM')).toBeInTheDocument();
      expect(screen.getByText('USDT')).toBeInTheDocument();
    });

    it('renders asset full names', () => {
      render(<WalletModal />);
      expect(screen.getByText(/USD Coin/)).toBeInTheDocument();
      expect(screen.getByText(/Stellar Lumens/)).toBeInTheDocument();
      expect(screen.getByText(/Tether USD/)).toBeInTheDocument();
    });

    it('shows dash for balance when not connected', () => {
      render(<WalletModal />);
      const dashes = screen.getAllByText('—');
      expect(dashes).toHaveLength(3);
    });
  });

  describe('Interactions', () => {
    it('calls closeWalletModal when the background overlay is clicked', () => {
      render(<WalletModal />);
      const overlay = document.querySelector('.modal-bg');
      expect(overlay).toBeInTheDocument();
      if (overlay) {
        fireEvent.click(overlay);
        expect(defaultStore.closeWalletModal).toHaveBeenCalledTimes(1);
      }
    });

    it('calls closeWalletModal when the close button is clicked', () => {
      render(<WalletModal />);
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);
      expect(defaultStore.closeWalletModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has a heading for the modal title', () => {
      render(<WalletModal />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Connect Wallet');
    });

    it('has interactive close button', () => {
      render(<WalletModal />);
      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInstanceOf(HTMLElement);
      expect(closeButton.closest('button')).toBeInTheDocument();
    });
  });
});
