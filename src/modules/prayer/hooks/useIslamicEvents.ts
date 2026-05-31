import { useState, useEffect } from "react";
import { getOfflineYearlyEvents, IslamicEvent } from "@/lib/islamic-events";
import { storage } from "@/lib/storage";

export function useIslamicEvents(date: Date, method: string) {
  const year = date.getFullYear();
  const [events, setEvents] = useState<IslamicEvent[]>(() => getOfflineYearlyEvents(date, method));
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStaggeredEvents = async () => {
      // Cache Key includes the month (m) so it automatically forces a re-fetch on the 1st of every month
      const currentMonth = new Date().getMonth();
      const cacheKey = `events_${year}_${method}_m${currentMonth}`;

      // 1. Check Cache
      const cached = storage.getItem<IslamicEvent[] | null>(cacheKey, null);
      if (cached) {
        const revived = cached.map((e) => ({ ...e, gregorianDate: new Date(e.gregorianDate) }));
        if (isMounted) setEvents(revived);
        return;
      }

      // 2. Fetch Staggered API
      setIsFetching(true);
      const offlineEvents = getOfflineYearlyEvents(date, method);
      const verifiedEvents: IslamicEvent[] = [];
      const autoOffset = method === "JamiaUloomIslamia" ? -1 : 0;

      for (const off of offlineEvents) {
        if (!isMounted) break;

        try {
          // Wait 500ms between API calls to prevent Rate Limiting (429 errors)
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Extract Hijri Year from string (e.g., "10 Dhu al-Hijjah 1447" -> "1447")
          const hyMatch = off.hijriString.match(/\d{4}$/);
          const hy = hyMatch ? hyMatch[0] : null;

          if (hy) {
            const pad = (n: number) => n.toString().padStart(2, "0");
            const apiDateStr = `${pad(off.day)}-${pad(off.month)}-${hy}`;

            // Reverse Lookup Endpoint (Hijri to Gregorian)
            const url = `https://api.aladhan.com/v1/hToG?date=${apiDateStr}&adjustment=${autoOffset}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("API failed");

            const data = await res.json();
            const g = data.data.gregorian;

            verifiedEvents.push({
              ...off,
              gregorianDate: new Date(parseInt(g.year), parseInt(g.month.number) - 1, parseInt(g.day)),
              isEstimated: false, // Mark as verified!
            });
          } else {
            verifiedEvents.push(off);
          }
        } catch (e) {
          // If a single call fails, fallback to offline math for that event
          verifiedEvents.push(off);
        }
      }

      if (isMounted) {
        // Clean up old cache keys to prevent localStorage bloat over time
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`events_${year}`) && key !== cacheKey) {
            localStorage.removeItem(key);
          }
        }

        const sorted = verifiedEvents.sort((a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime());
        setEvents(sorted);
        storage.setItem(cacheKey, sorted);
        setIsFetching(false);
      }
    };

    fetchStaggeredEvents();

    return () => {
      isMounted = false;
    };
  }, [year, method, date]);

  return { events, isFetching };
}
