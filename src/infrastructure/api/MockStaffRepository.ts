import { Staff } from "@/domain/entities/Staff";

const mockStaff: Staff[] = [
  {
    id: "S-01",
    name: "Dr. Sarah Jenkins",
    role: "Chief of Cardiology",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPlbukZOn_TcyQojm6EJD_Mp7XTOEMC_46c3HPp92bDEQBbUZRhAmCdRNzy4ibNjKUYM6fcMxcw2FLuLSmNLD16-0BKpKkbHT0x9xLZJFyatpniJZzFDWqDMXHI5rMcGoG3EoBp2x3NRBJ4DxiOZExsIcvPhALZc8swMr7qeEVpgQev-9x51HdiKcoNBg8H2ZOEk3UTIcId-EezaSVcGraQiF9Vh8Kc6q0HqCdXYBiFq-24kkPcE7KU69FKkQZQuWya5Fb3jkKrkl",
    shiftHours: "08:00 - 17:00",
    status: "Active",
  },
  {
    id: "S-02",
    name: "Dr. Michael Chen",
    role: "Pediatrics",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA767meUqOQnqgE_O8WQQmQGk8Nl3mrvzEnJqbnuMEQk-vQSxbJo58tQZHuzImOWB6FRPKn9lM9tOcOde-15CNx2U-0K_1SQEEaEOfoKfGzBHoOyhY6pzc5etErSCUwz_Z6Ydm0qzpNDEIv2Xe5yyEH6lLS2eYNvIsLxzHJrAlQp10m8xcGZQFOH3wDiYQ6YNFoeKdTAS4GzvvhMrkBDgLcMIaoP7mZxnT3Aubyca2mRfPMw3grXbpQWq5p2fSf-jgo_MDC4_QsYOdT",
    shiftHours: "09:00 - 18:00",
    status: "On Break",
  },
];

export const MockStaffRepository = {
  getStaff: async (): Promise<Staff[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockStaff), 300));
  },
};
