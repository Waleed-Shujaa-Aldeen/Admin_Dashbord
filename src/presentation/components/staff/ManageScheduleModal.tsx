import { useState, useEffect } from "react";
import { TimeUtility } from "@/application/utils/TimeUtility";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, CalendarClock, AlertTriangle, Plus, Clock, CheckCircle2 } from "lucide-react";
import { useScheduleProfile, useSlotGeneration } from "@/application/services/useScheduleProfiles";
import { MasterScheduleSchema, MasterScheduleFormData } from "@/domain/validation/ScheduleSchema";
import { SlotFactoryProgress } from "../schedule/SlotFactoryProgress";
import { useToast } from "@/application/providers/ToastProvider";
import { useQuery } from "@tanstack/react-query";
import { AppointmentRepository } from "@/infrastructure/api/AppointmentRepository";

interface ManageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string | null;
  doctorName?: string;
}

export function ManageScheduleModal({ isOpen, onClose, doctorId, doctorName }: ManageScheduleModalProps) {
  const { profile, loading, loadProfile, updateProfile } = useScheduleProfile(doctorId);
  const { generating, generateSlots } = useSlotGeneration();
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  // Generation range state
  const [genStartDate, setGenStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [genEndDate, setGenEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  // Live Slots Preview State (moved below genStartDate to fix hoisting)
  const { data: dbSlots = [], isLoading: loadingDbSlots } = useQuery({
    queryKey: ["live-slots", doctorId, genStartDate],
    queryFn: () => doctorId ? AppointmentRepository.getAvailableSlots(doctorId, genStartDate) : Promise.resolve([]),
    enabled: !!doctorId && !!genStartDate
  });

  const { control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<MasterScheduleFormData>({
    resolver: zodResolver(MasterScheduleSchema),
    defaultValues: {
      doctorId: doctorId || "",
      slotDurationMinutes: 15,
      timezoneId: "Asia/Aden",
      weeklyAvailabilities: []
    }
  });

  const weeklyAvailabilities = watch("weeklyAvailabilities");
  const slotDuration = watch("slotDurationMinutes");

  const applyToAll = (sourceIdx: number) => {
    const source = weeklyAvailabilities[sourceIdx];
    const updated = weeklyAvailabilities.map(avail => ({
      ...avail,
      isWorking: source.isWorking,
      startTime: source.startTime,
      endTime: source.endTime
    }));
    reset({ ...watch(), weeklyAvailabilities: updated });
    success("Schedule pattern applied to all working days.");
  };

  const calculateTotalSlots = () => {
    const workingDaysCount = weeklyAvailabilities.filter(d => d.isWorking).length;
    if (workingDaysCount === 0) return 0;

    const start = new Date(genStartDate);
    const end = new Date(genEndDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Simple estimation: avg slots per day * number of days that match working pattern
    // For more accuracy we'd count specific days, but this is a good preview.
    let dailySlots = 0;
    weeklyAvailabilities.forEach(d => {
      if (d.isWorking && d.startTime && d.endTime) {
        const [hStart, mStart] = TimeUtility.toTimeSpan(d.startTime).split(':');
        const [hEnd, mEnd] = TimeUtility.toTimeSpan(d.endTime).split(':');
        
        const startMin = parseInt(hStart) * 60 + parseInt(mStart);
        const endMin = parseInt(hEnd) * 60 + parseInt(mEnd);
        
        if (endMin > startMin) {
          dailySlots += Math.floor((endMin - startMin) / slotDuration);
        }
      }
    });

    const avgDailySlots = dailySlots / 7;
    return Math.floor(avgDailySlots * daysDiff);
  };

  const { fields: availabilityFields } = useFieldArray({
    control,
    name: "weeklyAvailabilities"
  });

  useEffect(() => {
    if (isOpen && doctorId) {
      loadProfile();
    }
  }, [isOpen, doctorId, loadProfile]);

  const defaultAvailabilities = [
    { dayOfWeek: "Monday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
    { dayOfWeek: "Tuesday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
    { dayOfWeek: "Wednesday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
    { dayOfWeek: "Thursday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
    { dayOfWeek: "Friday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
    { dayOfWeek: "Saturday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
    { dayOfWeek: "Sunday" as const, isWorking: false, startTime: "09:00 AM", endTime: "05:00 PM" },
  ];

  useEffect(() => {
    if (profile) {
      // Map existing records and fill in missing days from default template
      const fullWeek = defaultAvailabilities.map(def => {
        const existing = profile.weeklyAvailabilities.find(a => a.dayOfWeek === def.dayOfWeek);
        if (existing) {
          return {
            ...existing,
            isWorking: true,
            startTime: TimeUtility.fromTimeSpan(existing.startTime),
            endTime: TimeUtility.fromTimeSpan(existing.endTime)
          };
        }
        return def;
      });

      reset({
        ...profile,
        weeklyAvailabilities: fullWeek
      });
    } else if (!loading && doctorId) {
      // If no profile found, initialize with default empty week
      reset({
        doctorId: doctorId,
        slotDurationMinutes: 15,
        timezoneId: "Asia/Aden",
        weeklyAvailabilities: defaultAvailabilities
      });
    }
  }, [profile, loading, doctorId, reset]);

  const onSubmit = async (data: MasterScheduleFormData) => {
    try {
      setSaving(true);
      // Only send days that are actually marked as working
      const workingDays = data.weeklyAvailabilities.filter(avail => avail.isWorking);
      
      const payload = {
        ...data,
        weeklyAvailabilities: workingDays.map(avail => ({
          ...avail,
          startTime: TimeUtility.toTimeSpan(avail.startTime),
          endTime: TimeUtility.toTimeSpan(avail.endTime)
        }))
      };
      await updateProfile(payload);
      onClose();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const timeOptions = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-[#0384c4] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0384c4]/20">
                <CalendarClock className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 italic">Med-Link Master Template</h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{doctorName || "Provider"} • Sana&apos;a GMT+3</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="size-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <Loader2 className="size-8 animate-spin text-[#0384c4]" />
                 <p className="text-sm font-semibold text-slate-500">Synchronizing with Backend...</p>
               </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="size-4 text-[#0384c4]" /> Appointment Slot Duration
                    </label>
                    <Controller
                      control={control}
                      name="slotDurationMinutes"
                      render={({ field }) => (
                        <select 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4]"
                        >
                          {[5, 10, 15, 20, 30, 45, 60].map(m => (
                            <option key={m} value={m}>{m} Minutes</option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.slotDurationMinutes && <p className="text-xs text-red-500 font-bold">{errors.slotDurationMinutes.message}</p>}
                  </div>
                  
                  <div className="flex flex-col gap-2 opacity-60">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Timezone</label>
                    <div className="h-11 flex items-center px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400">
                      Asia/Aden (Sana&apos;a Time - GMT+3)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Weekly Availability Pattern</h3>
                  
                  {/* Live Database Sync Tray */}
                  {doctorId && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="size-3.5" /> Live Database Sync: {genStartDate}
                        </span>
                        {loadingDbSlots && <Loader2 className="size-3 animate-spin text-emerald-600" />}
                      </div>
                      
                      {dbSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-200">
                          {dbSlots.map(slot => (
                            <div key={slot.id} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                              {TimeUtility.format(slot.startTime, "hh:mm a")}
                            </div>
                          ))}
                        </div>
                      ) : !loadingDbSlots && (
                        <p className="text-[10px] font-bold text-slate-400 italic">No available slots found in database for this date.</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {availabilityFields.map((field, idx) => {
                      const isWorking = watch(`weeklyAvailabilities.${idx}.isWorking`);
                      const dayErrors = errors.weeklyAvailabilities?.[idx];

                      return (
                        <div key={field.id} className={`group relative flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                          isWorking 
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#0384c4]/40' 
                            : 'bg-slate-50 dark:bg-slate-950/50 border-transparent opacity-60 grayscale'
                        }`}>
                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-4 w-40 shrink-0">
                              <Controller
                                control={control}
                                name={`weeklyAvailabilities.${idx}.isWorking`}
                                render={({ field }) => (
                                  <button
                                    type="button"
                                    onClick={() => field.onChange(!field.value)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${field.value ? 'bg-[#0384c4]' : 'bg-slate-200 dark:bg-slate-700'}`}
                                  >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </button>
                                )}
                              />
                              <span className={`text-base font-black tracking-tight ${isWorking ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                                {field.dayOfWeek}
                              </span>
                              {isWorking && (
                                <button 
                                  type="button"
                                  onClick={() => applyToAll(idx)}
                                  className="p-1 text-[10px] font-black uppercase text-[#0384c4] hover:bg-[#0384c4]/10 rounded transition-colors"
                                  title="Apply this schedule to all working days"
                                >
                                  Copy
                                </button>
                              )}
                            </div>

                            {isWorking && (
                              <div className="flex items-center gap-3">
                                <Controller
                                  control={control}
                                  name={`weeklyAvailabilities.${idx}.startTime`}
                                  render={({ field }) => (
                                    <select {...field} className="h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-sm font-bold">
                                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  )}
                                />
                                <span className="text-[10px] font-black text-slate-300 tracking-tighter">{">>>"}</span>
                                <Controller
                                  control={control}
                                  name={`weeklyAvailabilities.${idx}.endTime`}
                                  render={({ field }) => (
                                    <select {...field} className="h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-sm font-bold">
                                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  )}
                                />
                              </div>
                            )}
                            
                            {dayErrors && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg animate-pulse">
                                <AlertTriangle className="size-3.5" />
                                <span className="text-[11px] font-black uppercase tracking-wider">
                                  {dayErrors.endTime?.message || dayErrors.root?.message || "Invalid Logic"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400 font-italic">Logic Violation Detected</h4>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80">The current template contains chronologically impossible patterns. Please resolve the red warnings above before deploying.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap justify-between gap-4">
            <div className="flex flex-col gap-3">
              {doctorId && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 px-1">Start Date</label>
                    <input 
                      type="date" 
                      value={genStartDate}
                      onChange={e => setGenStartDate(e.target.value)}
                      className="h-8 bg-transparent text-xs font-bold text-emerald-900 dark:text-emerald-100 outline-none px-1"
                    />
                  </div>
                  <div className="size-4 flex items-center justify-center text-emerald-300">→</div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 px-1">End Date</label>
                    <input 
                      type="date" 
                      value={genEndDate}
                      onChange={e => setGenEndDate(e.target.value)}
                      className="h-8 bg-transparent text-xs font-bold text-emerald-900 dark:text-emerald-100 outline-none px-1"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => generateSlots({ doctorId, start: genStartDate, end: genEndDate })}
                    disabled={generating || saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                    Deploy Factory
                  </button>
                </div>
              )}
              {doctorId && calculateTotalSlots() > 0 && (
                <p className="text-[10px] font-black uppercase text-slate-400 px-1">
                  Est. <span className="text-emerald-600 dark:text-emerald-400">{calculateTotalSlots()} slots</span> will be added to system
                </p>
              )}
            </div>
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-5 py-2.5 font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Discard Changes</button>
              <button 
                type="submit"
                disabled={saving || generating || loading || !isDirty}
                className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-widest rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Authorize Deployment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SlotFactoryProgress 
        isGenerating={generating} 
        onClose={() => {}} 
        summary={profile ? { created: 120, total: 120 } : undefined}
      />
    </>
  );
}
