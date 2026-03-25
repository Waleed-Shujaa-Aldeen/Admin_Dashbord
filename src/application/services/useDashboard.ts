import { useState, useEffect } from "react";
import { DashboardRepository, DashboardStats } from "@/infrastructure/api/DashboardRepository";
import { useToast } from "@/application/providers/ToastProvider";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DashboardRepository.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard statistics");
        showError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  return {
    stats,
    loading,
    error
  };
}
