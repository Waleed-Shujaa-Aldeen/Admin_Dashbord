"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, X, Search } from "lucide-react";
import { Payment, PaymentPayload, PaymentStatus, PaymentMethod } from "@/domain/entities/Payment";
import { usePatients } from "@/application/services/usePatients";

interface ManualPaymentModalProps {
  isOpen: boolean;
  initialData?: Payment | null;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => Promise<Payment | void>;
}

export function ManualPaymentModal({ isOpen, initialData, onClose, onSubmit }: ManualPaymentModalProps) {
  const isEditing = !!initialData;
  const { patients } = usePatients(); // Hooking into the existing repo to fetch patient lookup list

  const [formData, setFormData] = useState<PaymentPayload>({
    patientId: "",
    amount: 0,
    method: "Card",
    status: "Paid",
    timestamp: new Date().toISOString().slice(0, 16) // datetime-local format YYYY-MM-DDThh:mm
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        patientId: initialData.patientId,
        amount: initialData.amount,
        method: initialData.method,
        status: initialData.status,
        timestamp: new Date(initialData.timestamp).toISOString().slice(0, 16)
      });
    } else {
      setFormData({ 
        patientId: "", 
        amount: 0, 
        method: "Card", 
        status: "Paid", 
        timestamp: new Date().toISOString().slice(0, 16) 
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submissionPayload = {
        ...formData,
        timestamp: new Date(formData.timestamp).toISOString() // convert string back to ISO
      };
      await onSubmit(submissionPayload);
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

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Patient Search Dropdown Proxy */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Linked Patient</label>
              <div className="relative">
                <Search className="size-4 absolute top-1/2 -translate-y-1/2 mx-3 text-slate-400" />
                <select 
                  required
                  className="h-11 px-10 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] appearance-none"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  disabled={isEditing}
                >
                  <option value="" disabled>Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                  {/* Fallback mocks if patient repo is empty for demo logic */}
                  <option value="P-10021">John Doe (ID: P-10021)</option>
                  <option value="P-10022">Jane Smith (ID: P-10022)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount ($)</label>
              <input 
                required
                type="number"
                step="0.01" 
                min="0"
                className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Method</label>
                <select 
                  className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
                >
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select 
                  className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as PaymentStatus})}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date & Time</label>
              <input 
                required
                type="datetime-local" 
                className="h-11 px-3 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                value={formData.timestamp}
                onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
              />
            </div>

          </form>
        </div>

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
            disabled={isSubmitting || !formData.patientId}
            className="flex-1 h-11 px-4 text-sm font-bold text-white bg-[#3b82f6] hover:bg-blue-600 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (isEditing ? "Update Statement" : "Add Payment")}
          </button>
        </div>
      </div>
    </div>
  );
}
