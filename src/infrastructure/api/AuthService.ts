/**
 * AuthService — handles JWT authentication against the ASP.NET Core backend.
 * Stores the token and user in localStorage for session persistence.
 */

// --- Interfaces ---

export interface AuthUser {
  id: string;
  name: string; // Map from fullName
  fullName: string; // From backend
  email: string;
  role: "Admin" | "Receptionist"; // Map from roles[0]
  roles: string[]; // From backend
  agentId?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// --- Storage Keys ---
const TOKEN_KEY = "medlink_token";
const USER_KEY = "medlink_user";
const STORAGE = typeof window !== "undefined" ? sessionStorage : null;

// --- Service ---

const API_BASE_URL = "https://localhost:7004/api";

export const AuthService = {
  /**
   * Authenticate against POST /api/auth/login
   * On success, stores the JWT and user in localStorage.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = "Login failed. Please check your credentials.";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.title || errorMessage;
      } catch {
        // response body wasn't JSON
      }
      throw new Error(errorMessage);
    }

    const data: LoginResponse = await response.json();

    // Map backend response components to frontend expected structure
    if (data.user) {
      // Correcting the object mapping before persistence
      data.user.name = data.user.fullName;
      if (data.user.roles && data.user.roles.length > 0) {
        // Use normalization helper for the extracted role
        const rawRole = data.user.roles[0].toLowerCase();
        if (rawRole === "admin" || rawRole === "superadmin") data.user.role = "Admin";
        else if (rawRole === "receptionist") data.user.role = "Receptionist";
        else data.user.role = "Receptionist"; // Default fallback
      }
    }

    // Persist to sessionStorage (clears when tab closes)
    STORAGE?.setItem(TOKEN_KEY, data.token);
    STORAGE?.setItem(USER_KEY, JSON.stringify(data.user));

    // Also set a cookie for Next.js middleware (no max-age = session cookie)
    document.cookie = `${TOKEN_KEY}=${data.token}; path=/; SameSite=Lax`;
    document.cookie = `medlink_role=${data.user.role}; path=/; SameSite=Lax`;

    return data;
  },

  /**
   * Clear all auth data from localStorage and cookies.
   */
  logout(): void {
    STORAGE?.removeItem(TOKEN_KEY);
    STORAGE?.removeItem(USER_KEY);
    // Clear cookies
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
    document.cookie = `medlink_role=; path=/; max-age=0`;
  },

  /**
   * Get the stored JWT token string, or null if not logged in.
   */
  getStoredToken(): string | null {
    return STORAGE?.getItem(TOKEN_KEY) || null;
  },

  /**
   * Get the stored user object, or null if not logged in.
   */
  getStoredUser(): AuthUser | null {
    const raw = STORAGE?.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as AuthUser;
      // Re-normalize in case of stale storage
      if (user.fullName) user.name = user.fullName;
        if (user.roles && user.roles.length > 0) {
          const rawRole = user.roles[0].toLowerCase();
          if (rawRole === "admin" || rawRole === "superadmin") user.role = "Admin";
          else if (rawRole === "receptionist") user.role = "Receptionist";
        }
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Check if a valid token exists in storage.
   */
  isLoggedIn(): boolean {
    return !!this.getStoredToken() && !!this.getStoredUser();
  },
};
