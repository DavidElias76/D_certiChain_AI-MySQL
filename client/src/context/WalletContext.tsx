import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { ethers } from "ethers";
import type { EthereumProvider } from "../types/ethereum.d";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useInstitution } from "./InstitutionContext";

interface WalletOption {
  id: string;
  label: string;
  icon: "metamask" | "rabby";
  provider: EthereumProvider;
}

interface WalletContextValue {
  // browser wallet (MetaMask / Rabby)
  account: string | null;
  connecting: boolean;
  availableWallets: WalletOption[];
  activeWalletLabel: string | null;
  institutionLoaded: boolean;
  connectWallet: (provider?: EthereumProvider) => Promise<void>;
  disconnectWallet: () => void;
  // institution wallet
  institutionWalletAddress: string | null;
  hasInstitutionWallet: boolean;
  canSetUpWallet: boolean;
  settingUp: boolean;
  setupInstitutionWallet: (privateKey: string) => Promise<boolean>;
}

const CHECK_INTERVAL_MS = 15000;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item: unknown) => typeof item === "string");

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [injectedProvider, setInjectedProvider] = useState<EthereumProvider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [activeWalletLabel, setActiveWalletLabel] = useState<string | null>(null);
  const [settingUp, setSettingUp] = useState(false);

  const { user } = useAuth();
   const { institution, getMyInstitution, setUpWallet } = useInstitution();

  const institutionId = user?.institution_id;
   const isInstitutionUser = user?.role === "main_admin" || user?.role === "admin";

  const institutionLoaded = isInstitutionUser && institution !== null;
  const institutionWalletAddress = institutionLoaded ? institution?.wallet_address ?? null : null;

  const hasInstitutionWallet = Boolean(institutionWalletAddress);
  const canSetUpWallet = user?.role === "main_admin" && institutionLoaded && !hasInstitutionWallet;

  const getAvailableWallets = useCallback((): WalletOption[] => {
    const wallets: WalletOption[] = [];

    if (window.ethereum?.isMetaMask) {
      wallets.push({ id: "metamask", label: "MetaMask", icon: "metamask", provider: window.ethereum });
    }
    if (window.rabby?.isRabby) {
      wallets.push({ id: "rabby", label: "Rabby Wallet", icon: "rabby", provider: window.rabby });
    } else if (window.ethereum?.isRabby && !window.ethereum?.isMetaMask) {
      wallets.push({ id: "rabby", label: "Rabby Wallet", icon: "rabby", provider: window.ethereum });
    }
    return wallets;
  }, []);

  // Connects the browser wallet only. Nothing is sent to the backend here.
  const connectWallet = useCallback(
    async (selectedProvider?: EthereumProvider) => {
      const wallets = getAvailableWallets();

      if (wallets.length === 0) {
        toast.error("No Ethereum wallet found. Please install MetaMask or Rabby Wallet.");
        return;
      }

      let targetProvider = selectedProvider;
      if (!targetProvider) {
        if (wallets.length === 1) {
          targetProvider = wallets[0].provider;
        } else {
          toast.error("Multiple wallets detected. Please select a wallet first.");
          return;
        }
      }

      try {
        setConnecting(true);
        const browserProvider = new ethers.BrowserProvider(targetProvider);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        setInjectedProvider(targetProvider);
        setAccount(address);

        // get the provider of the wallet - rabby wallet or metamask
        const label = wallets.find((w) => w.provider === targetProvider)?.label ?? "Unknown Wallet";
        setActiveWalletLabel(label);

        toast.success(`Connected via ${label}: ${address.slice(0, 6)}…${address.slice(-4)}`);

      } catch (err: unknown) {
        const errObj = err as { code?: number };
        if (errObj.code === 4001) {
          toast.error("Connection rejected. Please approve the request in your wallet.");
          return;
        }
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("wallet must has at least one account")) {
          toast.error("No accounts in wallet. Please create an account in your wallet extension first, then try again.");
          return;
        }
        toast.error("Failed to connect wallet");
      } finally {
        setConnecting(false);
      }
    },
    [getAvailableWallets]
  );

  // const disconnectWallet = useCallback(() => {
  //   setAccount(null);
  //   setInjectedProvider(null);
  //   setActiveWalletLabel(null);
  //   toast.success("Wallet disconnected");
  // }, []);

  const disconnectWallet = useCallback(() => {
    const provider = injectedProvider;
    // Clear the app state first so nothing re-reads the account
    setAccount(null);
    setInjectedProvider(null);
    setActiveWalletLabel(null);
    toast.success("Wallet disconnected");

  // Then ask the wallet to drop this site's permission. Not every wallet supports it.
  void provider
    ?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] })
    .catch(() => {});
}, [injectedProvider]);

  // Keep the connected account in sync. No backend calls here.
  useEffect(() => {
    if (!injectedProvider || !account) return;

    const onAccountsChanged = (accounts: unknown) => {
      if (!isStringArray(accounts)) {
        console.error("Wallet emitted an invalid accountsChanged event", accounts);
        return;
      }
      if (accounts.length === 0) {
        disconnectWallet();
      }  else if (accounts[0].toLowerCase() !== account.toLowerCase()) {
        setAccount(accounts[0]);
        toast.success(`Switched to ${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`);
      }
    };
    const onChainChanged = () => window.location.reload();

    injectedProvider.on("accountsChanged", onAccountsChanged);
    injectedProvider.on("chainChanged", onChainChanged);
    return () => {
      injectedProvider.removeListener("accountsChanged", onAccountsChanged);
      injectedProvider.removeListener("chainChanged", onChainChanged);
    };
  }, [injectedProvider, account, disconnectWallet]);

  // ── Institution wallet: every institution admin loads it, so all of them see the address
  const refreshInstitution = useCallback(async () => {
    if (!institutionId) return;
    try {
      await getMyInstitution(true);
    } catch {
      // silent background check
    }
  }, [institutionId, getMyInstitution]);

  useEffect(() => {
    if (isInstitutionUser) void refreshInstitution();
  }, [isInstitutionUser, refreshInstitution]);

  // While no wallet exists yet, re-check on a timer and when the tab regains focus
  useEffect(() => {
    if (!isInstitutionUser || hasInstitutionWallet) return;

    const timer = setInterval(() => void refreshInstitution(), CHECK_INTERVAL_MS);
    const onFocus = () => void refreshInstitution();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [isInstitutionUser, hasInstitutionWallet, refreshInstitution]);

    // Called by the setup form with the pasted private key
  const setupInstitutionWallet = useCallback(
    async (privateKey: string): Promise<boolean> => {
      if (settingUp) return false;
      if (!canSetUpWallet) {
        toast.error("Only the main admin can set up the institution wallet, once.");
        return false;
      }
      if (!account) {
        toast.error("Connect your wallet first.");
        return false;
      }

      const trimmed = privateKey.trim();
      const key = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;

      let derivedAddress: string;
      try {
        derivedAddress = new ethers.Wallet(key).address; // get the address from the derived key
      } catch {
        toast.error("That is not a valid private key.");
        return false;
      }

      // this checks if the key is not equal to the derivedkey
      if (derivedAddress.toLowerCase() !== account.toLowerCase()) {
        toast.error("The private key does not belong to the connected account.");
        return false;
      }

      try {
        setSettingUp(true);
        await setUpWallet(key);
        toast.success("Institution wallet saved and registered on the blockchain");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to set up the institution wallet");
        return false;
      } finally {
        setSettingUp(false);
      }
    },
    [settingUp, canSetUpWallet, account, setUpWallet]
  );

  return (
    <WalletContext.Provider
      value={{
        account,
        connecting,
        availableWallets: getAvailableWallets(),
        activeWalletLabel,
        connectWallet,
        disconnectWallet,
        institutionWalletAddress,
        hasInstitutionWallet,
        canSetUpWallet,
        settingUp,
        institutionLoaded,
        setupInstitutionWallet,
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