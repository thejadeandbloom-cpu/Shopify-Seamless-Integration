import React, { createContext, useContext, useState, useCallback } from "react";

interface CustomerAuth {
  email: string;
  token: string;
}

interface CustomerAuthContextType {
  customer: CustomerAuth | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY = "jb_customer";

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAuth | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CustomerAuth) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email: string, token: string) => {
    const auth = { email, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setCustomer(auth);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, login, logout, isLoggedIn: customer !== null }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
