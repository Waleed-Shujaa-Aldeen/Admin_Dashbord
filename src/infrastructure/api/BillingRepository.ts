import { Payment, CreatePaymentDTO, UpdatePaymentStatusDTO } from "@/domain/entities/Payment";
import { apiClient } from "@/infrastructure/api/ApiClient";

/**
 * Maps the raw backend response object into a strongly-typed Payment.
 * Handles both camelCase and PascalCase field names from ASP.NET Core.
 */
function mapPayment(raw: any): Payment {
  console.log("Raw Payment Object:", raw);
  return {
    id: raw.id || raw.Id || "",
    amount: raw.amount ?? raw.Amount ?? 0,
    paymentMethod: raw.paymentMethod || raw.PaymentMethod || "Cash",
    status: raw.status || raw.Status || "Pending",
    transactionId: raw.transactionId || raw.TransactionId || undefined,
    payerId: raw.payer?.id || raw.payer?.Id || raw.Payer?.id || raw.Payer?.Id || raw.payerId || raw.PayerId || raw.patientId || raw.PatientId || raw.userId || raw.UserId || raw.patient?.id || raw.patient?.Id || raw.user?.id || raw.user?.Id || "",
    payerName: raw.payer?.name || raw.payer?.Name || raw.Payer?.name || raw.Payer?.Name || raw.payerName || raw.PayerName || raw.patientName || raw.PatientName || raw.payerFullName || raw.PayerFullName || raw.patient?.name || raw.patient?.Name || raw.patient?.fullName || raw.patient?.FullName || raw.user?.fullName || raw.user?.name || undefined,
    appointmentId: raw.appointmentId || raw.AppointmentId || undefined,
    tenantId: raw.tenantId || raw.TenantId || "",
    createdAt: raw.createdAt || raw.CreatedAt || new Date().toISOString(),
  };
}

/**
 * Normalizes any API response shape into an array of raw objects.
 */
function extractArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.items && Array.isArray(response.items)) return response.items;
  if (response?.payments && Array.isArray(response.payments)) return response.payments;
  return [];
}

/**
 * BillingRepository — all payment API calls via authenticated apiClient.
 */
export const BillingRepository = {

  // GET /api/payments — All payments (tenant-scoped)
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await apiClient<any>("/payments");
    return extractArray(response).map(mapPayment);
  },

  // GET /api/payments/{id}
  getPaymentById: async (id: string): Promise<Payment> => {
    const raw = await apiClient<any>(`/payments/${id}`);
    return mapPayment(raw);
  },

  // GET /api/payments/payer/{payerId} — Patient billing history
  getPayerPayments: async (payerId: string): Promise<Payment[]> => {
    const response = await apiClient<any>(`/payments/payer/${payerId}`);
    return extractArray(response).map(mapPayment);
  },

  // GET /api/payments/transaction/{transactionId}
  getPaymentByTransaction: async (transactionId: string): Promise<Payment> => {
    const raw = await apiClient<any>(`/payments/transaction/${transactionId}`);
    return mapPayment(raw);
  },

  // GET /api/payments/appointment/{appointmentId}
  getPaymentByAppointment: async (appointmentId: string): Promise<Payment> => {
    const raw = await apiClient<any>(`/payments/appointment/${appointmentId}`);
    return mapPayment(raw);
  },

  // POST /api/payments — Create a new payment
  createPayment: async (dto: CreatePaymentDTO): Promise<Payment> => {
    const raw = await apiClient<any>("/payments", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    return mapPayment(raw);
  },

  // PUT /api/payments/{id} — Update payment (status change)
  updatePayment: async (id: string, dto: UpdatePaymentStatusDTO): Promise<Payment> => {
    const raw = await apiClient<any>(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
    return mapPayment(raw);
  },

  // DELETE /api/payments/{id}
  deletePayment: async (id: string): Promise<void> => {
    await apiClient<void>(`/payments/${id}`, {
      method: "DELETE",
    });
  },
};
