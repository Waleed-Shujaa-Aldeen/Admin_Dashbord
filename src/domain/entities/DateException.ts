export type ExceptionReason = "Sick Leave" | "Vacation" | "Clinic Closure" | "Conference" | "Other";

export interface DateException {
  id: string;
  doctorId: string;
  date: string; // ISO date format YYYY-MM-DD
  reason: ExceptionReason;
  isUnavailable: boolean; // Day off
}

export interface AddExceptionPayload {
  date: string; // Single date
  reason: ExceptionReason;
  isUnavailable: boolean;
}
