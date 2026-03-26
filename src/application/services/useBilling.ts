import { useState, useCallback, useEffect } from "react";
import { Payment, CreatePaymentDTO, UpdatePaymentStatusDTO } from "@/domain/entities/Payment";
import { BillingRepository } from "@/infrastructure/api/BillingRepository";
import { useToast } from "@/application/providers/ToastProvider";

/**
 * Generates a UUID v4 for idempotency tracking on payment creation.
 */
function generateUUID(): string {
  return crypto.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

export function useBilling() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { success } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BillingRepository.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /**
   * Create a new payment.
   * Automatically generates a transactionId for idempotency.
   */
  const createPayment = async (dto: CreatePaymentDTO) => {
    try {
      const payload: CreatePaymentDTO = {
        ...dto,
        transactionId: dto.transactionId || generateUUID(),
      };
      const created = await BillingRepository.createPayment(payload);
      setPayments((prev) => [created, ...prev]);
      success("Payment successfully recorded.");
      return created;
    } catch (err: any) {
      setError(err.message || "Failed to create payment");
      throw err;
    }
  };

  /**
   * Update payment status (e.g., Mark as Completed, Refund, Cancel).
   */
  const updatePaymentStatus = async (id: string, dto: UpdatePaymentStatusDTO) => {
    try {
      const updated = await BillingRepository.updatePayment(id, dto);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      success(`Payment status updated to ${dto.status}.`);
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update payment status");
      throw err;
    }
  };

  /**
   * Delete a payment record permanently.
   */
  const deletePayment = async (id: string) => {
    try {
      await BillingRepository.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      success("Payment record permanently deleted.");
    } catch (err: any) {
      setError(err.message || "Failed to delete payment");
      throw err;
    }
  };

  /**
   * Fetch all payments for a specific payer (patient billing history).
   */
  const fetchPayerPayments = async (payerId: string): Promise<Payment[]> => {
    try {
      return await BillingRepository.getPayerPayments(payerId);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payer payments");
      throw err;
    }
  };

  // Derive computed stats from loaded data
  const totalRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingBalance = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    payments,
    loading,
    error,
    totalRevenue,
    outstandingBalance,
    fetchPayments,
    createPayment,
    updatePaymentStatus,
    deletePayment,
    fetchPayerPayments,
  };
}
