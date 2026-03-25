import { Appointment, AppointmentSlot, AppointmentPayload } from "@/domain/entities/Appointment";
import { apiClient } from "./ApiClient";

function mapAppointment(raw: any): Appointment {
  // Derive date and time from raw.appointmentDate (ISO string from backend)
  let dateStr = "";
  let timeStr = "";
  if (raw.appointmentDate || raw.AppointmentDate) {
    const d = new Date(raw.appointmentDate || raw.AppointmentDate);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dateStr = `${y}-${m}-${day}`;
      
      let h = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      timeStr = `${String(h).padStart(2, "0")}:${mins} ${ampm}`;
    }
  }

  return {
    id: raw.id || raw.Id || "",
    patientId: raw.patientId || raw.PatientId || "",
    patientName: raw.patientFullName || raw.PatientFullName || raw.patientName || raw.PatientName || "Unknown Patient",
    patientInitials: raw.patientInitials || raw.PatientInitials || "UP",
    doctorId: raw.doctorId || raw.DoctorId || "",
    doctorName: raw.doctorFullName || raw.DoctorFullName || raw.doctorName || raw.DoctorName || "Unknown Doctor",
    specialty: raw.specialty || raw.Specialty || "General",
    appointmentSlotId: raw.appointmentSlotId || raw.AppointmentSlotId || "",
    date: dateStr || raw.date || raw.Date || "",
    time: timeStr || raw.time || raw.Time || "",
    durationMinutes: raw.durationMinutes || raw.DurationMinutes || 15,
    status: raw.status || raw.Status || "Confirmed"
  };
}

function mapSlot(raw: any): AppointmentSlot {
  return {
    id: raw.id || raw.Id || "",
    doctorId: raw.doctorId || raw.DoctorId || "",
    startTime: raw.startTime || raw.StartTime || raw.startDateTimeUtc || raw.StartDateTimeUtc || "",
    endTime: raw.endTime || raw.EndTime || raw.endDateTimeUtc || raw.EndDateTimeUtc || "",
    isBooked: raw.isBooked ?? raw.IsBooked ?? (raw.status === "Booked" || raw.Status === "Booked")
  };
}

export const AppointmentRepository = {
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient<any>("/appointments");
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (response?.items && Array.isArray(response.items)) {
      rawList = response.items;
    } else if (response?.data && Array.isArray(response.data)) {
      rawList = response.data;
    }
    return rawList.map(mapAppointment);
  },

  createAppointment: async (payload: AppointmentPayload): Promise<Appointment> => {
    const raw = await apiClient<any>("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapAppointment(raw);
  },

  cancelAppointment: async (id: string): Promise<void> => {
    return apiClient<void>(`/appointments/${id}`, {
      method: "DELETE",
    });
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<AppointmentSlot[]> => {
    // Standard UTC Day window for GMT+3:
    // April 20th 00:00 (GMT+3) -> April 19th 21:00 (UTC)
    // April 20th 23:59 (GMT+3) -> April 20th 20:59 (UTC)
    const localDate = new Date(date);
    const startUtc = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() - 1, 21, 0, 0)).toISOString();
    const endUtc = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 20, 59, 59)).toISOString();

    const response = await apiClient<any>(`/doctors/${doctorId}/slots?start=${encodeURIComponent(startUtc)}&end=${encodeURIComponent(endUtc)}`);
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (response?.items && Array.isArray(response.items)) {
      rawList = response.items;
    } else if (response?.data && Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response?.slots && Array.isArray(response.slots)) {
      rawList = response.slots;
    }
    return rawList.map(mapSlot);
  },
  checkImpact: async (doctorId: string, startDate: string, endDate: string): Promise<Appointment[]> => {
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    // Align to GMT+3 logic: Start at 21:00 UTC previous day, end at 20:59 UTC current day
    const startUtc = new Date(Date.UTC(startObj.getFullYear(), startObj.getMonth(), startObj.getDate() - 1, 21, 0, 0)).toISOString();
    const endUtc = new Date(Date.UTC(endObj.getFullYear(), endObj.getMonth(), endObj.getDate(), 20, 59, 59)).toISOString();

    // 2. Fetch slots for this window
    const response = await apiClient<any>(`/doctors/${doctorId}/slots?start=${encodeURIComponent(startUtc)}&end=${encodeURIComponent(endUtc)}`);
    
    let rawSlots: any[] = [];
    if (Array.isArray(response)) rawSlots = response;
    else if (response?.items) rawSlots = response.items;
    else if (response?.data) rawSlots = response.data;
    else if (response?.slots) rawSlots = response.slots;

    // 3. Filter for "Booked" slots and map to "pseudo-appointments" for UI preview
    // The UI expects an Appointment array to show patient names
    return rawSlots
      .filter((s: any) => s.status === "Booked" || s.Status === "Booked" || s.isBooked === true)
      .map((s: any) => ({
        id: s.appointmentId || s.id,
        patientName: s.patientName || "Booked Patient",
        time: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown",
        status: "Confirmed"
      } as any));
  }
};
