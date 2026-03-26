import { useState, useEffect, useCallback } from "react";
import { DashboardStatsResponse, RevenueTrend } from "@/domain/entities/DashboardMetrics";
import { DashboardRepository } from "@/infrastructure/api/DashboardRepository";
import { useToast } from "@/application/providers/ToastProvider";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { error: showError } = useToast();

  // Fetch dashboard KPI stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DashboardRepository.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard statistics");
        showError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showError]);

  // Fetch revenue trend (callable with different month ranges)
  const fetchRevenueTrend = useCallback(async (months: number = 6) => {
    try {
      setTrendLoading(true);
      const data = await DashboardRepository.getRevenueTrend(months);
      setRevenueTrend(data);
    } catch (err: any) {
      showError("Failed to load revenue trend.");
    } finally {
      setTrendLoading(false);
    }
  }, [showError]);

  // Auto-fetch default 6-month trend on mount
  useEffect(() => {
    fetchRevenueTrend(6);
  }, [fetchRevenueTrend]);

  return {
    stats,
    revenueTrend,
    loading,
    trendLoading,
    error,
    fetchRevenueTrend,
  };
}
