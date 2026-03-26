"use client";

import { useState } from "react";
import { Payment, PaymentStatus, UpdatePaymentStatusDTO } from "@/domain/entities/Payment";
import { formatCurrency } from "@/application/utils/formatCurrency";
import { usePatients } from "@/application/services/usePatients";
import {
  Search, Filter, Pencil, Trash2,
  CreditCard, Banknote, ShieldAlert, Building2,
  CheckCircle2, Loader2
} from "lucide-react";

interface PaymentDataTableProps {
  payments: Payment[];
  loading: boolean;
  onEdit: (payment: Payment) => void;
  onDeleteRequest: (payment: Payment) => void;
  onStatusUpdate?: (id: string, dto: UpdatePaymentStatusDTO) => Promise<any>;
  canDelete?: boolean;
}

// -- Status badge color map --
const STATUS_STYLES: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  Completed: { bg: "bg-emerald-50 border-emerald-200/60", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:   { bg: "bg-amber-50 border-amber-200/60",   text: "text-amber-700",   dot: "bg-amber-500"   },
  Failed:    { bg: "bg-red-50 border-red-200/60",       text: "text-red-700",     dot: "bg-red-500"     },
  Cancelled: { bg: "bg-slate-100 border-slate-200/60",  text: "text-slate-600",   dot: "bg-slate-400"   },
  Refunded:  { bg: "bg-violet-50 border-violet-200/60", text: "text-violet-700",  dot: "bg-violet-500"  },
};

/**
 * Determines which status transitions are allowed for UI quick-actions.
 * Backend enforces the real rules — this prevents obvious mistakes in the UI.
 */
function getAllowedTransitions(current: PaymentStatus): PaymentStatus[] {
  switch (current) {
    case "Pending":    return ["Completed", "Cancelled"];
    case "Completed":  return ["Refunded"];
    case "Failed":     return ["Pending"]; // retry
    case "Cancelled":  return [];
    case "Refunded":   return [];
    default:           return [];
  }
}

export function PaymentDataTable({
  payments, loading, onEdit, onDeleteRequest, onStatusUpdate, canDelete = true
}: PaymentDataTableProps) {
  const { patients } = usePatients();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const renderMethodIcon = (method: string) => {
    switch (method) {
      case "Card":         return <CreditCard className="size-3.5 text-slate-500" />;
      case "Cash":         return <Banknote className="size-3.5 text-slate-500" />;
      case "Insurance":    return <ShieldAlert className="size-3.5 text-slate-500" />;
      case "BankTransfer": return <Building2 className="size-3.5 text-slate-500" />;
      default:             return null;
    }
  };

  const handleQuickStatus = async (payment: Payment, newStatus: PaymentStatus) => {
    if (!onStatusUpdate || updatingId) return;
    setUpdatingId(payment.id);
    try {
      await onStatusUpdate(payment.id, { status: newStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter payments by search + status
  const filtered = payments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.payerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transactionId || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="size-4 absolute mx-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3b82f6] transition-colors" />
          <input
            className="w-full px-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none transition-all text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm"
            placeholder="Search by Patient, ID, or Transaction..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Filter className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="flex-1 sm:flex-none pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "All")}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
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
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Patient / Payer</th>
                  <th className="px-6 py-4 text-right rtl:text-left">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center ltr:text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((payment) => {
                  const style = STATUS_STYLES[payment.status] || STATUS_STYLES.Pending;
                  const transitions = getAllowedTransitions(payment.status);
                  const isUpdating = updatingId === payment.id;
                  
                  const matchedPatient = patients?.find(p => p.userId === payment.payerId || p.id === payment.payerId);
                  const displayPayerName = matchedPatient 
                    ? matchedPatient.name 
                    : (payment.payerName && payment.payerName !== "Patient" 
                        ? payment.payerName 
                        : (payment.payerId ? `Unknown (ID: ${payment.payerId.slice(0, 8)})` : "Unknown Patient"));

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">

                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.id.slice(0, 12)}...</p>
                        <p className="text-xs font-semibold text-slate-400 mt-1">
                          {new Date(payment.createdAt).toLocaleDateString()} • {new Date(payment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {displayPayerName}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right rtl:text-left">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {renderMethodIcon(payment.paymentMethod)}
                          {payment.paymentMethod === "BankTransfer" ? "Bank Transfer" : payment.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wide border ${style.bg} ${style.text}`}>
                          <span className={`size-1.5 rounded-full ${style.dot}`}></span>
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end rtl:justify-start gap-1 w-full">
                          {/* Quick status-change buttons */}
                          {transitions.includes("Completed") && onStatusUpdate && (
                            <button
                              onClick={() => handleQuickStatus(payment, "Completed")}
                              disabled={isUpdating}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Mark as Completed"
                            >
                              {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(payment)}
                            className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-md transition-colors"
                            title="Edit Transaction"
                          >
                            <Pencil className="size-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => onDeleteRequest(payment)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                              title="Delete Transaction"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && !loading && (
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
