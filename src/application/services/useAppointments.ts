import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Appointment, AppointmentPayload, AppointmentSlot } from "@/domain/entities/Appointment";
import { AppointmentRepository } from "@/infrastructure/api/AppointmentRepository";
import { useToast } from "@/application/providers/ToastProvider";

const APPOINTMENTS_KEY = ["appointments"];
const SLOTS_KEY = (doctorId: string, date: string) => ["slots", doctorId, date];

export function useAppointments() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const query = useQuery({
    queryKey: APPOINTMENTS_KEY,
    queryFn: () => AppointmentRepository.getAppointments(),
  });

  const bookMutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => AppointmentRepository.createAppointment(payload),
    onSuccess: (_, variables) => {
      // Invalidate appointments and the specific slot list to "heal" the UI
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      // We don't have the date here easily, so we invalidate all slots or specific if possible
      queryClient.invalidateQueries({ queryKey: ["slots"] }); 
      success("Appointment successfully booked!");
    },
    onError: (err: any) => showError(err.message || "Failed to book appointment"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => AppointmentRepository.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      success("Appointment cancelled successfully.");
    },
    onError: (err: any) => showError(err.message || "Failed to cancel appointment"),
  });

  return {
    appointments: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    bookAppointment: bookMutation.mutateAsync,
    cancelAppointment: cancelMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY })
  };
}

export function useAvailableSlots(doctorId: string, date: string) {
  const query = useQuery({
    queryKey: SLOTS_KEY(doctorId, date),
    queryFn: () => AppointmentRepository.getAvailableSlots(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 5000, // 5 seconds fresh
  });

  return {
    slots: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
}
