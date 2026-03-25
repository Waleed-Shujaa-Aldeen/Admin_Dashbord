import { ScheduleProfile, ScheduleProfilePayload, DaySchedule } from "@/domain/entities/ScheduleProfile";
import { apiClient } from "./ApiClient";

function mapProfile(raw: any): ScheduleProfile {
  return {
    doctorId: raw.doctorId || raw.DoctorId || "",
    slotDurationMinutes: raw.slotDurationMinutes || raw.SlotDurationMinutes || 15,
    timezoneId: raw.timezoneId || raw.TimezoneId || "UTC",
    weeklyAvailabilities: raw.weeklyAvailabilities || raw.WeeklyAvailabilities || [],
  };
}

export const ScheduleProfileRepository = {
  getProfile: async (doctorId: string): Promise<ScheduleProfile> => {
    const raw = await apiClient<any>(`/doctors/${doctorId}/schedule-profile`, { skipToast: true });
    return mapProfile(raw);
  },

  updateProfile: async (payload: ScheduleProfilePayload): Promise<ScheduleProfile> => {
    const raw = await apiClient<any>(`/doctors/${payload.doctorId}/schedule-profile`, {
      method: "POST", // User said POST is used for create/update
      body: JSON.stringify(payload),
    });
    return mapProfile(raw);
  },

  generateSlots: async (doctorId: string, start?: string, end?: string): Promise<void> => {
    let url = `/doctors/${doctorId}/schedule-profile/generate`;
    if (start || end) {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      url += `?${params.toString()}`;
    }
    await apiClient<void>(url, {
      method: "POST",
    });
  },
};
