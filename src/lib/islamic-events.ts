import { toHijri, toGregorian } from "hijri-converter";
import { HIJRI_MONTHS } from "@/lib/date-utils";

export const ISLAMIC_EVENTS = [
  { name: "Islamic New Year", month: 1, day: 1 },
  { name: "Ashura", month: 1, day: 10 },
  { name: "12 Rabi ul-Awal", month: 3, day: 12 },
  { name: "Shab e-Barat", month: 8, day: 15 },
  { name: "Ramadan Begins", month: 9, day: 1 },
  { name: "Shab e-Qadr - 1", month: 9, day: 21 },
  { name: "Shab e-Qadr - 2", month: 9, day: 23 },
  { name: "Shab e-Qadr - 3", month: 9, day: 25 },
  { name: "Shab e-Qadr - 4", month: 9, day: 27 },
  { name: "Shab e-Qadr - 5", month: 9, day: 29 },
  { name: "Eid al-Fitr", month: 10, day: 1 },
  { name: "Day of Arafah", month: 12, day: 9 },
  { name: "Eid al-Adha", month: 12, day: 10 },
];

export type IslamicEvent = {
  name: string;
  month: number;
  day: number;
  gregorianDate: Date;
  hijriString: string;
  isEstimated: boolean;
};

export function getOfflineYearlyEvents(currentGregorianDate: Date, method: string): IslamicEvent[] {
  const year = currentGregorianDate.getFullYear();
  const startHijri = toHijri(year, 1, 1).hy;
  const endHijri = toHijri(year, 12, 31).hy;

  // South Asia (Jamia) is generally 1 day behind the standard Umm al-Qura calendar.
  // Therefore, the event happens 1 day LATER on the Gregorian calendar.
  const gregorianOffset = method === "JamiaUloomIslamia" ? 1 : 0;
  const eventsThisYear: IslamicEvent[] = [];

  for (let hy = startHijri; hy <= endHijri; hy++) {
    for (const event of ISLAMIC_EVENTS) {
      const greg = toGregorian(hy, event.month, event.day);

      // Apply regional offset directly
      const adjustedGregorian = new Date(greg.gy, greg.gm - 1, greg.gd);
      adjustedGregorian.setDate(adjustedGregorian.getDate() + gregorianOffset);

      if (adjustedGregorian.getFullYear() === year) {
        eventsThisYear.push({
          ...event,
          gregorianDate: adjustedGregorian,
          hijriString: `${event.day} ${HIJRI_MONTHS[event.month - 1]} ${hy}`,
          isEstimated: true, // Marked as estimate initially
        });
      }
    }
  }

  return eventsThisYear.sort((a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime());
}
