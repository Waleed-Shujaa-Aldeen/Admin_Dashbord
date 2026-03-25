import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScheduleProfile, ScheduleProfilePayload } from "@/domain/entities/ScheduleProfile";
import { ScheduleProfileRepository } from "@/infrastructure/api/ScheduleProfileRepository";
import { useToast } from "@/application/providers/ToastProvider";

const PROFILE_KEY = (doctorId: string | null) => ["schedule-profile", doctorId];

export function useScheduleProfile(doctorId: string | null) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const query = useQuery({
    queryKey: PROFILE_KEY(doctorId),
    queryFn: () => ScheduleProfileRepository.getProfile(doctorId!),
    enabled: !!doctorId,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ScheduleProfilePayload) => ScheduleProfileRepository.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_KEY(doctorId), data);
      success("Schedule profile saved successfully.");
    },
    onError: (err: any) => showError(err.message || "Failed to save schedule profile."),
  });

  return {
    profile: query.data || null,
    loading: query.isLoading,
    loadProfile: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY(doctorId) }),
    updateProfile: updateMutation.mutateAsync,
  };
}

export function useSlotGeneration() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const generateMutation = useMutation({
    mutationFn: ({ doctorId, start, end }: { doctorId: string; start?: string; end?: string }) => 
      ScheduleProfileRepository.generateSlots(doctorId, start, end),
    onSuccess: () => {
      // Invalidate slots to show the new ones immediately
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      success("Slots generated successfully! Your calendar is now live.");
    },
    onError: () => showError("Failed to auto-generate slots."),
  });

  return {
    generating: generateMutation.isPending,
    generateSlots: generateMutation.mutateAsync,
  };
}
