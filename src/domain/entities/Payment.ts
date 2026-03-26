// --- Enums matching the backend Domain layer ---

export type PaymentMethod = "Cash" | "Card" | "BankTransfer" | "Insurance";

export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Cancelled" | "Refunded";

// --- Data Model (maps to backend Payment entity) ---

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  payerId: string;        // Patient ID
  payerName?: string;     // Hydrated by backend or mapper for UI convenience
  appointmentId?: string;
  tenantId: string;
  createdAt: string;      // ISO Date String
}

// --- Request DTOs ---

export interface CreatePaymentDTO {
  amount: number;
  paymentMethod: PaymentMethod;
  payerId: string;
  appointmentId?: string;
  transactionId?: string; // Frontend-generated UUID for idempotency
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
}
