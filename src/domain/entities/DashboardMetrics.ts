// --- Kept for backward-compat with existing dashboard metric cards ---
export interface DashboardMetric {
  title: string;
  value: string;
  trend: string; // e.g., "+12%"
  icon: string; // Material Symbol name
  progressPercent: number; // 0 to 100
}

export interface AppointmentSummary {
  id: string;
  patientInitials: string;
  patientName: string;
  appointmentType: string;
  time: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

// --- New types matching GET /api/dashboard/stats ---
export interface DashboardStatsResponse {
  revenueThisMonth: number;
  revenueLastMonth: number;
  outstandingBalance: number;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  // The backend may include additional fields — they will be silently ignored
  [key: string]: any;
}

// --- Revenue trend data point from GET /api/dashboard/revenue-trend ---
export interface RevenueTrend {
  year: number;
  month: number;
  monthName: string;
  totalRevenue: number;
  appointmentCount: number;
  newPatientCount: number;
}
