"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PrayerHero } from "@/modules/prayer/components/PrayerHero";
import { PrayerTable } from "@/modules/prayer/components/PrayerTable";
import { usePrayerTimes } from "@/modules/prayer/hooks/usePrayerTimes";
import { useGeolocation } from "@/modules/prayer/hooks/useGeolocation";
import { useSettings } from "@/modules/prayer/hooks/useSettings";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { LocationBadge } from "@/components/ui/LocationBadge";
import { Toast } from "@/components/ui/Toast";
import { useOnlineStatus } from "@/modules/prayer/hooks/useOnlineStatus";
import { MakruhCard } from "@/modules/prayer/components/MakruhCard";
import { useHijriDate } from "@/modules/prayer/hooks/useHijriDate";

export default function Home() {
  // Initialize `date` to null to avoid server/client hydration mismatch
  const [date, setDate] = useState<Date | null>(null);
  // Separate `now` from `date` so countdowns and "next prayer" are calculated
  // relative to the real current time while `date` is the user-selected view date.
  const [now, setNow] = useState(new Date());
  // State to control if the Settings Modal is visible
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Track the current day to detect midnight changes
  const todayRef = useRef(new Date().getDate());

  useEffect(() => {
    // Tick every second (1000ms) to fix Stuck Table & Countdown
    const t = setInterval(() => {
      const current = new Date();
      setNow(current);

      // Midnight Transition
      // If the real-world day changes (e.g., 11th -> 12th), auto-update the view.
      if (current.getDate() !== todayRef.current) {
        todayRef.current = current.getDate();
        setDate(current); // Flip the calendar to the new "Today"
      }
    }, 1000);

    return () => clearInterval(t);
  }, []);

  // Set client-only initial date to avoid hydration mismatch with server
  useEffect(() => {
    setDate(new Date());
  }, []);

  // 1. GET LOCATION
  const { coords, source, requestLocation, loading, accuracy, error } = useGeolocation();

  // 2. PASS LOCATION TO PRAYER HOOK
  // const { prayers, nextPrayer, timeRemaining, currentPrayerId, currentPrayer } = usePrayerTimes(date || now, coords, now);

  // 2. GET SETTINGS (Pass coords so it can auto-detect method)
  // This hook manages the storage and logic for Hanafi vs Standard
  const { madhab, method, setMethod, toggleMadhab } = useSettings(coords);

  // 3. PASS LOCATION & SETTINGS TO PRAYER HOOK
  // Now passing 'madhab' and 'method' so times recalculate automatically
  const { prayers, nextPrayer, currentPrayerId, currentPrayer, qibla } = usePrayerTimes(
    date || now,
    coords,
    now,
    madhab, // <-- Dynamic Madhab
    method, // <-- Dynamic Method
  );

  // Extract Maghrib time for the flip logic
  const maghribTime = prayers?.find((p) => p.name === "Maghrib")?.time;
  const fajrTime = prayers?.find((p) => p.name === "Fajr")?.time;

  const hijriData = useHijriDate({
    date: date || now,
    coords,
    method,
    fajrTime,
    maghribTime,
    now,
  });

  if (!date) return null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-sans">
      <Header
        currentDate={date}
        onDateChange={setDate}
        locationSource={source} // Pass the status ('gps' | 'ip' | 'default')
        onRetryLocation={requestLocation} // Pass the retry function
        accuracy={accuracy}
        onOpenSettings={() => setIsSettingsOpen(true)} // Connect the button click to our state
      />

      {/* The Settings Screen */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} madhab={madhab} onMadhabChange={toggleMadhab} method={method} onMethodChange={setMethod} />

      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        {/* Added 'pt-16' and 'pb-16'. This subtracts the Header/Footer space 
            before calculating the 'justify-center', effectively placing the content
            in the 'Optical Center' (slightly higher than math center). */}
        {/* Added 'h-dvh' and 'snap-always' */}
        <section id="hero-section" className="h-dvh w-full snap-start snap-always flex flex-col items-center justify-center p-6 pt-16 pb-16 relative">
          <LocationBadge coords={coords} source={source} loading={loading} accuracy={accuracy} error={error} onRetry={requestLocation} />
          <Toast message={error} visible={!!error} />
          <Toast message="No internet connection. Using offline calculations." visible={!isOnline} duration={0} className="top-20 right-4" />
          {/* Show a small loading text if we are still finding the user */}
          {/* {locLoading && <div className="absolute top-20 bg-background/80 px-4 py-2 rounded-full text-xs animate-pulse border border-foreground/10">Detecting location...</div>} */}

          {/* Show error if they denied permission (optional UX improvement) */}
          {/* {locError && <div className="absolute top-20 bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-xs border border-red-500/20">Using default location (New Delhi)</div>} */}

          <PrayerHero date={date} setDate={setDate} nextPrayer={nextPrayer} currentPrayer={currentPrayer} qibla={qibla} hijriData={hijriData} />
        </section>

        <section id="table-section" className="h-dvh w-full snap-start snap-always flex flex-col items-center justify-center p-6 relative">
          <PrayerTable prayers={prayers} currentPrayerId={currentPrayerId} date={date} />
        </section>

        {/* MAKRUH (Snap Page) */}
        <section id="makruh-section-container" className="h-dvh w-full snap-start snap-always flex flex-col items-center justify-center p-6 relative">
          <MakruhCard prayers={prayers} coords={coords} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
