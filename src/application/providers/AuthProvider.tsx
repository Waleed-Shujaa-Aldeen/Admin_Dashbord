"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { AuthService, AuthUser } from "@/infrastructure/api/AuthService";

export type UserRole = "Admin" | "Receptionist";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  // Derived permissions
  canManageUsers: boolean;
  canManageFinancials: boolean;
  canManageSchedules: boolean;
  canDeleteRecords: boolean;
  canManageDoctors: boolean;
  canManageReceptionists: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Use sessionStorage to satisfy "login page first" on new tabs,
  // but allow hydration on refresh within the same session.
  useEffect(() => {
    const storedUser = AuthService.getStoredUser();
    if (storedUser && AuthService.getStoredToken()) {
      setUser(storedUser);
    }
    setHydrated(true);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await AuthService.login({ identifier, password });
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  // Derived values
  const isAuthenticated = !!user;
  let role: UserRole = "Receptionist";
  
  if (user?.role) {
    const rawRole = (user.role as string).toLowerCase();
    if (rawRole === "admin" || rawRole === "superadmin") role = "Admin";
    else if (rawRole === "receptionist") role = "Receptionist";
  }

  // --- Derived Permissions ---
  const canManageUsers = role === "Admin";
  const canManageFinancials = role === "Admin";
  const canManageSchedules = role === "Admin";
  const canDeleteRecords = role === "Admin";
  const canManageDoctors = role === "Admin";
  const canManageReceptionists = role === "Admin";

  // Don't render children until hydrated to avoid SSR mismatch
  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
        canManageUsers,
        canManageFinancials,
        canManageSchedules,
        canDeleteRecords,
        canManageDoctors,
        canManageReceptionists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
