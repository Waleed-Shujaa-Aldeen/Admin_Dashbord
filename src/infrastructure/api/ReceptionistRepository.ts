import { Receptionist, ReceptionistPayload } from "@/domain/entities/Receptionist";

const initialMockReceptionists: Receptionist[] = [
  {
    id: "R-101",
    name: "Amanda Clark",
    email: "amanda.c@med-link.com",
    phone: "+1 (555) 987-6543",
    shift: "Morning",
    status: "Active"
  },
  {
    id: "R-102",
    name: "David Lee",
    email: "david.l@med-link.com",
    phone: "+1 (555) 876-5432",
    shift: "Evening",
    status: "Active"
  }
];

let mockReceptionists = [...initialMockReceptionists];

export const ReceptionistRepository = {
  getReceptionists: async (): Promise<Receptionist[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockReceptionists]), 400);
    });
  },

  createReceptionist: async (payload: ReceptionistPayload): Promise<Receptionist> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) return reject(new Error("Failed to create receptionist"));
        
        const newReceptionist: Receptionist = {
          id: `R-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          ...payload
        };
        mockReceptionists.push(newReceptionist);
        resolve(newReceptionist);
      }, 500);
    });
  },

  updateReceptionist: async (id: string, payload: ReceptionistPayload): Promise<Receptionist> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockReceptionists.findIndex(r => r.id === id);
        if (index === -1) return reject(new Error("Receptionist not found"));
        
        mockReceptionists[index] = { ...mockReceptionists[index], ...payload };
        resolve(mockReceptionists[index]);
      }, 400);
    });
  },

  deleteReceptionist: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockReceptionists.length;
        mockReceptionists = mockReceptionists.filter(r => r.id !== id);
        if (mockReceptionists.length === initialLength) return reject(new Error("Not found"));
        resolve();
      }, 400);
    });
  }
};
