import { z } from "zod";
import { format, parse } from "date-fns";

/**
 * Helper to convert "09:00 AM" to minutes-from-midnight for comparison
 */
const timeToMinutes = (timeStr: string) => {
  try {
    const parsed = parse(timeStr, "hh:mm a", new Date());
    return parsed.getHours() * 60 + parsed.getMinutes();
  } catch {
    return 0;
  }
};

export const BreakSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  label: z.string().min(1, "Break label is required"),
}).refine(data => timeToMinutes(data.startTime) < timeToMinutes(data.endTime), {
  message: "Break must end after it starts",
  path: ["endTime"]
});

export const DayScheduleSchema = z.object({
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  isWorking: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  breakIntervals: z.array(BreakSchema).optional(),
}).refine(data => {
  if (!data.isWorking) return true;
  return timeToMinutes(data.startTime) < timeToMinutes(data.endTime);
}, {
  message: "Working hours end time must be after start time",
  path: ["endTime"]
}).refine(data => {
  if (!data.isWorking || !data.breakIntervals) return true;
  const dayStart = timeToMinutes(data.startTime);
  const dayEnd = timeToMinutes(data.endTime);
  return data.breakIntervals.every(b => 
    timeToMinutes(b.startTime) >= dayStart && timeToMinutes(b.endTime) <= dayEnd
  );
}, {
  message: "Breaks must fall within working hours",
  path: ["breakIntervals"]
});

export const MasterScheduleSchema = z.object({
  doctorId: z.string(),
  slotDurationMinutes: z.number()
    .min(5, "Minimum slot duration is 5 minutes")
    .refine(val => val % 5 === 0, "Slot duration must be a multiple of 5"),
  timezoneId: z.string(),
  weeklyAvailabilities: z.array(DayScheduleSchema)
});

export type MasterScheduleFormData = z.infer<typeof MasterScheduleSchema>;
