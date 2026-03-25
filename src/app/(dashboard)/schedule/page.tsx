"use client";

import { useState, useMemo } from "react";
import Header from "@/presentation/components/layout/Header";
import { DateExceptionsManager } from "@/presentation/components/schedule/DateExceptionsManager";
import { BookAppointmentModal } from "@/presentation/components/schedule/BookAppointmentModal";
import { useAppointments } from "@/application/services/useAppointments";
import { useAuth } from "@/application/providers/AuthProvider";
import { Loader2, CalendarX2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// --- Date Helpers ---
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Default time rows when there are no appointments yet
const DEFAULT_TIME_ROWS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function SchedulePage() {
  const { canManageSchedules } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { appointments, loading, error, bookAppointment, cancelAppointment } = useAppointments();

  // --- Week Navigation State ---
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => getMonday(new Date()));
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(weekStartDate, i));
  }, [weekStartDate]);

  const goToPreviousWeek = () => setWeekStartDate(prev => addDays(prev, -7));
  const goToNextWeek = () => setWeekStartDate(prev => addDays(prev, 7));
  const goToToday = () => setWeekStartDate(getMonday(new Date()));

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[4];
    if (start.getMonth() === end.getMonth()) {
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    }
    if (start.getFullYear() === end.getFullYear()) {
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDays]);

  const isCurrentWeek = useMemo(() => {
    return weekDays.some(d => isSameDay(d, today));
  }, [weekDays, today]);

  // --- Dynamic Time Rows ---
  // Derive unique time slots from real appointment data, falling back to defaults
  const timeRows = useMemo(() => {
    const uniqueTimes = new Set<string>();
    appointments.forEach(a => {
      if (a.time) uniqueTimes.add(a.time);
    });

    if (uniqueTimes.size === 0) return DEFAULT_TIME_ROWS;

    // Sort times chronologically
    return Array.from(uniqueTimes).sort((a, b) => {
      const parse = (t: string) => {
        const [time, period] = t.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };
      return parse(a) - parse(b);
    });
  }, [appointments]);

  // Filter appointments for the current week
  const weekAppointments = useMemo(() => {
    const startStr = formatDateStr(weekDays[0]);
    const endStr = formatDateStr(weekDays[4]);
    return appointments.filter(a => a.date >= startStr && a.date <= endStr);
  }, [appointments, weekDays]);

  const getAppointmentsForTimeAndDay = (timeStr: string, dateStr: string) => {
    return weekAppointments.filter(a => a.time === timeStr && a.date === dateStr);
  };

  return (
    <>
      <Header title="Schedule Visibility" />
      <div className="flex-1 flex flex-col p-6 lg:p-10 gap-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight">Schedule Visibility Grid</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Monitor real-time clinical occupancy and practitioner availability.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#0384c4] text-white gap-2 text-sm font-bold shadow-lg shadow-[#0384c4]/20 hover:bg-[#0384c4]/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Week Navigation */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-1 pr-4 border-r border-slate-200 dark:border-slate-800">
              <button 
                onClick={goToPreviousWeek}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                title="Previous Week"
              >
                <ChevronLeft className="size-5" />
              </button>
              <span className="font-bold text-sm min-w-[180px] text-center text-slate-900 dark:text-slate-100 select-none">
                {weekLabel}
              </span>
              <button 
                onClick={goToNextWeek}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                title="Next Week"
              >
                <ChevronRight className="size-5" />
              </button>
              {!isCurrentWeek && (
                <button
                  onClick={goToToday}
                  className="ml-2 px-3 py-1 text-xs font-bold text-[#0384c4] bg-[#0384c4]/10 hover:bg-[#0384c4]/20 rounded-md transition-colors"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
               <Loader2 className="size-10 animate-spin text-[#0384c4]" />
               <p className="text-sm font-semibold text-slate-500">Loading Schedule Grid…</p>
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-2 text-center">
               <p className="text-red-500 font-bold">Failed to load schedule.</p>
               <p className="text-slate-500 text-sm">{error}</p>
            </div>
          ) : weekAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center p-6 gap-3">
              <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <CalendarX2 className="size-10 text-slate-300" />
              </div>
              <div>
                <h6 className="font-bold text-lg text-slate-700 dark:text-slate-300">No Appointments This Week</h6>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Your schedule grid is empty for this week. Click &apos;Book Appointment&apos; to start booking patients.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Grid Header */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <div className="p-4"></div>
                  {weekDays.map((day, i) => {
                    const isToday = isSameDay(day, today);
                    return (
                      <div 
                        key={i} 
                        className={`p-4 text-center transition-colors ${isToday ? 'bg-[#0384c4]/5 border-x border-[#0384c4]/10' : ''}`}
                      >
                        <p className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#0384c4]' : 'text-slate-400'}`}>
                          {DAY_NAMES[i]}
                        </p>
                        <p className={`text-xl font-bold ${isToday ? 'text-[#0384c4]' : 'text-slate-900 dark:text-slate-100'}`}>
                          {day.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Grid Body — Dynamically computed time rows */}
                <div className="relative">
                  {timeRows.map((timeSlot) => (
                    <div key={timeSlot} className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[64px] border-b border-slate-100 dark:border-slate-800 group">
                      <div className="p-4 text-xs font-semibold text-slate-400 border-r border-slate-100 dark:border-slate-800 flex items-start justify-end pr-3">
                        {timeSlot}
                      </div>
                      
                      {weekDays.map((day, dayIndex) => {
                        const isToday = isSameDay(day, today);
                        const dateStr = formatDateStr(day);
                        const dayApps = getAppointmentsForTimeAndDay(timeSlot, dateStr);

                        return (
                          <div key={dayIndex} className={`relative p-1 border-r border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${isToday ? 'bg-[#0384c4]/5' : ''}`}>
                            {dayApps.map(app => (
                              <div 
                                key={app.id}
                                className={`relative h-full min-h-[48px] rounded-md border-l-4 p-2 overflow-hidden shadow-sm group/card ${
                                  app.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400' : 
                                  app.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
                                  'bg-[#0384c4]/10 border-[#0384c4]'
                                }`}
                              >
                                <p className={`text-[10px] font-bold truncate uppercase ${
                                  app.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 
                                  app.status === 'Cancelled' ? 'text-red-600 dark:text-red-400' :
                                  'text-[#0384c4]'
                                }`}>
                                  {app.patientName}
                                </p>
                                <p className="text-[9px] text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                                  {app.doctorName}
                                </p>
                                
                                {canManageSchedules && (
                                  <button 
                                    onClick={() => cancelAppointment(app.id)}
                                    className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-slate-800/80 rounded opacity-0 group-hover/card:opacity-100 hover:text-red-500 transition-all"
                                    title="Cancel Appointment"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date Exceptions Manager Sub-Module */}
        {canManageSchedules && <DateExceptionsManager />}

        {/* Global Modals */}
        <BookAppointmentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (p) => { await bookAppointment(p); }}
        />
      </div>
    </>
  );
}
