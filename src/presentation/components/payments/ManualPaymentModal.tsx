"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, X, Search, Loader2 } from "lucide-react";
import { Payment, CreatePaymentDTO, PaymentStatus, PaymentMethod } from "@/domain/entities/Payment";
import { usePatients } from "@/application/services/usePatients";
import { useAppointments } from "@/application/services/useAppointments";

interface ManualPaymentModalProps {
  isOpen: boolean;
  initialData?: Payment | null;
  onClose: () => void;
  onSubmit: (payload: CreatePaymentDTO) => Promise<Payment | void>;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "BankTransfer", label: "Bank Transfer" },
  { value: "Insurance", label: "Insurance" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
];

export function ManualPaymentModal({ isOpen, initialData, onClose, onSubmit }: ManualPaymentModalProps) {
  const isEditing = !!initialData;
  const { patients } = usePatients();
  const { appointments } = useAppointments();

  const [formData, setFormData] = useState<{
    payerId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    appointmentId: string;
  }>({
    payerId: "",
    amount: 0,
    paymentMethod: "Cash",
    appointmentId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        payerId: initialData.payerId,
        amount: initialData.amount,
        paymentMethod: initialData.paymentMethod,
        appointmentId: initialData.appointmentId || "",
      });
    } else {
      setFormData({
        payerId: "",
        amount: 0,
        paymentMethod: "Cash",
        appointmentId: "",
      });
      setPatientSearch("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.id?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Find the selected patient to get all their associated IDs
  const selectedPatient = patients.find(
    (p) => p.id === formData.payerId || p.userId === formData.payerId
  );

  // Filter appointments for the selected patient using either ID
  const patientAppointments = appointments.filter(
    (a) => selectedPatient && (a.patientId === selectedPatient.id || a.patientId === selectedPatient.userId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    try {
      const dto: CreatePaymentDTO = {
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        payerId: formData.payerId,
        appointmentId: formData.appointmentId || undefined,
      };
      await onSubmit(dto);
      onClose();
    } catch {
      // toast handles the error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex rtl:justify-start ltr:justify-end bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-s border-s-slate-200 dark:border-s-slate-800 rtl:border-s-0 rtl:border-e rtl:border-e-slate-200 dark:rtl:border-e-slate-800 animate-in slide-in-from-right rtl:slide-in-from-left duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-xl flex items-center justify-center">
              {isEditing ? <Save className="size-5" /> : <CreditCard className="size-5" />}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Transaction" : "Record Payment"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Patient Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Linked Patient</label>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full h-11 pl-10 pr-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    disabled={isEditing}
                  />
                </div>
                <select
                  required
                  className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] appearance-none"
                  value={formData.payerId}
                  onChange={(e) => setFormData({ ...formData, payerId: e.target.value, appointmentId: "" })}
                  disabled={isEditing}
                >
                  <option value="" disabled>Select a patient...</option>
                  {filteredPatients.map((p) => {
                    const validGuid = p.userId || p.id;
                    return (
                      <option key={p.id} value={validGuid}>
                        {p.name} (ID: {validGuid.slice(0, 8)}...)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Method</label>
              <select
                className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Linked Appointment (optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Linked Appointment <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                value={formData.appointmentId}
                onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                disabled={!formData.payerId}
              >
                <option value="">No linked appointment</option>
                {patientAppointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.date} — {a.time} with Dr. {a.doctorName}
                  </option>
                ))}
              </select>
              {formData.payerId && patientAppointments.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">No appointments found for this patient.</p>
              )}
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isSubmitting || !formData.payerId || formData.amount <= 0}
            className="flex-1 h-11 px-4 text-sm font-bold text-white bg-[#3b82f6] hover:bg-blue-600 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </span>
            ) : (
              isEditing ? "Update Statement" : "Add Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
