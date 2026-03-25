export type PatientStatus = "Active" | "Pending" | "Inactive";
export type HistoryCategory = "Medical" | "Financial" | "Administrative";

export interface PatientHistoryEvent {
  id: string;
  date: string; // ISO date string
  title: string;
  description: string;
  category: HistoryCategory;
}

export interface Patient {
  id: string; // e.g., "P-10021"
  initials: string; // e.g., "JD"
  name: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  phone?: string;
  email?: string;
  lastVisit: string; // ISO date string or formatted date
  status: PatientStatus;
  balance: number; // e.g., 150.00
  
  // Profile Fields
  location?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PatientRegistrationPayload {
  user: {
    fullName: string;
    phone: string;
    email: string;
    password?: string; // Optional for edit
    gender: number; // 0 for Male, 1 for Female, 2 for Other, etc., based on requirements
  };
  dateOfBirth?: string;
  location: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface BalanceAdjustmentPayload {
  newBalance: number;
  reason: string;
}

export interface ClinicNotesPayload {
  notes: string;
}
