"use client";

import Header from "@/presentation/components/layout/Header";
import { useDashboard } from "@/application/services/useDashboard";
import { useAppointments } from "@/application/services/useAppointments";
import { useAuth } from "@/application/providers/AuthProvider";
import { Loader2, CalendarX2 } from "lucide-react";

export default function DashboardPage() {
  const { canManageFinancials } = useAuth();
  const { stats, loading: dashboardLoading } = useDashboard();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  return (
    <>
      <Header title="City Central Clinic" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h3>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, here is what's happening today at City Central Clinic.</p>
          </div>

          {dashboardLoading ? (
            <div className="flex items-center justify-center py-20 flex-col gap-4">
              <Loader2 className="size-8 animate-spin text-[#0384c4]" />
              <p className="text-sm text-slate-500 font-medium">Loading dashboard data...</p>
            </div>
          ) : !stats ? (
            <div className="text-center py-20 text-slate-500">Failed to load dashboard data.</div>
          ) : (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.metrics
                  .filter(m => canManageFinancials || m.title !== "Total Revenue")
                  .map(metric => (
                  <div key={metric.title} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-[#0384c4]/10 rounded-lg text-[#0384c4]">
                        <span className="material-symbols-outlined">{metric.icon}</span>
                      </div>
                      <span className="text-emerald-500 text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">{metric.trend}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{metric.title}</p>
                    <h4 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{metric.value}</h4>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0384c4] h-full transition-all duration-1000 ease-out" style={{ width: `${metric.progressPercent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Graph */}
              {canManageFinancials && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h5>
                      <p className="text-sm text-slate-500">Monthly trend analysis for clinic services</p>
                    </div>
                  </div>
                  {/* Simplified Graph representing dynamic data */}
                  <div className="p-8 h-64 relative flex items-end justify-between gap-4">
                    {stats.revenueTrend.data.map((val, i) => {
                      const max = Math.max(...stats.revenueTrend.data);
                      const heightPercent = (val / max) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                          <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded">
                            ${val.toLocaleString()}
                          </div>
                          <div className="w-full bg-[#0384c4]/20 rounded-t-lg hover:bg-[#0384c4] transition-all duration-500 relative" style={{ height: `${heightPercent}%` }}></div>
                          <span className="text-xs font-semibold text-slate-500">{stats.revenueTrend.labels[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white">Upcoming Appointments</h5>
              </div>
              <div className="flex-1 p-0 flex flex-col">
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center flex-1 min-h-[250px] flex-col gap-3">
                    <Loader2 className="size-6 animate-spin text-slate-400" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Loading Schedule</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 min-h-[250px] text-center p-6 gap-3">
                    <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <CalendarX2 className="size-8 text-slate-300" />
                    </div>
                    <div>
                      <h6 className="font-bold text-slate-700 dark:text-slate-300">No appointments scheduled</h6>
                      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">It's quiet right now! Click 'Add New Appointment' on the schedule page to get started.</p>
                    </div>
                  </div>
                ) : (
                  appointments.slice(0, 4).map((app, i) => (
                    <div key={app.id} className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-[#0384c4]/10 flex items-center justify-center text-[#0384c4] font-bold">
                        {app.patientInitials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{app.patientName}</p>
                        <p className="text-xs text-slate-500">{app.doctorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{app.time}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          app.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' : 
                          app.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center rounded-b-xl border-t border-slate-100 dark:border-slate-800">
                <button className="text-sm font-bold text-[#0384c4] hover:underline">View All Schedule</button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white">Quick Actions</h5>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0384c4]/50 hover:bg-[#0384c4]/5 transition-all text-center">
                  <span className="material-symbols-outlined text-[#0384c4] text-3xl">person_add</span>
                  <span className="text-sm font-semibold">Add Patient</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0384c4]/50 hover:bg-[#0384c4]/5 transition-all text-center">
                  <span className="material-symbols-outlined text-[#0384c4] text-3xl">add_task</span>
                  <span className="text-sm font-semibold">New Appointment</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0384c4]/50 hover:bg-[#0384c4]/5 transition-all text-center">
                  <span className="material-symbols-outlined text-[#0384c4] text-3xl">receipt_long</span>
                  <span className="text-sm font-semibold">Create Invoice</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0384c4]/50 hover:bg-[#0384c4]/5 transition-all text-center">
                  <span className="material-symbols-outlined text-[#0384c4] text-3xl">lab_profile</span>
                  <span className="text-sm font-semibold">Lab Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
