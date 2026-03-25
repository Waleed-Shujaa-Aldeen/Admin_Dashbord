"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CalendarClock, User, Stethoscope, Clock } from "lucide-react";
import { AppointmentPayload, AppointmentSlot } from "@/domain/entities/Appointment";
import { AppointmentRepository } from "@/infrastructure/api/AppointmentRepository";
import { useDoctors } from "@/application/services/useDoctors";
import { usePatients } from "@/application/services/usePatients";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: AppointmentPayload) => Promise<void>;
}

export function BookAppointmentModal({ isOpen, onClose, onSubmit }: BookAppointmentModalProps) {
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");

  // Dynamic data
  const { patients, loading: patientsLoading } = usePatients();
  const { doctors, loading: doctorsLoading } = useDoctors();

  // Available slots (fetched when doctor + date are selected)
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Fetch slots when doctor + date change
  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      setSlotId("");
      return;
    }

    let cancelled = false;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError(null);
      setSlotId("");
      try {
        const data = await AppointmentRepository.getAvailableSlots(doctorId, date);
        if (!cancelled) {
          // Safety: Filter to ensure we only show slots for the selected local date
          const dateOnlySlots = data.filter(s => s.startTime.startsWith(date));
          setSlots(dateOnlySlots);
        }
      } catch (err: any) {
        if (!cancelled) {
          setSlotsError(err.message || "Failed to load slots");
          setSlots([]);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };

    fetchSlots();
    return () => { cancelled = true; };
  }, [doctorId, date]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPatientId("");
      setDoctorId("");
      setDate("");
      setSlotId("");
      setSlots([]);
      setSlotsError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit = patientId && slotId && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit({ 
        patientId, 
        doctorId, 
        appointmentSlotId: slotId 
      });
      onClose();
    } catch {
      // Modal stays open on error for retry
    } finally {
      setSubmitting(false);
    }
  };

  /** Format an ISO datetime to "09:00 AM - 09:30 AM" */
  const formatSlotLabel = (slot: AppointmentSlot): string => {
    const fmt = (iso: string) => {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
    };
    return `${fmt(slot.startTime)} — ${fmt(slot.endTime)}`;
  };

  const inputClass =
    "w-full h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0384c4]/20 focus:border-[#0384c4] px-3 text-sm disabled:opacity-50 transition-colors";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden shadow-slate-900/20 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-[#0384c4]/10 text-[#0384c4] rounded-lg flex items-center justify-center">
              <CalendarClock className="size-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Book Appointment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Patient Select */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <User className="size-3.5" /> Patient <span className="text-red-400">*</span>
            </label>
            {patientsLoading ? (
              <div className="flex items-center gap-2 h-11 px-3 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin" /> Loading patients…
              </div>
            ) : (
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                disabled={submitting}
                className={inputClass}
              >
                <option value="">— Select a patient —</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Doctor Select */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <Stethoscope className="size-3.5" /> Doctor <span className="text-red-400">*</span>
            </label>
            {doctorsLoading ? (
              <div className="flex items-center gap-2 h-11 px-3 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin" /> Loading doctors…
              </div>
            ) : (
              <select
                value={doctorId}
                onChange={e => { setDoctorId(e.target.value); setSlotId(""); }}
                disabled={submitting}
                className={inputClass}
              >
                <option value="">— Select a doctor —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName} ({d.specialization})</option>
                ))}
              </select>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <CalendarClock className="size-3.5" /> Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setSlotId(""); }}
              disabled={submitting}
              min={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>

            {/* Available Slots with Scrolling & Grouping */}
            <div className="flex-1 min-h-0 flex flex-col gap-3">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.15em] mb-1 flex items-center gap-2">
                <Clock className="size-3.5 text-[#0384c4]" /> Available Slots <span className="text-red-400">*</span>
              </label>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 space-y-4 max-h-[300px]">
                {!doctorId || !date ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <CalendarClock className="size-8 mb-2 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Select a doctor & date</p>
                  </div>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Fetching Slots...</span>
                  </div>
                ) : slotsError ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl text-center">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">{slotsError}</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl text-center">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">No availability for this date</p>
                  </div>
                ) : (
                  <>
                    {[
                      { label: "Morning", filter: (s: any) => new Date(s.startTime).getHours() < 12 },
                      { label: "Afternoon", filter: (s: any) => new Date(s.startTime).getHours() >= 12 && new Date(s.startTime).getHours() < 17 },
                      { label: "Evening", filter: (s: any) => new Date(s.startTime).getHours() >= 17 }
                    ].map(group => {
                      const groupSlots = slots.filter(group.filter);
                      if (groupSlots.length === 0) return null;
                      return (
                        <div key={group.label} className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">{group.label}</h4>
                          <div className="flex flex-wrap gap-2">
                            {groupSlots.map(slot => (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSlotId(slot.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                                  slotId === slot.id
                                    ? "bg-[#0384c4] text-white border-[#0384c4] shadow-lg shadow-blue-500/20 scale-[1.02]"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800 hover:border-[#0384c4]/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                }`}
                              >
                                {formatSlotLabel(slot).split(" — ")[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 font-semibold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-[#0384c4] hover:bg-[#0384c4]/90 text-white font-bold text-sm rounded-lg shadow-md shadow-[#0384c4]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Booking…" : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
