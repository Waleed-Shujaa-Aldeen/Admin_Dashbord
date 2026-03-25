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
        if (!cancelled) setSlots(data);
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
      await onSubmit({ patientId, appointmentSlotId: slotId });
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

          {/* Available Slots */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <Clock className="size-3.5" /> Available Slot <span className="text-red-400">*</span>
            </label>
            {!doctorId || !date ? (
              <p className="text-sm text-slate-400 italic h-11 flex items-center">Select a doctor and date first</p>
            ) : slotsLoading ? (
              <div className="flex items-center gap-2 h-11 px-3 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin" /> Fetching available slots…
              </div>
            ) : slotsError ? (
              <p className="text-sm text-red-500 h-11 flex items-center">{slotsError}</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-amber-600 italic h-11 flex items-center">No available slots for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSlotId(slot.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      slotId === slot.id
                        ? "bg-[#0384c4] text-white border-[#0384c4] shadow-md shadow-[#0384c4]/20"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0384c4] hover:text-[#0384c4]"
                    }`}
                  >
                    {formatSlotLabel(slot)}
                  </button>
                ))}
              </div>
            )}
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
