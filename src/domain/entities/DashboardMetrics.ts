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
