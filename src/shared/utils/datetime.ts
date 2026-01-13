// src/shared/utils/datetime.ts
import moment from "moment-timezone";
import { env } from "@/core/config/env";

const TZ = env.APP_TIMEZONE || "Asia/Jakarta";

export const DateTime = {
  /**
   * Get current date/time in Asia/Jakarta timezone
   */
  now() {
    return moment().tz(TZ);
  },

  /**
   * Format date to Jakarta timezone with custom pattern
   * @example DateTime.format(Date(), "YYYY-MM-DD HH:mm:ss")
   */
  format(date: Date | string, format = "YYYY-MM-DD HH:mm:ss") {
    return moment(date).tz(TZ).format(format);
  },

  /**
   * Convert any date/time into Asia/Jakarta timezone
   */
  toJakarta(date: Date | string) {
    return moment(date).tz(TZ);
  },

  /**
   * Convert Jakarta time into UTC
   * Useful if database prefers storing UTC consistently
   */
  toUTC(date: Date | string) {
    return moment(date).tz(TZ).utc();
  },
};
