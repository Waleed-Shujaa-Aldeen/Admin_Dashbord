import { useState, useEffect, useCallback } from "react";
import { User, UserPayload } from "@/domain/entities/User";
import { UserRepository } from "@/infrastructure/api/UserRepository";
import { useToast } from "@/application/providers/ToastProvider";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserRepository.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      showError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = async (payload: UserPayload) => {
    const optimisticUser: User = {
      id: `OPT-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      agentId: payload.agentId,
      status: payload.status,
      lastLogin: "Pending..."
    };

    setUsers(prev => [...prev, optimisticUser]);
    
    try {
      const actualUser = await UserRepository.createUser(payload);
      setUsers(prev => prev.map(u => u.id === optimisticUser.id ? actualUser : u));
      success("User successfully created!");
      return actualUser;
    } catch (err: any) {
      setUsers(prev => prev.filter(u => u.id !== optimisticUser.id));
      showError(err.message || "Failed to create user.");
      throw err;
    }
  };

  const editUser = async (id: string, payload: UserPayload) => {
    const userToRestore = users.find(u => u.id === id);
    if (!userToRestore) return;

    const optimisticUpdatedUser = { ...userToRestore, ...payload };
    setUsers(prev => prev.map(u => u.id === id ? optimisticUpdatedUser : u));

    try {
      const actualUser = await UserRepository.updateUser(id, payload);
      setUsers(prev => prev.map(u => u.id === id ? actualUser : u));
      success("User successfully updated!");
      return actualUser;
    } catch (err: any) {
      setUsers(prev => prev.map(u => u.id === id ? userToRestore : u));
      showError(err.message || "Failed to update user.");
      throw err;
    }
  };

  const removeUser = async (id: string) => {
    const userToRestore = users.find(u => u.id === id);
    if (!userToRestore) return;

    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      await UserRepository.deleteUser(id);
      success("User deleted successfully.");
    } catch (err: any) {
      setUsers(prev => [...prev, userToRestore]);
      showError(err.message || "Failed to delete user.");
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    refresh: loadUsers
  };
}
