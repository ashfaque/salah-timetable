"use client";

import { useRef, useEffect } from "react";
import { useIslamicEvents } from "@/modules/prayer/hooks/useIslamicEvents";
import { formatDate } from "@/lib/date-utils";
import { CloseIcon } from "@/components/ui/Icon";

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  method: string;
}

export function EventsModal({ isOpen, onClose, currentDate, method }: EventsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const { events, isFetching } = useIslamicEvents(currentDate, method);
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextEventIndex = events.findIndex((e) => e.gregorianDate.getTime() >= today.getTime());

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div ref={modalRef} className="bg-background border border-foreground/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold">Islamic Events {currentYear}</h2>
            <p className="text-xs text-foreground/50 italic mt-1 h-4">{isFetching ? "Verifying dates with API..." : "* Dates verified with regional data."}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 -mt-2 hover:bg-foreground/5 rounded-full text-foreground/70 active:scale-95 transition-transform">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 mt-4 pr-2 space-y-3">
          {events.map((event, index) => {
            const isPast = event.gregorianDate.getTime() < today.getTime();
            const isUpcoming = index === nextEventIndex;

            return (
              <div
                key={event.name}
                className={`flex justify-between items-center p-4 rounded-xl transition-all ${isPast ? "opacity-40 grayscale" : "bg-foreground/5"} ${isUpcoming ? "border-l-4 border-l-blue-500 bg-blue-500/10" : "border border-foreground/5"}`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{event.name}</span>
                  <span className={`text-xs mt-0.5 ${event.isEstimated ? "text-foreground/50 italic" : "text-foreground/60"}`}>
                    {event.isEstimated && <span className="mr-1">~</span>}
                    {event.hijriString}
                  </span>
                </div>
                <span className="text-sm font-mono font-medium">{formatDate(event.gregorianDate).replace("Today, ", "")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
