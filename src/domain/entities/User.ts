export type UserRole = "Admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  agentId?: string; // If null/undefined, not tied to a specific agent
  lastLogin?: string;
  status: "Active" | "Inactive";
}

export interface UserPayload {
  name: string;
  role: UserRole;
  agentId?: string;
  status: "Active" | "Inactive";
  password?: string;
}
