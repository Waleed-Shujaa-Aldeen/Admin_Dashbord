export interface Staff {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  shiftHours: string; // e.g., "08:00 - 17:00"
  status: "Active" | "On Break" | "Remote";
}
