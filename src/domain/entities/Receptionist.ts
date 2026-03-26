export interface Receptionist {
  id: string;
  name: string;
  phone: string;
  shift: string; // e.g. "Morning", "Evening"
  status: "Active" | "Inactive";
}

export interface ReceptionistPayload {
  name: string;
  phone: string;
  shift: string;
  status: "Active" | "Inactive";
}
