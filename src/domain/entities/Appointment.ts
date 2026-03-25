export interface AppointmentSlot {
  id: string;
  doctorId: string;
  startTime: string;  // ISO datetime from backend
  endTime: string;    // ISO datetime from backend
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentSlotId: string;
  date: string;           // YYYY-MM-DD (derived from slot)
  time: string;           // HH:mm AM/PM (derived from slot)
  durationMinutes: number;
  status: "Confirmed" | "Pending" | "Cancelled";
}

export interface AppointmentPayload {
  patientId: string;
  doctorId: string;
  appointmentSlotId: string;
}
