export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type PaymentMethod = "Cash" | "Card" | "Insurance";

export interface Payment {
  id: string;
  patientId: string;
  patientName: string; // Duplicated here for easier/faster UI rendering on the master list
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  timestamp: string; // ISO String
}

export interface PaymentPayload {
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  timestamp: string;
}
