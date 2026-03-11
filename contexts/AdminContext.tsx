"use client";

import { createContext, useContext, ReactNode } from "react";

export type AdminRole = "owner" | "admin" | "viewer";

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
};

type AdminContextValue = {
  user: AdminUser | null;
  role: AdminRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  canWrite: boolean; // owner or admin (not viewer)
  canManageTeam: boolean; // only owner
};

const AdminContext = createContext<AdminContextValue>({
  user: null,
  role: null,
  isOwner: false,
  isAdmin: false,
  isViewer: false,
  canWrite: false,
  canManageTeam: false,
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: AdminUser | null;
}) {
  const role = user?.role ?? null;
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isViewer = role === "viewer";
  const canWrite = isOwner || isAdmin;
  const canManageTeam = isOwner;

  return (
    <AdminContext.Provider
      value={{
        user,
        role,
        isOwner,
        isAdmin,
        isViewer,
        canWrite,
        canManageTeam,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
