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
    queryFn: async () => {
      try {
        return await ScheduleProfileRepository.getProfile(doctorId!);
      } catch (err: any) {
        // If it's a 404, return null instead of throwing to avoid "Error" state in UI
        if (err.message?.includes("404") || err.message?.includes("Not Found")) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!doctorId,
    retry: false, // Don't retry on 404 or other errors to avoid UI hang
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
      queryClient.invalidateQueries({ queryKey: ["live-slots"] });
      success("Slots generated successfully! Your calendar is now live.");
    },
    onError: () => showError("Failed to auto-generate slots."),
  });

  return {
    generating: generateMutation.isPending,
    generateSlots: generateMutation.mutateAsync,
  };
}
