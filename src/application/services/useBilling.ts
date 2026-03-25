import { useState, useCallback, useEffect } from "react";
import { Payment, PaymentPayload } from "@/domain/entities/Payment";
import { BillingRepository } from "@/infrastructure/api/BillingRepository";
import { useToast } from "@/application/providers/ToastProvider";

export function useBilling() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  const { success } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BillingRepository.getAllPayments();
      setPayments(response.data);
      setTotalRevenue(response.totalRevenue);
    } catch (err) {
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const recordPayment = async (payload: PaymentPayload) => {
    try {
      const newPayment = await BillingRepository.recordPayment(payload);
      setPayments(prev => [newPayment, ...prev]);
      if (newPayment.status === "Paid") {
        setTotalRevenue(prev => prev + newPayment.amount);
      }
      success("Payment successfully recorded.");
      return newPayment;
    } catch (err) {
      setError("Failed to record payment");
      throw err;
    }
  };

  const editPayment = async (id: string, payload: PaymentPayload) => {
    try {
      // Find old payment to adjust revenue correctly if needed
      const oldPayment = payments.find(p => p.id === id);
      const updatedPayment = await BillingRepository.updatePayment(id, payload);
      
      setPayments(prev => prev.map(p => p.id === id ? updatedPayment : p));
      
      // Revenue Recalculation logic: 
      // If it changed *to* or *from* 'Paid', or amount changed while 'Paid'
      if (oldPayment) {
        let revenueDelta = 0;
        if (oldPayment.status === "Paid") revenueDelta -= oldPayment.amount;
        if (updatedPayment.status === "Paid") revenueDelta += updatedPayment.amount;
        
        if (revenueDelta !== 0) {
          setTotalRevenue(prev => prev + revenueDelta);
        }
      }

      success("Payment record updated.");
      return updatedPayment;
    } catch (err) {
      setError("Failed to update payment");
      throw err;
    }
  };

  const removePayment = async (id: string) => {
    try {
      const paymentToRemove = payments.find(p => p.id === id);
      await BillingRepository.cancelPayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      
      if (paymentToRemove && paymentToRemove.status === "Paid") {
        setTotalRevenue(prev => prev - paymentToRemove.amount);
      }
      
      success("Payment record permanently deleted.");
    } catch (err) {
      setError("Failed to delete payment");
      throw err;
    }
  };

  return {
    payments,
    loading,
    error,
    totalRevenue,
    fetchPayments,
    recordPayment,
    editPayment,
    removePayment
  };
}
