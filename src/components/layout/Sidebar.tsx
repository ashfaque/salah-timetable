"use client";

import { CloseIcon, CalendarIcon, SettingsIcon } from "@/components/ui/Icon";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEvents: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ isOpen, onClose, onOpenEvents, onOpenSettings }: SidebarProps) {
  return (
    <div className={`fixed inset-0 z-[70] flex justify-end transition-all duration-300 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Dark Backdrop */}
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={onClose} />

      {/* Glass Panel */}
      <div
        className={`relative w-[70vw] max-w-sm h-full bg-background/90 backdrop-blur-xl border-l border-foreground/10 flex flex-col p-6 transition-transform duration-300 ease-out shadow-2xl ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold tracking-tight">Menu</h2>
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-foreground/5 rounded-full text-foreground/70 active:scale-95 transition-transform">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 text-lg font-medium">
          <button
            onClick={() => {
              onClose();
              onOpenEvents();
            }}
            className="flex items-center gap-4 text-left p-4 rounded-xl hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-foreground/70" />
            Islamic Events
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center gap-4 text-left p-4 rounded-xl hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
          >
            <SettingsIcon className="w-5 h-5 text-foreground/70" />
            Settings
          </button>
        </nav>
      </div>
    </div>
  );
}
