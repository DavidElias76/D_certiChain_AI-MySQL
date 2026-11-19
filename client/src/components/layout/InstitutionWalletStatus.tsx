import { useState } from "react";
import { Wallet, KeyRound, ShieldCheck, Loader2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function InstitutionWalletStatus() {
  const { user } = useAuth();
  const {
    account, connecting, availableWallets, activeWalletLabel,
    connectWallet, disconnectWallet,
    institutionLoaded, institutionWalletAddress, hasInstitutionWallet,
    canSetUpWallet, settingUp, setupInstitutionWallet,
  } = useWallet();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState("");

  const closeModal = () => {
    if (settingUp) return;
    setPrivateKey("");
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await setupInstitutionWallet(privateKey);
    setPrivateKey(""); 
    if (ok) setModalOpen(false);
  };

  const label = (
    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Institution Wallet:</span>
  );

  if (hasInstitutionWallet && institutionWalletAddress) {
    return (
      <div className="flex items-center gap-3">
        {label}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium rounded-xs">
          <ShieldCheck size={16} />
          <span className="font-mono" title={institutionWalletAddress}>{short(institutionWalletAddress)}</span>
          <span className="text-xs opacity-70">Registered on-chain</span>
        </div>

        {account && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-mono" title={account}>{short(account)}</span>
              {activeWalletLabel && <span className="text-xs opacity-70">({activeWalletLabel})</span>}
            </div>
            <button
              onClick={() => disconnectWallet()}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm rounded-xs transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    );
  }

  if (!institutionLoaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" /> Checking wallet…
      </div>
    );
  }

  if (!canSetUpWallet || user?.role !== "main_admin") {
    return (
      <div className="flex items-center gap-3">
        {label}
        <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm rounded-xs">
          Not set up yet. Ask your main admin.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {label}

      {!account ? (
        <div className="relative">
          {availableWallets.length > 1 ? (
            <>
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xs transition-colors"
              >
                <Wallet size={16} /> Select Wallet
              </button>
              {pickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xs z-50">
                  {availableWallets.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => { setPickerOpen(false); void connectWallet(w.provider); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {w.icon === "metamask" ? "M" : "R"}
                      </div>
                      {w.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => void connectWallet()}
              disabled={connecting}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xs transition-colors"
            >
              <Wallet size={16} /> {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-mono">{short(account)}</span>
            {activeWalletLabel && <span className="text-xs opacity-70">({activeWalletLabel})</span>}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xs transition-colors"
          >
            <KeyRound size={16} /> Set up institution wallet
          </button>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm rounded-xs transition-colors"
          >
            Disconnect
          </button>
        </>
      )}

      {modalOpen && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Set up institution wallet
              </h3>
              <button type="button" onClick={closeModal} disabled={settingUp} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Connected account: <span className="font-mono">{short(account)}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Private key of this account
              </label>
              <input
                type="password"
                name="institution-account-key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="0x…"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              This key lets the platform sign certificates for your institution. It is sent over a
              secure connection and stored encrypted. Use a dedicated institution account, not a
              personal one that holds funds. This can only be done once.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={settingUp}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={settingUp || !privateKey.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold"
              >
                {settingUp ? (<><Loader2 size={16} className="animate-spin" /> Registering…</>) : "Save & register on-chain"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}