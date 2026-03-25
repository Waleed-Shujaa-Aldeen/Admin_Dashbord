import { User, UserPayload } from "@/domain/entities/User";

const initialMockUsers: User[] = [
  {
    id: "U-001",
    name: "System Administrator",
    email: "admin@med-link.com",
    role: "Admin",
    lastLogin: "2024-05-20T08:30:00Z",
    status: "Active"
  },
  {
    id: "U-002",
    name: "Clinic Manager",
    email: "manager@clinic.com",
    role: "Admin",
    agentId: "A-100",
    lastLogin: "2024-05-19T14:15:00Z",
    status: "Active"
  },
  {
    id: "U-003",
    name: "IT Support",
    email: "support@med-link.com",
    role: "Admin",
    lastLogin: "2024-05-10T09:00:00Z",
    status: "Inactive"
  }
];

let mockUsers = [...initialMockUsers];

export const UserRepository = {
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockUsers]), 500);
    });
  },

  createUser: async (payload: UserPayload): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          return reject(new Error("Failed to create user. Please try again."));
        }
        
        const newUser: User = {
          id: `U-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          agentId: payload.agentId,
          status: payload.status,
          lastLogin: "Never"
        };
        
        mockUsers.push(newUser);
        resolve(newUser);
      }, 600);
    });
  },

  updateUser: async (id: string, payload: UserPayload): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) return reject(new Error("User not found"));
        
        mockUsers[index] = { 
          ...mockUsers[index], 
          name: payload.name,
          email: payload.email,
          role: payload.role,
          agentId: payload.agentId,
          status: payload.status
        };
        resolve(mockUsers[index]);
      }, 500);
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockUsers.length;
        mockUsers = mockUsers.filter(u => u.id !== id);
        if (mockUsers.length === initialLength) {
          return reject(new Error("User not found or already deleted."));
        }
        resolve();
      }, 400);
    });
  }
};
