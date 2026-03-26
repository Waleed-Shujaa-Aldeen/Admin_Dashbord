import { Receptionist, ReceptionistPayload } from "@/domain/entities/Receptionist";
import { apiClient } from "@/infrastructure/api/ApiClient";

/**
 * Maps the raw backend response object into a strongly-typed Receptionist.
 * Handles both camelCase and PascalCase field names from ASP.NET Core.
 */
function mapReceptionist(raw: any): Receptionist {
  return {
    id: raw.id || raw.Id || "",
    name: raw.name || raw.Name || raw.fullName || raw.FullName || raw.user?.fullName || raw.user?.name || "Unknown",
    phone: raw.phone || raw.Phone || raw.user?.phone || "",
    shift: raw.location || raw.Location || raw.shift || raw.Shift || "Morning",
    status: raw.status || raw.Status || (raw.user?.isVerified ? "Active" : "Active"), // Defaulting to Active for now
  };
}

export const ReceptionistRepository = {
  /**
   * Fetch all receptionists from the backend.
   * GET /api/receptionists
   */
  getReceptionists: async (): Promise<Receptionist[]> => {
    const response = await apiClient<any>("/receptionists");
    
    // Normalize response shape (Array or { data: Array })
    let rawList: any[] = [];
    if (Array.isArray(response)) rawList = response;
    else if (response?.data && Array.isArray(response.data)) rawList = response.data;
    else if (response?.items && Array.isArray(response.items)) rawList = response.items;
    
    return rawList.map(mapReceptionist);
  },

  /**
   * Create a new receptionist profile.
   * POST /api/receptionists
   */
  createReceptionist: async (payload: ReceptionistPayload): Promise<Receptionist> => {
    // The backend CreateReceptionistRequestDTO requires a UserId and can optionally create a User profile.
    // We provide a random UUID for UserId and the User details for account creation.
    const raw = await apiClient<any>("/receptionists", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        location: payload.shift,
        userId: crypto.randomUUID(), 
        user: {
          phone: payload.phone,
          fullName: payload.name,
          password: "TempPassword123!", // Default password for new staff
          gender: 0 // Default to Male (0)
        }
      }),
    });
    return mapReceptionist(raw);
  },

  /**
   * Update an existing receptionist.
   * PUT /api/receptionists/{id}
   */
  updateReceptionist: async (id: string, payload: ReceptionistPayload): Promise<Receptionist> => {
    const raw = await apiClient<any>(`/receptionists/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        location: payload.shift,
      }),
    });
    return mapReceptionist(raw);
  },

  /**
   * Delete a receptionist profile.
   * DELETE /api/receptionists/{id}
   */
  deleteReceptionist: async (id: string): Promise<void> => {
    await apiClient<void>(`/receptionists/${id}`, {
      method: "DELETE",
    });
  }
};
