import { Patient, PatientRegistrationPayload, BalanceAdjustmentPayload, ClinicNotesPayload, PatientHistoryEvent } from "@/domain/entities/Patient";
import { apiClient } from "@/infrastructure/api/ApiClient";

/**
 * PatientRepository — Handles all patient-related API calls to the ASP.NET Core backend.
 * Uses the authenticated apiClient for secure communication.
 */
export const PatientRepository = {

  mapPatient: (p: any): Patient => {
    const name = p.name || p.fullName || p.Name || p.FullName || p.user?.fullName || p.user?.name || "Unknown Patient";
    const phone = p.phone || p.Phone || p.user?.phone || "";
    const gender = p.gender || p.Gender || p.user?.gender || "Male";
    
    const parts = name.trim().split(" ");
    let initials = "UP";
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 1) {
      initials = parts[0][0].toUpperCase();
    }

    return {
      ...p,
      id: p.id || p.Id || p.patientId || p.PatientId,
      userId: p.userId || p.UserId || p.user?.id || p.user?.Id || p.applicationUserId || p.ApplicationUserId || "",
      name,
      phone,
      gender,
      initials: p.initials || p.Initials || initials,
      dob: p.dob || p.dateOfBirth || p.DateOfBirth || p.Dob || "",
      lastVisit: p.lastVisit || p.LastVisit || new Date().toISOString().split('T')[0],
      status: p.status || p.Status || "Active",
      balance: p.balance || p.Balance || 0,
      location: p.location || p.Location || "",
      bloodGroup: p.bloodGroup || p.BloodGroup || "",
      emergencyContactName: p.emergencyContactName || p.EmergencyContactName || "",
      emergencyContactPhone: p.emergencyContactPhone || p.EmergencyContactPhone || "",
    };
  },

  /**
   * Fetch all patients, optionally filtered by search query.
   * Maps to GET /api/patients?search=${search}
   */
  getPatients: async (query?: string): Promise<{ data: Patient[], totalCount: number }> => {
    // Only includes search query if it's not an empty string
    const timestamp = Date.now();
    const endpoint = (query && query.trim()) 
      ? `/patients?search=${encodeURIComponent(query.trim())}&_t=${timestamp}` 
      : `/patients?_t=${timestamp}`;
    
    const response = await apiClient<any>(endpoint);
    
    // Log the very first object to see its exact structure
    let firstObj = null;
    if (Array.isArray(response) && response.length > 0) firstObj = response[0];
    else if (response?.data && Array.isArray(response.data) && response.data.length > 0) firstObj = response.data[0];
    else if (response?.patients && Array.isArray(response.patients) && response.patients.length > 0) firstObj = response.patients[0];
    else if (response?.items && Array.isArray(response.items) && response.items.length > 0) firstObj = response.items[0];
    
    if (firstObj) {
      console.log("🚨 FIRST RAW PATIENT OBJECT FOR MAPPING:", firstObj);
    }
    
    // 1. Direct Array: [ { id: ... }, ... ]
    if (Array.isArray(response)) {
      console.log("🚨 MAPPED AS DIRECT ARRAY. Length:", response.length);
      return { data: response.map(PatientRepository.mapPatient), totalCount: response.length };
    }
    
    // 2. Object with "data": { data: [ ... ], totalCount: 10 }
    if (response && response.data && Array.isArray(response.data)) {
      return {
        data: response.data.map(PatientRepository.mapPatient),
        totalCount: response.totalCount ?? response.data.length ?? 0
      };
    }
    
    // 3. Object with "patients": { patients: [ ... ], count: 10 }
    if (response && response.patients && Array.isArray(response.patients)) {
      return {
        data: response.patients.map(PatientRepository.mapPatient),
        totalCount: response.totalCount ?? response.count ?? response.patients.length ?? 0
      };
    }

    // 4. Object with "items": { items: [ ... ], count: 10 }
    if (response && response.items && Array.isArray(response.items)) {
      return {
        data: response.items.map(PatientRepository.mapPatient),
        totalCount: response.totalCount ?? response.count ?? response.items.length ?? 0
      };
    }

    // 5. Default empty fallback
    return {
      data: [],
      totalCount: 0
    };
  },

  /**
   * Register a new patient.
   * Maps to POST /api/patients
   */
  createPatient: async (payload: PatientRegistrationPayload): Promise<Patient> => {
    const raw = await apiClient<any>("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return PatientRepository.mapPatient(raw);
  },

  /**
   * Update an existing patient's profile.
   * Maps to PUT /api/patients/${id}
   */
  updatePatient: async (id: string, payload: PatientRegistrationPayload): Promise<Patient> => {
    const raw = await apiClient<any>(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return PatientRepository.mapPatient(raw);
  },

  /**
   * Fetch clinical history/timeline for a patient.
   * Maps to GET /api/patients/${id}/history
   */
  getPatientHistory: async (id: string): Promise<PatientHistoryEvent[]> => {
    return await apiClient<PatientHistoryEvent[]>(`/patients/${id}/history`);
  },

  /**
   * Fetch the current balance for a specific patient.
   * Maps to GET /api/patients/${id}/balance
   */
  getBalance: async (id: string): Promise<number> => {
    return await apiClient<number>(`/patients/${id}/balance`);
  },

  /**
   * Adjust a patient's financial balance.
   * Maps to PUT /api/patients/${id}/balance
   * Payload: raw Decimal/Number
   */
  updateBalance: async (id: string, balance: number): Promise<void> => {
    await apiClient<void>(`/patients/${id}/balance`, {
      method: "PUT",
      body: balance.toString(),
      headers: { "Content-Type": "application/json" } // Backend usually expects a content type even for raw numbers
    });
  },

  /**
   * Fetch raw clinic notes for a patient.
   * Maps to GET /api/patients/${id}/notes
   */
  getClinicNotes: async (id: string): Promise<string> => {
    // Backend returns raw string or simple JSON
    const res = await apiClient<any>(`/patients/${id}/notes`);
    return typeof res === "string" ? res : res.notes || "";
  },

  /**
   * Save or update clinic notes.
   * Maps to PUT /api/patients/${id}/notes
   * Payload: raw String
   */
  updateClinicNotes: async (id: string, notes: string): Promise<void> => {
    await apiClient<void>(`/patients/${id}/notes`, {
      method: "PUT",
      body: notes,
      headers: { "Content-Type": "text/plain" }
    });
  },

  /**
   * Permanently delete a patient record.
   * Maps to DELETE /api/patients/${id}
   */
  deletePatient: async (id: string): Promise<void> => {
    await apiClient<void>(`/patients/${id}`, {
      method: "DELETE",
    });
  }
};
