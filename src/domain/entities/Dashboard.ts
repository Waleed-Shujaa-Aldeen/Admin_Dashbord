import { z } from "zod";

export const KpiStatsSchema = z.object({
  totalRevenue: z.number().default(0),
  totalAppointments: z.number().default(0),
  utilizationRate: z.number().default(0),
  activeDoctors: z.number().default(0),
});

export type KpiStats = z.infer<typeof KpiStatsSchema>;
