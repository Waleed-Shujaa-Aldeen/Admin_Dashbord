import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Patient, 
  PatientRegistrationPayload,
} from "@/domain/entities/Patient";
import { PatientRepository } from "@/infrastructure/api/PatientRepository";
import toast from "react-hot-toast";

// Utility for debouncing the search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function usePatients() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Fetch Patients with React Query
  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ["patients", debouncedSearchQuery],
    queryFn: async () => {
      const response = await PatientRepository.getPatients(debouncedSearchQuery);
      console.log("🚨 usePatients Hook - Raw response from Repository:", JSON.stringify(response, null, 2));
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error("🚨 usePatients Hook - ERROR: response.data is not an array:", JSON.stringify(response, null, 2));
      }
      
      return {
        patients: response.data || [],
        totalCount: response.totalCount || 0
      };
    },
  });

  const patients = data?.patients || [];
  const totalCount = data?.totalCount || 0;

  // --- Mutations ---

  const addMutation = useMutation({
    mutationFn: (payload: PatientRegistrationPayload) => PatientRepository.createPatient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient registered successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatientRegistrationPayload }) => 
      PatientRepository.updatePatient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient profile updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PatientRepository.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient record removed");
    }
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => 
      PatientRepository.updateClinicNotes(id, notes),
    onSuccess: () => toast.success("Notes saved securey")
  });

  const balanceMutation = useMutation({
    mutationFn: ({ id, balance }: { id: string; balance: number }) => 
      PatientRepository.updateBalance(id, balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Financial balance updated");
    }
  });

  return {
    patients,
    totalCount,
    loading,
    error: queryError ? (queryError as Error).message : null,
    searchQuery,
    setSearchQuery,
    addPatient: addMutation.mutateAsync,
    editPatient: (id: string, payload: PatientRegistrationPayload) => 
      updateMutation.mutateAsync({ id, payload }),
    removePatient: deleteMutation.mutateAsync,
    
    // Explicit fetchers for oversight components
    fetchHistory: PatientRepository.getPatientHistory,
    fetchClinicNotes: PatientRepository.getClinicNotes,
    saveClinicNotes: (id: string, notes: string) => 
      notesMutation.mutateAsync({ id, notes }),
    adjustBalance: (id: string, payload: { newBalance: number }) => 
      balanceMutation.mutateAsync({ id, balance: payload.newBalance })
  };
}

