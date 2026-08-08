import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

// ── Types
interface WalletContextValue {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

interface Props {
    children: ReactNode
}

// Thsi need to be checked if the code can access the wallet address
const WalletContext = createContext<WalletContextValue | null>(null);

// ── Provider
export function WalletProvider({ children }: Props) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { updateWalletAddress } = useAuth();

  // Re-connect signer when account changes externally (MetaMask account switch)
  const refreshSigner = useCallback(async (newAccount: string | null) => {
    if (!newAccount || !provider) return;
    try {
      const newSigner = await provider.getSigner(newAccount);
      setSigner(newSigner);
      setAccount(newAccount);
    } catch {
      // Account may have been disconnected in MetaMask
      setAccount(null);
      setProvider(null);
      setSigner(null);
    }
  }, [provider]);

  // Listen for MetaMask account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        // All accounts disconnected in MetaMask
        setAccount(null);
        setProvider(null);
        setSigner(null);
        toast("Wallet disconnected in MetaMask.");
      } else {
        refreshSigner(accs[0]);
      }
    };

    const onChainChanged = () => {
      // Reload to reset state cleanly — chain changes require a fresh provider
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, [refreshSigner]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("No Ethereum wallet found. Please install MetaMask.");
      return;
    }

    try {
      setConnecting(true);

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);

      const fetchedSigner = await browserProvider.getSigner();
      const address = await fetchedSigner.getAddress();

      setProvider(browserProvider);
      setSigner(fetchedSigner);
      setAccount(address);

      await updateWalletAddress(address);

      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      toast.error(msg);
    } finally {
      setConnecting(false);
    }
  }, [updateWalletAddress]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    toast.success("Wallet disconnected");
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        connecting,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

