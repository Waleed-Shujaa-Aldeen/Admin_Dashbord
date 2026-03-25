import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentRepository } from "@/infrastructure/api/AgentRepository";
import { AgentProfile } from "@/domain/entities/Agent";
import toast from "react-hot-toast";

export function useAgent() {
  const queryClient = useQueryClient();

  // Fetch Clinic Profile
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["agent", "me"],
    queryFn: () => AgentRepository.getMe(),
  });

  // Update Clinic Profile
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<AgentProfile> | FormData) =>
      AgentRepository.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", "me"] });
      toast.success("Clinic settings updated successfully");
    },
    // Error is handled globally by apiClient, but we can add specific logic here if needed
  });

  return {
    profile,
    isLoading,
    isError,
    error,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
