import { Patient } from "@/domain/entities/Patient";

const mockPatients: Patient[] = [
  { id: "P-10021", initials: "JD", name: "John Doe", lastVisit: "Oct 24, 2023", status: "Active", balance: 150.00 },
  { id: "P-10022", initials: "JS", name: "Jane Smith", lastVisit: "Oct 22, 2023", status: "Pending", balance: 0.00 },
  { id: "P-10023", initials: "RB", name: "Robert Brown", lastVisit: "Oct 21, 2023", status: "Active", balance: 45.50 },
  { id: "P-10024", initials: "ED", name: "Emily Davis", lastVisit: "Oct 20, 2023", status: "Inactive", balance: 200.00 },
];

export const MockPatientRepository = {
  getPatients: async (): Promise<Patient[]> => {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve(mockPatients), 300));
  },
};
