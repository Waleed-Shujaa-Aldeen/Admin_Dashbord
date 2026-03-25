import { z } from "zod";

export const DateExceptionSchema = z.object({
  id: z.string().optional(),
  date: z.string(), // ISO String
  reason: z.string().min(2, "Reason is required"),
});

export type DateException = z.infer<typeof DateExceptionSchema>;

export const DoctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
});

export type Doctor = z.infer<typeof DoctorSchema>;
