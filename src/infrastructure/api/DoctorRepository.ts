import { Doctor, DoctorPayload } from "@/domain/entities/Doctor";
import { apiClient } from "./ApiClient";

export const DoctorRepository = {
  mapDoctor: (d: any): Doctor => {
    // Pull name from top-level, or nested user object, or PascalCase variants
    const fullName =
      d.fullName || d.name ||
      d.user?.fullName || d.user?.name ||
      d.FullName || d.Name ||
      d.User?.FullName || d.User?.Name ||
      "Unknown Doctor";

    const specialization =
      d.specialization || d.specialty ||
      d.Specialization || d.Specialty ||
      "General";

    return {
      ...d,
      id: d.id || d.Id || d.userId || d.UserId,
      fullName,
      specialization,
      email: d.email || d.Email || d.user?.email || d.user?.Email || d.User?.email || d.User?.Email || "",
      phone: d.phone || d.Phone || d.user?.phone || d.user?.Phone || d.User?.phone || d.User?.Phone || "",
      status: d.status || d.Status || "Active",
      licenseNumber: d.licenseNumber || d.LicenseNumber || "",
      biography: d.biography || d.Biography || "",
      address: d.address || d.Address || "",
      consultationFee: d.consultationFee || d.ConsultationFee || 0,
      yearsOfExperience: d.yearsOfExperience || d.YearsOfExperience || 0,
      licenseIssuedAt: d.licenseIssuedAt || d.LicenseIssuedAt || "",
      licenseExpiryAt: d.licenseExpiryAt || d.LicenseExpiryAt || ""
    };
  },

  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient<any>("/doctors");
    console.log("🚨 RAW DOCTORS API RESPONSE:", response);
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      console.log("🚨 DOCTORS RESPONSE KEYS:", Object.keys(response));
    }

    // Handle different API response structures
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (response && response.items && Array.isArray(response.items)) {
      rawList = response.items;
    } else if (response && response.data && Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      rawList = response.data.items;
    } else if (response && response.doctors && Array.isArray(response.doctors)) {
      rawList = response.doctors;
    } else if (response && response.results && Array.isArray(response.results)) {
      rawList = response.results;
    }

    if (rawList.length > 0) {
      console.log("🚨 FIRST RAW DOCTOR OBJECT FOR MAPPING:", rawList[0]);
    }

    return rawList.map(DoctorRepository.mapDoctor);
  },

  createDoctor: async (payload: DoctorPayload): Promise<Doctor> => {
    const raw = await apiClient<any>("/doctors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return DoctorRepository.mapDoctor(raw); // <--- This fixes the frontend display bug!
  },

  updateDoctor: async (id: string, payload: DoctorPayload): Promise<Doctor> => {
    const raw = await apiClient<any>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return DoctorRepository.mapDoctor(raw);
  },

  deleteDoctor: async (id: string): Promise<void> => {
    return apiClient<void>(`/doctors/${id}`, {
      method: "DELETE",
    });
  }
};
