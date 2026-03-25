"use client";

import { AlertTriangle, X } from "lucide-react";
import { Payment } from "@/domain/entities/Payment";

interface DeletePaymentDialogProps {
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeletePaymentDialog({ isOpen, payment, onClose, onConfirm }: DeletePaymentDialogProps) {
  if (!isOpen || !payment) return null;

  const handleConfirm = async () => {
    await onConfirm(payment.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-red-200 dark:border-red-900/30">
        
        <div className="p-6 text-center flex flex-col items-center">
          <div className="size-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="size-7 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Delete Payment Record?</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            This action will permanently remove this financial transaction and alter the calculated clinic total revenue. <strong className="text-red-600 dark:text-red-400">This action cannot be undone.</strong>
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Patient:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.patientName}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Amount:</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100">${payment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trx ID:</span>
            <span className="text-xs font-mono text-slate-500">{payment.id}</span>
          </div>
        </div>

        <div className="p-4 flex gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 h-11 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 h-11 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
          >
            Confirm Deletion
          </button>
        </div>

      </div>
    </div>
  );
}
