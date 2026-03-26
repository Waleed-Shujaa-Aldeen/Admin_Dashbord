"use client";

import { useState } from "react";
import Header from "@/presentation/components/layout/Header";
import { useBilling } from "@/application/services/useBilling";
import { useAuth } from "@/application/providers/AuthProvider";
import { PaymentDataTable } from "@/presentation/components/payments/PaymentDataTable";
import { ManualPaymentModal } from "@/presentation/components/payments/ManualPaymentModal";
import { DeletePaymentDialog } from "@/presentation/components/payments/DeletePaymentDialog";
import { Payment } from "@/domain/entities/Payment";
import { formatCurrency } from "@/application/utils/formatCurrency";
import { PlusCircle, WalletCards, AlertCircle } from "lucide-react";

export default function PaymentsPage() {
  const { canDeleteRecords } = useAuth();
  const {
    payments,
    loading,
    totalRevenue,
    outstandingBalance,
    createPayment,
    updatePaymentStatus,
    deletePayment,
  } = useBilling();

  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentForDelete, setSelectedPaymentForDelete] = useState<Payment | null>(null);

  const handleOpenEdit = (payment: Payment) => {
    setSelectedPaymentForEdit(payment);
    setIsPaymentModalOpen(true);
  };

  const handleOpenDelete = (payment: Payment) => {
    setSelectedPaymentForDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Header title="Billing & Payments" />
      <div className="px-6 lg:px-10 pb-12">
        <header className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
              Financial Overview
              <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                {payments.length} Records
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage patient transactions, manual statements, and refunds.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Revenue Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm w-full sm:w-auto">
              <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <WalletCards className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>

            {/* Outstanding Balance Card */}
            {outstandingBalance > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm w-full sm:w-auto">
                <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding</p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(outstandingBalance)}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#3b82f6] hover:bg-blue-600 shadow-md shadow-blue-500/20 text-white px-5 h-[62px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 shrink-0 transition-all w-full sm:w-auto"
            >
              <PlusCircle className="size-5" />
              Add Payment
            </button>
          </div>
        </header>

        <PaymentDataTable
          payments={payments}
          loading={loading}
          onEdit={handleOpenEdit}
          onDeleteRequest={handleOpenDelete}
          onStatusUpdate={updatePaymentStatus}
          canDelete={canDeleteRecords}
        />

        {/* Global Modals */}
        <ManualPaymentModal
          isOpen={isPaymentModalOpen}
          initialData={selectedPaymentForEdit}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPaymentForEdit(null);
          }}
          onSubmit={async (dto) => {
            await createPayment(dto);
          }}
        />

        <DeletePaymentDialog
          isOpen={isDeleteDialogOpen}
          payment={selectedPaymentForDelete}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={deletePayment}
        />
      </div>
    </>
  );
}
