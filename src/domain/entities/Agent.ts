import { z } from "zod";

export const AgentProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{9}$/, "Phone must be exactly 9 numeric digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  specialization: z.string().optional(),
  logoUrl: z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
});

export type AgentProfile = z.infer<typeof AgentProfileSchema>;
