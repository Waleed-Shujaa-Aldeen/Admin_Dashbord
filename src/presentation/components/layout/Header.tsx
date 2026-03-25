"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/application/providers/AuthProvider";
import { LogOut } from "lucide-react";

export default function Header({ title }: { title: string }) {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-400">arrow_right_alt</span>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        
        {/* Role Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
          role === "Admin" 
            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
            : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
        }`}>
          <span className="material-symbols-outlined text-[16px]">shield</span>
          {role}
        </div>

        <button className="size-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          {user && (
            <span className="text-xs font-semibold text-slate-500 hidden sm:block max-w-[140px] truncate">
              {user.name}
            </span>
          )}
          <button 
            onClick={handleLogout}
            className="size-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Sign Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
