import { AuthService } from "@/infrastructure/api/AuthService";
import toast from "react-hot-toast";

const API_BASE_URL = "https://localhost:7004/api";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipToast?: boolean;
}

/**
 * Reusable API client that automatically injects the JWT Bearer token
 * and handles 401 Unauthorized responses globally.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    ...(customHeaders as Record<string, string>),
  };

  // Inject Bearer token if available and not explicitly skipped
  if (!skipAuth) {
    const token = AuthService.getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
    cache: "no-store", // Explicitly bypass browser/Next.js default fetch caching 
  });

  // Handle 401 globally: clear session and redirect to login
  if (response.status === 401) {
    AuthService.logout();
    toast.error("Session expired. Please login again.", { id: "auth_error" });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired.");
  }

  // Handle 403 Forbidden globally
  if (response.status === 403) {
    const errorMsg = `Permission Denied: [${endpoint}] Access restricted for current role.`;
    toast.error(errorMsg, { id: "auth_error" });
    throw new Error(errorMsg);
  }

  // Handle other HTTP errors
  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      
      // If it's an ASP.NET Core ValidationProblemDetails object
      if (errorBody.errors) {
        const detailLines = Object.entries(errorBody.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`);
        errorMessage = detailLines.join(" | ");
      } else {
        errorMessage = errorBody.message || errorBody.title || errorMessage;
      }
    } catch {
      // response body wasn't JSON, use default message
    }
    
    // Globally toast the error so individual components don't have to
    if (!options.skipToast) {
      toast.error(errorMessage);
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
