"use client";

import { useEffect, useState } from "react";
import Header from "@/presentation/components/layout/Header";
import { useAgent } from "@/application/services/useAgent";
import { AgentProfile } from "@/domain/entities/Agent";
import { Loader2, Save, Trash2, Upload, X } from "lucide-react";

export default function SettingsPage() {
  const { profile, isLoading, isError, updateProfile, isUpdating } = useAgent();
  const [formData, setFormData] = useState<Partial<AgentProfile>>({});

  // Sync local state when profile is fetched
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <>
        <Header title="Clinic Settings" />
        <div className="p-8 max-w-5xl animate-pulse">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/50 rounded mb-8" />
          <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800" />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header title="Clinic Settings" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="size-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-4">
            <X className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Failed to load settings</h3>
          <p className="text-slate-500 mt-2">Please check your connection and try again.</p>
        </div>
      </>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const field = id.replace("clinic-", "");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
    } catch (err) {
      // Errors are toasted globally in ApiClient
    }
  };

  return (
    <>
      <Header title="Clinic Settings" />
      <div className="p-8 max-w-5xl">
        <div className="mb-8">
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Clinic Settings</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your clinic's public profile, contact details, and visual identity.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">Update Clinic Profile</h4>
            <div className="text-[10px] font-bold py-1 px-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 uppercase tracking-widest">
              Implicit Multi-Tenancy Active
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Logo Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative group">
                <div className="size-32 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden transition-colors group-hover:border-[#0384c4]/50">
                  {formData.logoUrl ? (
                    <img className="w-full h-full object-cover" alt="Clinic Logo" src={formData.logoUrl} />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-1">
                      <Upload className="size-8 opacity-20" />
                      <span className="text-[10px] font-bold">NO LOGO</span>
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-[#0384c4] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform" type="button">
                  <Upload className="size-4" />
                </button>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-wider">Clinic Logo</h5>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your clinic logo. Recommended size is 400x400px. PNG or JPG accepted.</p>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-[#0384c4] text-white text-xs font-bold rounded-lg hover:bg-[#0384c4]/90 transition-colors shadow-sm" type="button">UPLOAD NEW</button>
                  <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700" type="button">REMOVE</button>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="clinic-name">Clinic Name</label>
                <input
                  className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] px-4 font-medium transition-all"
                  id="clinic-name"
                  type="text"
                  placeholder="Enter clinic name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="clinic-phone">Phone Number (9 Digits)</label>
                <input
                  className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] px-4 font-medium transition-all"
                  id="clinic-phone"
                  type="tel"
                  placeholder="7xxxxxxxx"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="clinic-state">State / City</label>
                <input
                  className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] px-4 font-medium transition-all"
                  id="clinic-state"
                  type="text"
                  placeholder="e.g. Riyadh"
                  value={formData.state || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="clinic-specialization">Clinic Specialization</label>
                <select
                  className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] px-4 font-medium transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                  id="clinic-specialization"
                  value={formData.specialization || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Specialization</option>
                  <option value="General Practice">General Practice</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>
            </div>

            {/* Full Address */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="clinic-address">Full Address</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] p-4 resize-none font-medium transition-all"
                id="clinic-address"
                rows={3}
                placeholder="Enter full physical address"
                value={formData.address || ""}
                onChange={handleChange}
                required
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
              <button
                className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                type="button"
                onClick={() => setFormData(profile || {})}
                disabled={isUpdating}
              >
                Reset
              </button>
              <button
                className="px-8 py-2.5 bg-[#0384c4] text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#0384c4]/90 shadow-lg shadow-[#0384c4]/20 transition-all flex items-center gap-2 disabled:opacity-70"
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    SAVING...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    SAVE CHANGES
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone Section */}
        <div className="mt-12 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="size-4 text-red-600" />
            <h4 className="text-red-600 dark:text-red-400 font-bold uppercase text-xs tracking-wider">Danger Zone</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Permanently delete this clinic's records and close the account. This action is irreversible.</p>
          <button className="mt-4 px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all">
            Delete Clinic Profile
          </button>
        </div>
      </div>
    </>
  );
}
