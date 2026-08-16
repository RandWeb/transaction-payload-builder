import { createContext, useContext, type ReactNode } from "react";
import { useTransactionBuilder } from "@/features/transaction-payload-builder/hooks/useTransactionBuilder";

type TransactionContextValue = ReturnType<typeof useTransactionBuilder>;

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const value = useTransactionBuilder();
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransaction must be used within TransactionProvider");
  }
  return ctx;
}
