import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Doctor, DoctorPayload } from "@/domain/entities/Doctor";
import { DoctorRepository } from "@/infrastructure/api/DoctorRepository";
import { useToast } from "@/application/providers/ToastProvider";

const DOCTORS_KEY = ["doctors"];

export function useDoctors() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const query = useQuery({
    queryKey: DOCTORS_KEY,
    queryFn: () => DoctorRepository.getDoctors(),
    staleTime: 1000 * 60 * 5, // 5 minutes of cache stability
    retry: 1, // Minimize server stress on failure
  });

  const addMutation = useMutation({
    mutationFn: (payload: DoctorPayload) => DoctorRepository.createDoctor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_KEY });
      success("Doctor profile created.");
    },
    onError: () => showError("Failed to add doctor profile."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DoctorPayload }) => 
      DoctorRepository.updateDoctor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_KEY });
      success("Doctor profile updated.");
    },
    onError: () => showError("Failed to update doctor profile."),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => DoctorRepository.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_KEY });
      success("Doctor profile removed.");
    },
    onError: () => showError("Failed to delete doctor profile."),
  });

  return {
    doctors: query.data || [],
    loading: query.isLoading,
    error: query.isError ? "Failed to fetch doctors" : null,
    fetchDoctors: () => queryClient.invalidateQueries({ queryKey: DOCTORS_KEY }),
    addDoctor: addMutation.mutateAsync,
    editDoctor: (id: string, payload: DoctorPayload) => updateMutation.mutateAsync({ id, payload }),
    removeDoctor: removeMutation.mutateAsync
  };
}
