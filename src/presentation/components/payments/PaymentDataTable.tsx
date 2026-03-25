"use client";

import { Payment } from "@/domain/entities/Payment";
import { Search, Filter, Pencil, Trash2, CreditCard, Banknote, ShieldAlert } from "lucide-react";

interface PaymentDataTableProps {
  payments: Payment[];
  loading: boolean;
  onEdit: (payment: Payment) => void;
  onDeleteRequest: (payment: Payment) => void;
}

export function PaymentDataTable({ payments, loading, onEdit, onDeleteRequest }: PaymentDataTableProps) {

  const renderMethodIcon = (method: string) => {
    switch (method) {
      case 'Card': return <CreditCard className="size-3.5 text-slate-500" />;
      case 'Cash': return <Banknote className="size-3.5 text-slate-500" />;
      case 'Insurance': return <ShieldAlert className="size-3.5 text-slate-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="size-4 absolute mx-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b82f6] transition-colors" />
          <input 
            className="w-full px-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm" 
            placeholder="Search payments by Patient Name or ID..." 
            type="text" 
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 shadow-sm">
            <Filter className="size-4" />
            Filter Status
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center">
            <span className="size-8 border-4 border-slate-200 dark:border-slate-800 border-t-[#3b82f6] rounded-full animate-spin mb-4"></span>
            <p className="text-sm font-semibold text-slate-500">Loading financials...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Patient Profile</th>
                  <th className="px-6 py-4 text-right rtl:text-left">Amount</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center ltr:text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.id}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">{new Date(payment.timestamp).toLocaleDateString()} • {new Date(payment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.patientName}</p>
                      <p className="text-xs font-medium text-slate-500">ID: {payment.patientId}</p>
                    </td>

                    <td className="px-6 py-4 text-right rtl:text-left">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {payment.amount.toLocaleString('en-US', { style: 'currency', currency: payment.currency })}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {renderMethodIcon(payment.method)}
                        {payment.method}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wide border ${
                        payment.status === "Paid" ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                        payment.status === "Refunded" ? 'bg-red-50 text-red-700 border-red-200/60' :
                        'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          payment.status === 'Paid' ? 'bg-emerald-500' : 
                          payment.status === 'Refunded' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end rtl:justify-start gap-1 w-full">
                        <button 
                          onClick={() => onEdit(payment)}
                          className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-md transition-colors"
                          title="Edit Transaction"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteRequest(payment)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {payments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                        <Banknote className="size-6 text-slate-400" />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">No payment records found.</p>
                      <p className="text-sm mt-1">Adjust search parameters or add a new payment.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
