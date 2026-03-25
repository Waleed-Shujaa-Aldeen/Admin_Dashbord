import { ExceptionReason } from "./DateException";

export interface BreakInterval {
  startTime: string; // e.g., "01:00 PM"
  endTime: string;   // e.g., "02:00 PM"
  label: string;      // e.g., "Lunch Break"
}

export interface DaySchedule {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isWorking: boolean;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "05:00 PM"
  breakIntervals?: BreakInterval[];
}

export interface ScheduleProfile {
  doctorId: string;
  slotDurationMinutes: number; // default 15 min, multiple of 5
  timezoneId: string;          // force "Asia/Aden"
  weeklyAvailabilities: DaySchedule[];
}

export interface ScheduleProfilePayload {
  doctorId: string;
  slotDurationMinutes: number;
  timezoneId: string;
  weeklyAvailabilities: DaySchedule[];
}
