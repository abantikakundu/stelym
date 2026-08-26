"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";
import { NETWORK_PASSPHRASE } from "@/lib/stellar";

interface FreighterContextValue {
  connected: boolean;
  address: string | null;
  network: string | null;
  installed: boolean;
  loading: boolean;
  connect: () => Promise<string>;
  disconnect: () => void;
  sign: SignTransaction;
  refresh: () => Promise<void>;
}

const FreighterContext = createContext<FreighterContextValue | null>(null);

export function FreighterProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDisconnected, setUserDisconnected] = useState(false);

  const checkConnection = useCallback(async () => {
    if (userDisconnected) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { isConnected: freighterInstalled, error } = await isConnected();
      if (error || !freighterInstalled) {
        setInstalled(false);
        setConnected(false);
        setAddress(null);
        setNetwork(null);
        return;
      }

      setInstalled(true);

      const { address: addr, error: addressError } = await getAddress();
      if (addressError || !addr) {
        setConnected(false);
        setAddress(null);
        setNetwork(null);
        return;
      }

      const { network: net, error: networkError } = await getNetwork();
      if (networkError) {
        setConnected(false);
        setAddress(null);
        setNetwork(null);
        return;
      }

      setConnected(true);
      setAddress(addr);
      setNetwork(net);
    } finally {
      setLoading(false);
    }
  }, [userDisconnected]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkConnection();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checkConnection]);

  const connect = useCallback(async () => {
    const { isConnected: freighterInstalled, error } = await isConnected();
    if (error || !freighterInstalled) {
      throw new Error(
        "Freighter is not installed. Install the Freighter extension to continue.",
      );
    }

    const { address: addr, error: accessError } = await requestAccess();
    if (accessError) {
      throw new Error(accessError.message);
    }

    const { network: net, error: networkError } = await getNetwork();
    if (networkError) {
      throw new Error(networkError.message);
    }

    setInstalled(true);
    setUserDisconnected(false);
    setConnected(true);
    setAddress(addr);
    setNetwork(net);
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    setUserDisconnected(true);
    setConnected(false);
    setAddress(null);
    setNetwork(null);
  }, []);

  const sign = useCallback<SignTransaction>(
    async (xdr, opts) => {
      if (!connected) {
        throw new Error("Wallet is not connected");
      }

      const result = await signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase ?? NETWORK_PASSPHRASE,
        address: opts?.address,
      });

      if (result.error) {
        return {
          signedTxXdr: result.signedTxXdr,
          signerAddress: result.signerAddress,
          error: {
            message: result.error.message,
            code: result.error.code,
            ext: result.error.ext,
          },
        };
      }

      return result;
    },
    [connected],
  );

  const value = useMemo(
    () => ({
      connected,
      address,
      network,
      installed,
      loading,
      connect,
      disconnect,
      sign,
      refresh: checkConnection,
    }),
    [
      connected,
      address,
      network,
      installed,
      loading,
      connect,
      disconnect,
      sign,
      checkConnection,
    ],
  );

  return (
    <FreighterContext.Provider value={value}>{children}</FreighterContext.Provider>
  );
}

export function useFreighter() {
  const context = useContext(FreighterContext);
  if (!context) {
    throw new Error("useFreighter must be used within a FreighterProvider");
  }
  return context;
}
