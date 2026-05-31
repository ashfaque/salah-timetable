"use client";

import { useState, useEffect } from "react";
import { ArrowDownIcon, ChevronLeft, ChevronRight } from "@/components/ui/Icon";
import { formatDate, formatTime } from "@/lib/date-utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Countdown } from "@/components/ui/Countdown";
import { TIMEOUTS } from "@/lib/constants";

interface PrayerHeroProps {
  date: Date;
  setDate: (date: Date) => void;
  nextPrayer: { name: string; time: Date } | null;
  currentPrayer: { name: string; time: Date } | null;
  qibla: number;
  hijriData: { text: string; isEstimated: boolean };
}

export function PrayerHero({ date, setDate, nextPrayer, currentPrayer, qibla, hijriData }: PrayerHeroProps) {
  // 1. ALWAYS start in loading state when this component is born
  const [isLoading, setIsLoading] = useState(true);

  // 2. Automatically turn off loading after 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, TIMEOUTS.loadingDelay);
    return () => clearTimeout(timer);
  }, []);

  // Simple handlers
  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const scrollToTable = () => {
    document.getElementById("table-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Show Skeleton if we are in that 500ms window OR if data is missing
  // const isPastDate = (() => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const selected = new Date(date);
  //   selected.setHours(0, 0, 0, 0);
  //   return selected.getTime() < today.getTime();
  // })();
  // const showSkeleton = isLoading || !nextPrayer; //|| timeRemaining === "00:00:00";
  const { isPastDate, isFutureDate } = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return {
      isPastDate: selected.getTime() < today.getTime(),
      isFutureDate: selected.getTime() > today.getTime(),
    };
  })();
  const showSkeleton = isLoading || !nextPrayer;

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md text-center relative animate-in fade-in zoom-in-95 duration-300">
      {/* Date Navigation */}
      <div className="flex flex-col items-center gap-1">
        {/* {" "} */}
        {/* Stack vertically */}
        <div className="flex items-center gap-4 text-lg font-medium select-none">
          <button onClick={handlePrevDay} className="p-2 hover:bg-foreground/5 rounded-full active:scale-95 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="min-w-[140px]">{formatDate(date)}</span>

          <button onClick={handleNextDay} className="p-2 hover:bg-foreground/5 rounded-full active:scale-95 transition-transform">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Hijri Date Subtitle */}
        {/* 'text-foreground/60' makes it subtle. 'font-mono' gives it a clean data look. */}
        <span
          className={`text-sm font-mono -mt-1 tracking-wide flex items-center gap-2 transition-opacity duration-300
            ${hijriData.isEstimated ? "text-foreground/75 italic" : "text-foreground/80"}
          `}
          title={hijriData.isEstimated ? "Estimated (Approximation)" : "Verified by Authority"}
        >
          {/* Show tilde ~ if estimated */}
          {hijriData.isEstimated && <span>~</span>}
          {hijriData.text || "Loading Hijri Date..."}
        </span>

        {/* DISPLAY QIBLA */}
        <span className="text-xs text-foreground/60 font-mono tracking-wider uppercase mt-1">QIBLA: {Math.round(qibla)}° N</span>
      </div>

      {/* Countdown Display */}
      {!showSkeleton && nextPrayer ? (
        <div className="space-y-2">
          {isPastDate ? (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xl text-foreground/60 mb-2">Viewing Archive</p>
              <h1 className="text-4xl font-bold tracking-tight opacity-50">Past Date</h1>
            </div>
          ) : isFutureDate ? (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xl text-foreground/60 mb-2">Viewing Schedule</p>
              <h1 className="text-4xl font-bold tracking-tight opacity-50">Upcoming Date</h1>
            </div>
          ) : (
            <>
              <p className="text-xl text-foreground/70">{currentPrayer && currentPrayer.name !== "Sunrise" ? `${currentPrayer.name} ends in:` : "Next Prayer in:"}</p>
              <h1 className="text-6xl font-bold tracking-tight font-mono">
                <Countdown targetDate={nextPrayer.time} />
              </h1>
              <p className="text-xl">
                {nextPrayer.name} at {formatTime(nextPrayer.time)}
              </p>
            </>
          )}
        </div>
      ) : (
        // SKELETON LOADER
        <div className="space-y-4 w-full flex flex-col items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-64 rounded-xl" />
          <Skeleton className="h-6 w-48" />
        </div>
      )}

      <button onClick={scrollToTable} className="absolute -bottom-24 animate-bounce p-2 hover:bg-foreground/5 rounded-full cursor-pointer" aria-label="Scroll down">
        <ArrowDownIcon className="w-6 h-6 opacity-50" />
      </button>
    </div>
  );
}
