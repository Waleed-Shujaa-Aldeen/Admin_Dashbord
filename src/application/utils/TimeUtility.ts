import { formatInTimeZone, toDate } from 'date-fns-tz';

export const SANA_TZ = "Asia/Aden"; // GMT+3

/**
 * Ensures all date operations result in Sana'a time.
 */
export const TimeUtility = {
  /** Returns current date object in Sana'a time */
  now: () => toDate(new Date(), { timeZone: SANA_TZ }),

  /** Formats a date specifically for backend (YYYY-MM-DD or HH:mm) */
  format: (date: Date | string | number, pattern: string) => {
    return formatInTimeZone(new Date(date), SANA_TZ, pattern);
  },

  /** Backend date string (YYYY-MM-DD) */
  toDateString: (date: Date | string) => formatInTimeZone(new Date(date), SANA_TZ, "yyyy-MM-dd"),

  /** Use this for comparisons to avoid browser-local jitter */
  isWithin24Hours: (date: string | Date) => {
    const target = new Date(date).getTime();
    const now = new Date().getTime(); // Browser clock is risky but standard reference
    return (target - now) < (24 * 60 * 60 * 1000);
  },

  /** "09:30 AM" -> "09:30:00" (TimeSpan format) */
  toTimeSpan: (timeStr: string) => {
    if (!timeStr) return "00:00:00";
    const [time, period] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  },

  /** "09:30:00" -> "09:30 AM" */
  fromTimeSpan: (timeSpan: string) => {
    if (!timeSpan) return "09:00 AM";
    // Handle cases like "09:30:00" or just "09:30"
    const parts = timeSpan.split(":");
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }
};
