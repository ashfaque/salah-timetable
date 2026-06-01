import { toHijri } from "hijri-converter";

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

/**
 * Formats a Date object into a readable time string (e.g., "05:30 PM")
 */
export function formatTime(date: Date): string {
  // SAFETY CHECK: If date is null/undefined or not a valid Date object
  if (!date || isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Formats a Date object into a readable date string (e.g., "Today, 14 Aug")
 */
// export function formatDate(date: Date): string {
//   const today = new Date();
//   const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

//   const dayMonth = new Intl.DateTimeFormat("en-GB", {
//     day: "numeric",
//     month: "short",
//   }).format(date);

//   return isToday ? `Today, ${dayMonth}` : dayMonth;
// }
export function formatDate(date: Date): string {
  const now = new Date();

  // Check if the date is Today
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  // Create the base string: "4 Jan 2026"
  const dateString = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric", // ✅ Added Year
  }).format(date);

  // If it's today, prepend "Today, "
  if (isToday) {
    return `Today, ${dateString}`;
  }

  // Otherwise, include the weekday: "Sun, 4 Jan 2026"
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
  return `${weekday}, ${dateString}`;
}

/**
 * Calculates the difference between now and a target time in "HH:MM:SS" format
 */
export function getTimeRemaining(target: Date, now: Date = new Date()): string {
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return "00:00:00"; // Time passed

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Pad with zeros (e.g., "5" becomes "05")
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Returns the short timezone code (e.g., "IST", "EST", "GMT+5:30")
 */
export function getTimezoneShort(): string {
  try {
    // Attempt to get the short name (e.g., "PST", "IST")
    const short = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value;

    return short || "LOC"; // Fallback
  } catch {
    return "LOC";
  }
}

/**
 * Formats a Date object to "YYYY-MM-DD" (Required for HTML input type="date")
 */
export function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the Hijri date using the 'hijri-converter' library.
 * Reliable, standard, and works on all devices (Mobile/Desktop).
 */
export function formatHijriDate(date: Date, adjustment: number = 0): string {
  try {
    // Apply Adjustment
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + adjustment);

    // Get Gregorian components
    const year = adjustedDate.getFullYear();
    const month = adjustedDate.getMonth() + 1; // Library expects 1-12
    const day = adjustedDate.getDate();

    // Convert using the library
    const hijri = toHijri(year, month, day);

    // Format the result
    // hijri.hy = Hijri Year, hijri.hm = Hijri Month (1-12), hijri.hd = Hijri Day
    const monthName = HIJRI_MONTHS[hijri.hm - 1]; // Array is 0-indexed

    return `${monthName} ${hijri.hd}, ${hijri.hy} AH`;
  } catch {
    return ""; // Safe fallback
  }
}
