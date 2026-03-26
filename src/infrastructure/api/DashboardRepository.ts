import { DashboardStatsResponse, RevenueTrend } from "@/domain/entities/DashboardMetrics";
import { apiClient } from "@/infrastructure/api/ApiClient";

/**
 * DashboardRepository — Financial dashboard API calls.
 * Restricted to Admin role on the backend.
 */
export const DashboardRepository = {

  // GET /api/dashboard/stats
  getStats: async (): Promise<DashboardStatsResponse> => {
    const rawResponse = await apiClient<any>("/dashboard/stats");
    const raw = rawResponse?.data || rawResponse?.stats || rawResponse || {};
    
    console.log("Raw Dashboard Stats:", raw);

    return {
      revenueThisMonth: raw.revenueThisMonth ?? raw.RevenueThisMonth ?? 0,
      revenueLastMonth: raw.revenueLastMonth ?? raw.RevenueLastMonth ?? 0,
      outstandingBalance: raw.outstandingBalance ?? raw.OutstandingBalance ?? 0,
      totalAppointments: (raw.todayAppointments ?? raw.TodayAppointments ?? 0) + (raw.pendingAppointments ?? raw.PendingAppointments ?? 0) + (raw.confirmedAppointments ?? raw.ConfirmedAppointments ?? 0),
      totalPatients: raw.totalActivePatients ?? raw.TotalActivePatients ?? raw.totalPatients ?? raw.TotalPatients ?? 0,
      totalDoctors: raw.totalDoctors ?? raw.TotalDoctors ?? 0,
    };
  },

  // GET /api/dashboard/revenue-trend?months={N}
  getRevenueTrend: async (months: number = 6): Promise<RevenueTrend[]> => {
    const response = await apiClient<any>(`/dashboard/revenue-trend?months=${months}`);

    let rawList: any[] = [];
    if (Array.isArray(response)) rawList = response;
    else if (response?.data && Array.isArray(response.data)) rawList = response.data;
    else if (response?.items && Array.isArray(response.items)) rawList = response.items;

    return rawList.map((r: any) => ({
      year: r.year ?? r.Year ?? 0,
      month: r.month ?? r.Month ?? 0,
      monthName: r.monthName || r.MonthName || "",
      totalRevenue: r.totalRevenue ?? r.TotalRevenue ?? 0,
      appointmentCount: r.appointmentCount ?? r.AppointmentCount ?? 0,
      newPatientCount: r.newPatientCount ?? r.NewPatientCount ?? 0,
    }));
  },
};
