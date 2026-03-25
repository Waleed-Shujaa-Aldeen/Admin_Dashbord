import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateException, AddExceptionPayload } from "@/domain/entities/DateException";
import { DateExceptionRepository } from "@/infrastructure/api/DateExceptionRepository";
import { useToast } from "@/application/providers/ToastProvider";

const EXCEPTIONS_KEY = (doctorId: string) => ["exceptions", doctorId];

export function useDateExceptions() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const fetchExceptions = (doctorId: string) => {
    return queryClient.prefetchQuery({
      queryKey: EXCEPTIONS_KEY(doctorId),
      queryFn: () => DateExceptionRepository.getExceptions(doctorId),
    });
  };

  const useExceptionsList = (doctorId: string) => useQuery({
    queryKey: EXCEPTIONS_KEY(doctorId),
    queryFn: () => DateExceptionRepository.getExceptions(doctorId),
    enabled: !!doctorId,
  });

  const addRangeMutation = useMutation({
    mutationFn: ({ doctorId, startDate, endDate, reason }: { doctorId: string, startDate: string, endDate: string, reason: string }) => {
      // Internal range expansion logic
      const start = new Date(startDate);
      const end = new Date(endDate);
      const promises = [];
      
      let current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      const terminal = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

      while (current <= terminal) {
        const dateStr = current.toISOString().split('T')[0];
        promises.push(DateExceptionRepository.addException(doctorId, {
          date: dateStr,
          reason: reason as any,
          isUnavailable: true
        }));
        current.setUTCDate(current.getUTCDate() + 1);
      }
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEY(variables.doctorId) });
      queryClient.invalidateQueries({ queryKey: ["slots"] }); // Exceptions impact slots
      success("Exceptions added successfully!");
    },
    onError: (err: any) => showError(err.message || "Failed to add exceptions"),
  });

  const removeMutation = useMutation({
    mutationFn: ({ doctorId, exceptionId }: { doctorId: string, exceptionId: string }) => 
      DateExceptionRepository.deleteException(doctorId, exceptionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEY(variables.doctorId) });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      success("Exception removed.");
    },
    onError: (err: any) => showError(err.message || "Failed to remove exception"),
  });

  return {
    addExceptionRange: (doctorId: string, startDate: string, endDate: string, reason: string) => 
      addRangeMutation.mutateAsync({ doctorId, startDate, endDate, reason }),
    removeException: (doctorId: string, exceptionId: string) => 
      removeMutation.mutateAsync({ doctorId, exceptionId }),
    fetchExceptions,
    useExceptionsList
  };
}
