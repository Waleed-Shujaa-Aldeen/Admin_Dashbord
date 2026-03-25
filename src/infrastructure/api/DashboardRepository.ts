import { DashboardMetric } from "@/domain/entities/DashboardMetrics";

export interface DashboardStats {
  metrics: DashboardMetric[];
  revenueTrend: {
    labels: string[]; // e.g., ["May 01", "May 07", "May 14", "May 21", "May 28"]
    data: number[];   // e.g., [12000, 14500, 13200, 16800, 18450]
  };
}

export const DashboardRepository = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          metrics: [
            {
              title: "Today's Appointments",
              value: "24",
              trend: "+12%",
              icon: "event_available",
              progressPercent: 75
            },
            {
              title: "Occupancy Rate",
              value: "88%",
              trend: "+5%",
              icon: "bed",
              progressPercent: 88
            },
            {
              title: "Total Revenue",
              value: "$12,450",
              trend: "+8.2%",
              icon: "monetization_on",
              progressPercent: 66
            }
          ],
          revenueTrend: {
            labels: ["May 01", "May 07", "May 14", "May 21", "May 28"],
            data: [11000, 13500, 12200, 14800, 17450]
          }
        });
      }, 400);
    });
  }
};
