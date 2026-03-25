import { Payment, PaymentPayload } from "@/domain/entities/Payment";

// --- Mock Data simulating a DB ---
let mockPayments: Payment[] = [
  { id: "PAY-1001", patientId: "P-10021", patientName: "John Doe", amount: 150.00, currency: "USD", method: "Card", status: "Paid", timestamp: "2023-10-24T10:30:00Z" },
  { id: "PAY-1002", patientId: "P-10023", patientName: "Robert Brown", amount: 45.50, currency: "USD", method: "Cash", status: "Paid", timestamp: "2023-10-21T09:15:00Z" },
  { id: "PAY-1003", patientId: "P-10024", patientName: "Emily Davis", amount: 200.00, currency: "USD", method: "Insurance", status: "Pending", timestamp: "2023-10-20T14:45:00Z" },
  { id: "PAY-1004", patientId: "P-10022", patientName: "Jane Smith", amount: 75.00, currency: "USD", method: "Card", status: "Refunded", timestamp: "2023-10-18T11:20:00Z" },
];

// --- API Router / Repository ---
export const BillingRepository = {
  
  // Maps to GET /api/payments
  getAllPayments: async (): Promise<{ data: Payment[], totalRevenue: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Calculate total revenue from 'Paid' statuses
        const totalRevenue = mockPayments
          .filter(p => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0);

        // Sort by newest first
        const sortedData = [...mockPayments].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        resolve({ data: sortedData, totalRevenue });
      }, 300); // Simulate network latency
    });
  },

  // Maps to POST /api/payments
  recordPayment: async (payload: PaymentPayload): Promise<Payment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real scenario, patientName would be fetched or joined via DB foreign key.
        // We will mock fetching the name from the mocked global scope or just use a placeholder
        // For this demo context, we assume the frontend passes the correct Name alongside, 
        // or the backend hydrates it. We'll simulate backend hydration.
        const mockNameLookup: Record<string, string> = {
          "P-10021": "John Doe",
          "P-10022": "Jane Smith",
          "P-10023": "Robert Brown",
          "P-10024": "Emily Davis"
        };
        
        const newPayment: Payment = {
          id: `PAY-${1000 + Math.floor(Math.random() * 9000)}`,
          patientId: payload.patientId,
          patientName: mockNameLookup[payload.patientId] || "Unknown Patient",
          amount: payload.amount,
          currency: "USD",
          method: payload.method,
          status: payload.status,
          timestamp: payload.timestamp
        };
        
        mockPayments.unshift(newPayment);
        resolve(newPayment);
      }, 400);
    });
  },

  // Maps to PUT /api/payments/{id}
  updatePayment: async (id: string, payload: PaymentPayload): Promise<Payment> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockPayments.findIndex(p => p.id === id);
        if (index === -1) return reject(new Error("Payment not found"));

        mockPayments[index] = {
          ...mockPayments[index],
          patientId: payload.patientId,
          amount: payload.amount,
          method: payload.method,
          status: payload.status,
          timestamp: payload.timestamp
        };
        resolve(mockPayments[index]);
      }, 300);
    });
  },

  // Maps to DELETE /api/payments/{id}
  cancelPayment: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockPayments.length;
        mockPayments = mockPayments.filter(p => p.id !== id);
        if (mockPayments.length === initialLength) return reject(new Error("Payment not found"));
        resolve();
      }, 300);
    });
  }
};
