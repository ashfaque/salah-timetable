import { useState, useEffect } from "react";
import { getOfflineYearlyEvents, IslamicEvent, ISLAMIC_EVENTS } from "@/lib/islamic-events";
import { getMethodId } from "@/modules/prayer/utils";
import { Coordinates } from "adhan";

export function useIslamicEvents(date: Date, method: string, coords: Coordinates) {
  const year = date.getFullYear();

  // 1. Instantly initialize with the offline calculation as our robust fallback
  const [events, setEvents] = useState<IslamicEvent[]>(() => getOfflineYearlyEvents(date, method));
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCalendar = async () => {
      // Reset to the offline fallback instantly whenever the year or method changes
      if (isMounted) {
        setEvents(getOfflineYearlyEvents(date, method));
        setIsFetching(true);
      }

      try {
        const methodId = getMethodId(method);
        const gregorianOffset = method === "JamiaUloomIslamia" ? 1 : 0;

        // 2. Fetch the ENTIRE Gregorian year configured to the user's exact coordinates
        const url = `https://api.aladhan.com/v1/calendar/${year}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${methodId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        // The API returns an object where keys are months (1-12). We flatten it into a single array of 365 days.
        const flatCalendar = Object.values(data.data).flat() as any[];
        const apiEvents: IslamicEvent[] = [];

        // 3. Loop through the 365 days and pull out the ones matching our events
        flatCalendar.forEach((dayData) => {
          const hMonth = parseInt(dayData.date.hijri.month.number);
          const hDay = parseInt(dayData.date.hijri.day);
          const hYear = dayData.date.hijri.year;

          // Check if this specific Hijri day matches any of our predefined events
          const matchedEvent = ISLAMIC_EVENTS.find((e) => e.month === hMonth && e.day === hDay);

          if (matchedEvent) {
            const gDate = new Date(parseInt(dayData.date.gregorian.year), parseInt(dayData.date.gregorian.month.number) - 1, parseInt(dayData.date.gregorian.day));
            // Shift the Gregorian date manually based on user's calculation method
            gDate.setDate(gDate.getDate() + gregorianOffset);

            apiEvents.push({
              name: matchedEvent.name,
              month: matchedEvent.month,
              day: matchedEvent.day,
              gregorianDate: gDate,
              hijriString: `${hDay} ${dayData.date.hijri.month.en} ${hYear} AH`,
              isEstimated: false, // Verified by location-based API
            });
          }
        });

        // 4. If we found events, overwrite the fallback with the verified API data
        if (isMounted && apiEvents.length > 0) {
          setEvents(apiEvents.sort((a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime()));
        }
      } catch (e) {
        console.warn("Failed to fetch yearly calendar, gracefully using offline fallback.", e);
        // If it fails, we do nothing to the state! The user seamlessly sees the offline fallback.
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    if (coords) {
      fetchCalendar();
    }

    return () => {
      isMounted = false;
    };
  }, [year, method, coords]);

  return { events, isFetching };
}
