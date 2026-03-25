import { DateException, AddExceptionPayload } from "@/domain/entities/DateException";
import { apiClient } from "./ApiClient";

function mapException(raw: any): DateException {
  return {
    id: raw.id || raw.Id || "",
    doctorId: raw.doctorId || raw.DoctorId || "",
    date: (raw.date || raw.Date || "").split("T")[0], // Extract pure date (YYYY-MM-DD)
    reason: raw.reason || raw.Reason || "Other",
    isUnavailable: raw.isUnavailable ?? raw.IsUnavailable ?? true,
  };
}

export const DateExceptionRepository = {
  getExceptions: async (doctorId: string): Promise<DateException[]> => {
    // Verified endpoint: /api/doctors/{doctorId}/exceptions
    const response = await apiClient<any>(`/doctors/${doctorId}/exceptions`);
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (response?.items && Array.isArray(response.items)) {
      rawList = response.items;
    } else if (response?.data && Array.isArray(response.data)) {
      rawList = response.data;
    }

    return rawList.map(mapException);
  },

  addException: async (doctorId: string, payload: AddExceptionPayload): Promise<DateException> => {
    // Standardized UTC payload without 'Z' to prevent backend DateTimeOffset crashes
    const body = {
      ...payload,
      date: new Date(payload.date).toISOString().replace(/\.\d{3}Z$/, '')
    };

    const raw = await apiClient<any>(`/doctors/${doctorId}/exceptions`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapException(raw);
  },

  deleteException: async (doctorId: string, exceptionId: string): Promise<void> => {
    // Verified endpoint: /api/doctors/{doctorId}/exceptions/{exceptionId}
    return apiClient<void>(`/doctors/${doctorId}/exceptions/${exceptionId}`, {
      method: "DELETE",
    });
  }
};
