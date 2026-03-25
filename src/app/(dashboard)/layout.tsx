"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/presentation/components/layout/Sidebar";
import { ToastProvider } from "@/application/providers/ToastProvider";
import { useAuth } from "@/application/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    // Show nothing while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="size-8 border-4 border-slate-200 border-t-[#0384c4] rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </div>
    </div>
  );
}

