"use client"; // REQUIRED: Because we use interactivity

import { CalendarIcon, MenuIcon } from "@/components/ui/Icon";
import { formatInputDate } from "@/lib/date-utils"; // getTimezoneShort
import { useRef } from "react";
// import { useTheme } from "@/modules/prayer/hooks/useTheme";

// interface HeaderProps {
//   currentDate?: Date;
//   onDateChange?: (date: Date) => void;
// }

// export function Header({ currentDate, onDateChange }: HeaderProps) {

interface HeaderProps {
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  // NEW: We need these to control the status badge
  locationSource?: "default" | "ip" | "gps";
  onRetryLocation?: () => void;
  accuracy?: number | null;
  onOpenMenu?: () => void;
}

export function Header({ currentDate, onDateChange, locationSource, onRetryLocation, onOpenMenu }: HeaderProps) {
  // accuracy
  // const { theme, toggleTheme } = useTheme();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Function to open the hidden date picker
  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker(); // 'showPicker' is the modern native API
  };

  // Handle when user selects a date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && onDateChange) {
      // e.target.value is YYYY-MM-DD; construct a local date to avoid UTC shift
      const parts = e.target.value.split("-").map((p) => Number(p));
      if (parts.length === 3) {
        const [y, m, d] = parts;
        onDateChange(new Date(y, m - 1, d));
      } else {
        // fallback
        onDateChange(new Date(e.target.value));
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-foreground/10 h-16 transition-colors">
      {/* App Logo */}
      <div
        className="font-bold text-xl tracking-tighter cursor-pointer"
        onClick={() => onDateChange && onDateChange(new Date())} // Click logo to reset to Today
      >
        Salah<span className="opacity-50">Time</span>
      </div>

      {/* Centered Location Badge */}
      <div className="absolute left-1/2 -translate-x-1/2">
        {/* SMART LOCATION BADGE */}
        {locationSource === "gps" ? (
          // Case A: We have perfect GPS. Show Timezone calmly.
          <div className="px-3 py-1 border border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
            <span>📍 Using GPS</span> {/* {getTimezoneShort()} */}
          </div>
        ) : (
          // Case B: We are on IP or Default. Show "Enable GPS" button politely.
          <button
            onClick={onRetryLocation}
            className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-xs font-bold animate-pulse hover:bg-blue-500/20 transition-colors flex items-center gap-1"
            title="Click to enable precise location"
          >
            <span>📡</span> {locationSource === "ip" ? "Approx Loc" : "Enable GPS"}
          </button>
        )}
      </div>

      {/* Right Side Controls (Calendar + Settings) */}
      <div className="flex items-center gap-2">
        {/* Calendar Button (Moved here from center) */}
        <div className="relative">
          <button onClick={handleCalendarClick} className="p-2 hover:bg-foreground/5 rounded-full transition-colors active:scale-95 text-foreground/70" aria-label="Open Calendar">
            <CalendarIcon className="w-5 h-5" />
          </button>

          <input
            ref={dateInputRef}
            type="date"
            className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
            value={currentDate ? formatInputDate(currentDate) : ""}
            onChange={handleDateChange}
          />
        </div>

        {/* Settings Button (Moved here from center) */}
        <button onClick={onOpenMenu} className="p-2 hover:bg-foreground/5 rounded-full transition-colors active:scale-95 text-foreground/70" aria-label="Menu">
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Accuracy Indicator (small) */}
      {/* <div className="mr-3 text-[12px] text-foreground/60">{typeof accuracy === "number" && locationSource === "gps" ? `${Math.round(accuracy)}m` : null}</div> */}
      {/* <button
        onClick={toggleTheme}
        className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
          theme === "dark" ? "bg-foreground/20" : "bg-foreground/10"
        }`}
        aria-label="Toggle Dark Mode"
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-foreground rounded-full shadow-sm transition-all duration-300 ease-in-out flex items-center justify-center ${
            theme === "dark" ? "left-7" : "left-1"
          }`}
        >
          {theme === "dark" ? <span className="text-[8px]">🌙</span> : <span className="text-[8px]">☀️</span>}
        </div>
      </button> */}
    </header>
  );
}
