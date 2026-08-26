import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
// import { useInstitution } from "./InstitutionContext";

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
  children: ReactNode;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: Props) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { updateWalletAddress } = useAuth();
  // const { updateInstitutionWalletAddress,  } = useInstitution()


  const refreshSigner = useCallback(async (newAccount: string | null) => {
    if (!newAccount || !provider) return;
    try {
      const newSigner = await provider.getSigner(newAccount);
      
      setSigner(newSigner);
      setAccount(newAccount);

      // Update wallet address in backend when account changes
      await updateWalletAddress(newAccount);
      // updateInstitutionWalletAddress(institutionId, newAccount) - find a way to update the wallet address when the account changes 
      

    } catch {
      setAccount(null);
      setProvider(null);
      setSigner(null);
    }
  }, [provider, updateWalletAddress]);

  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        toast("Wallet disconnected in MetaMask.");
      } else {
        console.log("Account changed to:", accs[0]);
        refreshSigner(accs[0]);
      }
    };

    const onChainChanged = () => {
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

      // console.log("Connected wallet address:", address);
      // console.log("MetaMask selected address:", window.ethereum.selectedAddress);

      setProvider(browserProvider);
      setSigner(fetchedSigner);
      setAccount(address);

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