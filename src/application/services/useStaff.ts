import { useState, useEffect } from "react";
import { Staff } from "@/domain/entities/Staff";
import { MockStaffRepository } from "@/infrastructure/api/MockStaffRepository";

export function useStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      const data = await MockStaffRepository.getStaff();
      setStaffList(data);
      setLoading(false);
    };

    fetchStaff();
  }, []);

  return { staffList, loading };
}
