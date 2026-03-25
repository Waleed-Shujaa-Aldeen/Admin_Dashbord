export interface Receptionist {
  id: string;
  name: string;
  email: string;
  phone: string;
  shift: string; // e.g. "Morning", "Evening"
  status: "Active" | "Inactive";
}

export interface ReceptionistPayload {
  name: string;
  email: string;
  phone: string;
  shift: string;
  status: "Active" | "Inactive";
}
