import { useState, useEffect, useCallback } from "react";
import { Receptionist, ReceptionistPayload } from "@/domain/entities/Receptionist";
import { ReceptionistRepository } from "@/infrastructure/api/ReceptionistRepository";
import { useToast } from "@/application/providers/ToastProvider";

export function useReceptionists() {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const loadReceptionists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReceptionistRepository.getReceptionists();
      setReceptionists(data);
    } catch (err: any) {
      setError(err.message || "Failed to load receptionists");
      showError("Failed to load receptionists.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadReceptionists();
  }, [loadReceptionists]);

  const addReceptionist = async (payload: ReceptionistPayload) => {
    const optimistic: Receptionist = {
      id: `OPT-${Date.now()}`,
      ...payload
    };
    setReceptionists(prev => [...prev, optimistic]);

    try {
      const actual = await ReceptionistRepository.createReceptionist(payload);
      setReceptionists(prev => prev.map(r => r.id === optimistic.id ? actual : r));
      success("Receptionist added.");
      return actual;
    } catch (err: any) {
      setReceptionists(prev => prev.filter(r => r.id !== optimistic.id));
      showError(err.message || "Failed to add receptionist.");
      throw err;
    }
  };

  const editReceptionist = async (id: string, payload: ReceptionistPayload) => {
    const toRestore = receptionists.find(r => r.id === id);
    if (!toRestore) return;

    setReceptionists(prev => prev.map(r => r.id === id ? { ...r, ...payload } : r));

    try {
      const actual = await ReceptionistRepository.updateReceptionist(id, payload);
      setReceptionists(prev => prev.map(r => r.id === id ? actual : r));
      success("Receptionist updated.");
      return actual;
    } catch (err: any) {
      setReceptionists(prev => prev.map(r => r.id === id ? toRestore : r));
      showError(err.message || "Failed to update receptionist.");
      throw err;
    }
  };

  const removeReceptionist = async (id: string) => {
    const toRestore = receptionists.find(r => r.id === id);
    if (!toRestore) return;

    setReceptionists(prev => prev.filter(r => r.id !== id));

    try {
      await ReceptionistRepository.deleteReceptionist(id);
      success("Receptionist removed.");
    } catch (err: any) {
      setReceptionists(prev => [...prev, toRestore]);
      showError(err.message || "Failed to remove receptionist.");
      throw err;
    }
  };

  return {
    receptionists,
    loading,
    error,
    addReceptionist,
    editReceptionist,
    removeReceptionist,
    refresh: loadReceptionists
  };
}
