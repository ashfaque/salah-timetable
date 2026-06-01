import { useState, useEffect } from "react";
import { Coordinates } from "adhan";
import { formatInputDate, formatHijriDate as formatHijriFallback } from "@/lib/date-utils";
import { getMethodId } from "@/modules/prayer/utils";

// Global Cache (Persists between component re-renders)
const hijriCache = new Map<string, string>();

interface UseHijriDateProps {
  date: Date;
  coords: Coordinates;
  method: string;
  fajrTime?: Date;
  maghribTime?: Date;
  now?: Date;
}

export function useHijriDate({ date, coords, method, fajrTime, maghribTime, now }: UseHijriDateProps) {
  // Return object: Text to display + Status (for UI trust)
  const [state, setState] = useState({ text: "", isEstimated: true });
  // Calculate status on every render (tick)
  // We use the passed 'now' or fallback to new Date()
  const currentTime = now || new Date();
  // 1. Maghrib Flip Logic
  // Only flip if we are viewing "Today" AND it is after Maghrib
  const isToday = currentTime.toDateString() === date.toDateString();
  // Safety check for valid maghribTime
  const isAfterMaghrib = !!(isToday && maghribTime && currentTime >= maghribTime);

  // Calculate Phase dynamically (Night vs Day)
  let phase = "";
  if (isToday && fajrTime && maghribTime) {
    // It is Night if we are before Fajr OR after Maghrib
    const isNight = currentTime < fajrTime || currentTime >= maghribTime;
    phase = isNight ? "Night of" : "Day of";
  } else {
    // For past/future calendar dates, standard convention represents the daylight hours
    phase = "Day of";
  }

  useEffect(() => {
    if (!coords || typeof window === "undefined") return;

    // Flag to ignore stale responses
    let isActive = true;

    // const isToday = new Date().toDateString() === date.toDateString();
    // const isAfterMaghrib = isToday && maghribTime && !isNaN(maghribTime.getTime()) && new Date() > maghribTime;

    // Determine effective date (Tomorrow's Hijri date if after Maghrib)
    const effectiveDate = new Date(date);
    if (isAfterMaghrib) {
      effectiveDate.setDate(effectiveDate.getDate() + 1);
    }

    // 2. Prepare Keys & Fallback
    // If the method is South Asian (Karachi/Jamia), the math library is usually 1 day ahead.
    // We apply -1 to align the Fallback with local moon sighting.
    const isSouthAsia = method === "JamiaUloomIslamia";
    const autoOffset = isSouthAsia ? -1 : 0;

    // 3. Prepare Keys
    // Apply offset to fallback text
    const fallbackText = formatHijriFallback(effectiveDate, autoOffset);

    const dateKey = formatInputDate(effectiveDate);
    // Cache key includes method so switching settings updates the date
    const cacheKey = `${coords.latitude.toFixed(2)}|${coords.longitude.toFixed(2)}|${method}|${dateKey}`;

    // 4. Cache Hit
    if (hijriCache.has(cacheKey)) {
      setState({ text: hijriCache.get(cacheKey)!, isEstimated: false });
      return;
    }

    // 5. Initial Fallback
    setState({ text: fallbackText, isEstimated: true });

    // 6. Fetch API
    const fetchDate = async () => {
      try {
        const methodId = getMethodId(method);
        // API expects DD-MM-YYYY
        const apiDateStr = dateKey.split("-").reverse().join("-");

        // We pass the adjustment to the API too, just in case AlAdhan defaults to Saudi
        // adjustment=1 means +1, -1 means -1.
        // AlAdhan takes 'adjustment' query param.
        const url = `https://api.aladhan.com/v1/timings/${apiDateStr}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${methodId}&calendarMethod=MATHEMATICAL&adjustment=${autoOffset}`;
        // console.log("url-> ", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        const h = data.data.date.hijri;

        // Build trusted string
        const authoritativeString = `${h.month.en} ${h.day}, ${h.year} AH`;

        // Save to cache
        hijriCache.set(cacheKey, authoritativeString);

        // Update UI only if this effect is still active
        if (isActive) {
          setState({ text: authoritativeString, isEstimated: false });
        }
      } catch {
        // Silent failure: We stay on the estimated fallback.
        // User sees the "~" so they know it's not verified.
        console.warn("Hijri API failed, keeping estimate.");
      }
    };

    fetchDate();

    return () => {
      isActive = false;
    };
  }, [date, coords, method, isAfterMaghrib]);

  // return state;
  return { ...state, phase };
}
