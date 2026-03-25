"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/application/providers/AuthProvider";

export default function Sidebar() {
  const { user, role, canManageUsers, canManageFinancials, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", icon: "dashboard", href: "/" },
    { name: "Patients", icon: "groups", href: "/patients" },
    { name: "Schedule", icon: "calendar_today", href: "/schedule" },
    { name: "Staff", icon: "badge", href: "/staff" },
  ];

  if (canManageFinancials) {
    navItems.push({ name: "Financials", icon: "payments", href: "/payments" });
  }

  if (canManageUsers) {
    navItems.push({ name: "Users", icon: "manage_accounts", href: "/users" });
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#0384c4] size-10 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-2xl">medical_services</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight">Med-Link Clinic</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#0384c4]/10 text-[#0384c4] font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            pathname === "/settings"
              ? "bg-[#0384c4]/10 text-[#0384c4] font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Clinic Settings</span>
        </Link>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors group"
        >
          <div className="size-8 rounded-full bg-[#0384c4]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0384c4] text-lg">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
        </div>
      </div>
    </aside>
  );
}
