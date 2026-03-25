import { apiClient } from "./ApiClient";
import { AgentProfile, AgentProfileSchema } from "@/domain/entities/Agent";

export const AgentRepository = {
  /**
   * Fetch the current clinic's profile details.
   * Maps to GET /api/agents/me
   */
  getMe: async (): Promise<AgentProfile> => {
    const defaultProfile: AgentProfile = {
      name: "",
      phone: "",
      address: "",
      state: "",
      specialization: "",
      logoUrl: ""
    };

    try {
      const data = await apiClient<any>("/agents/me");
      console.log("🚨 RAW AGENT PROFILE DATA:", data);

      if (!data) return defaultProfile;

      // Robustly handle cases where the backend might use different field names for the location
      const sanitizedData = { ...data };
      
      // Look for location strings in common places
      const findValue = (obj: any, keys: string[]): string | undefined => {
        for (const key of keys) {
          if (typeof obj[key] === "string" && obj[key].trim().length > 0) return obj[key];
          if (obj[key] && typeof obj[key] === "object") {
             const nested = findValue(obj[key], keys);
             if (nested) return nested;
          }
        }
        return undefined;
      };

      const locationKeys = ["state", "State", "city", "City", "location", "Location", "region", "Region", "addressCity", "addressState"];
      const foundLocation = findValue(sanitizedData, locationKeys);

      if (!sanitizedData.state && foundLocation) {
        sanitizedData.state = foundLocation;
      }

      const result = AgentProfileSchema.safeParse(sanitizedData);
      if (!result.success) {
        console.warn("⚠️ AGENT PROFILE SCHEMA VALIDATION FAILED. Using sanitized data or defaults.", result.error.format());
        return {
          ...defaultProfile,
          ...Object.fromEntries(Object.entries(sanitizedData).filter(([_, v]) => v != null))
        };
      }
      return result.data;
    } catch (error) {
      console.error("❌ FAILED TO FETCH AGENT PROFILE. Using default values.", error);
      // If it's a 404 or connection error, we return the default profile instead of throwing
      // to let the UI show empty fields for the user to fill.
      return defaultProfile;
    }
  },

  /**
   * Update the current clinic's profile details.
   * Maps to PUT /api/agents/me
   * Supports both JSON and FormData (for potential logo uploads)
   */
  updateMe: async (payload: Partial<AgentProfile> | FormData): Promise<void> => {
    const isFormData = payload instanceof FormData;

    await apiClient<void>("/agents/me", {
      method: "PUT",
      body: isFormData ? payload : JSON.stringify(payload),
      // If it's FormData, fetch will automatically set the correct boundary header
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  },
};
