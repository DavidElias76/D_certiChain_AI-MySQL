export {};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    rabby?: EthereumProvider;
  }
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners: (event: string) => void;
  isConnected: () => boolean;
  selectedAddress: string | null;
}
