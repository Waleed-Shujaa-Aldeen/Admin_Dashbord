"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/application/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await login(identifier.trim(), password);
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 p-4 relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#0384c4]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/[0.03] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Logo / Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-[#0384c4] to-[#0384c4]/80 shadow-xl shadow-[#0384c4]/20 mb-5">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_hospital
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Med-Link
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Clinic Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-lg font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-0.5">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-5 flex flex-col gap-5">
            
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200/60 rounded-xl text-red-700 text-sm font-medium animate-in slide-in-from-top-2 duration-200">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Identifier Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                Identifier
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 700000001"
                  disabled={loading}
                  autoComplete="username"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] focus:bg-white pl-10 pr-4 text-sm transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] focus:bg-white pl-10 pr-4 text-sm transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-[#0384c4] focus:ring-[#0384c4]/20 cursor-pointer"
                />
                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-semibold text-[#0384c4] hover:text-[#0384c4]/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#0384c4] to-[#0384c4]/90 hover:from-[#0384c4]/95 hover:to-[#0384c4]/85 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#0384c4]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Demo Credentials Hint */}
            <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Demo Credentials</p>
              <div className="flex gap-4 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Admin</p>
                  <p>700000001 / Admin123</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Receptionist</p>
                  <p>700000002 / Admin123</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          &copy; {new Date().getFullYear()} Med-Link. All rights reserved.
        </p>
      </div>
    </div>
  );
}
