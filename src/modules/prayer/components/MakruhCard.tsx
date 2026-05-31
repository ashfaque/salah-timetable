import { memo, useMemo } from "react";
import { Coordinates } from "adhan";
import { formatTime } from "@/lib/date-utils";
import { ArrowUpIcon } from "@/components/ui/Icon";
import { MAKRUH_BUFFER_MINUTES, ZAWAL_BUFFER_MINUTES } from "@/lib/constants";

interface MakruhCardProps {
  prayers: { name: string; time: Date }[] | null;
  coords: Coordinates;
}

// Wrapped in 'memo' to prevent re-rendering every second when the parent ticks
export const MakruhCard = memo(function MakruhCard({ prayers, coords }: MakruhCardProps) {
  // Memoize the calculation so it only runs when coords change, not every second
  const bufferMins = useMemo(() => {
    if (!coords) return 20; // HC: Fallback to 20 mins if coords missing

    const calculateMakruhBuffer = (lat: number) => {
      // 1. Convert Latitude to Radians (Math functions need Radians)
      const latRad = (Math.abs(lat) * Math.PI) / 180;

      // 2. Base Calculation:
      // Sun needs to rise ~3.5 degrees to be "Spear Length".
      // Earth rotates 1 degree every 4 minutes.
      // Base Time = 3.5 * 4 = 14 minutes.
      const baseDegrees = 3.5;
      const minsPerDegree = 4;
      const baseMinutes = baseDegrees * minsPerDegree;

      // 3. Adjust for Latitude (Sun moves slower at high lat)
      // Formula: Time / cos(latitude)
      // We limit cos() to 0.5 (60 degrees) to prevent extreme values in Norway/Alaska
      const cosLat = Math.max(0.5, Math.cos(latRad));
      const actualMinutes = baseMinutes / cosLat;

      // 4. Add Safety Buffer (User requested 5 mins)
      const safetyBuffer = MAKRUH_BUFFER_MINUTES;

      // Return total rounded minutes
      // console.log(`Makruh buffer at lat ${lat.toFixed(2)}°: ${Math.round(actualMinutes + safetyBuffer)} mins`);
      return Math.round(actualMinutes + safetyBuffer);
    };

    // Calculate the buffer for this user
    return calculateMakruhBuffer(coords.latitude);
  }, [coords?.latitude]); // Only re-calculate if latitude changes

  if (!prayers) return null;

  // Helper to add/subtract minutes
  const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
  // 1. Find the reference times from your existing schedule
  const sunrise = prayers.find((p) => p.name === "Sunrise")?.time;
  const dhuhr = prayers.find((p) => p.name === "Dhuhr" || p.name === "Jumu'a")?.time;
  const maghrib = prayers.find((p) => p.name === "Maghrib")?.time;

  if (!sunrise || !dhuhr || !maghrib) return null;

  // 2. Define the ranges
  const times = [
    {
      label: "Sunrise (Ishraq)",
      start: sunrise, // From Sunrise...
      end: addMinutes(sunrise, bufferMins),
      desc: "Wait until the sun has fully risen",
    },
    {
      label: "Zawal (Noon)",
      start: addMinutes(dhuhr, -ZAWAL_BUFFER_MINUTES),
      end: dhuhr, // ...until Dhuhr starts
      desc: "Sun at its absolute highest peak",
    },
    {
      label: "Sunset (Ghurub)",
      start: addMinutes(maghrib, -bufferMins),
      end: maghrib, // ...until Maghrib starts
      desc: "When the sun turns yellow before setting",
    },
  ];

  // Helper to go back up
  const scrollBackUp = () => {
    document.getElementById("table-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="makruh-section" className="flex flex-col items-center justify-center w-full max-w-md relative">
      {/* UP ARROW (To go back to Table) */}
      <button onClick={scrollBackUp} className="absolute -top-24 animate-bounce p-2 hover:bg-foreground/5 rounded-full">
        <ArrowUpIcon className="w-6 h-6 opacity-50" />
      </button>

      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-6 text-center">🚫 Approximate Forbidden (Makruh) Times</h3>

      <div className="w-full bg-orange-500/5 border border-orange-500/10 rounded-xl overflow-hidden divide-y divide-orange-500/10 shadow-sm">
        {times.map((item) => (
          <div key={item.label} className="flex flex-col p-4 hover:bg-orange-500/10 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm text-foreground/90">{item.label}</span>
              <span className="font-mono text-sm font-bold text-foreground/80">
                {formatTime(item.start)} – {formatTime(item.end)}
              </span>
            </div>
            <p className="text-[10px] text-foreground/50 italic">{item.desc}</p>
          </div>
        ))}
      </div>
      {/* Subtle Disclaimer */}
      <p className="text-xs text-foreground/40 italic mt-4 text-center max-w-xs leading-relaxed">* Times may vary by local mosque.</p>
    </div>
  );
});
