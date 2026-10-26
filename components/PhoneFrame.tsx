"use client";

import { Wifi, BatteryFull, SignalHigh } from "lucide-react";

/**
 * Centers the app inside a phone-sized viewport so the prototype reads as a
 * mobile banking app on any screen. On small screens it fills the device.
 */
export default function PhoneFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-[#d9dadd] py-0 sm:py-6">
      <div className="relative flex h-screen w-full max-w-[430px] flex-col overflow-hidden bg-ocbc-bg shadow-float sm:h-[920px] sm:rounded-[2.4rem] sm:ring-[10px] sm:ring-black/90">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-white px-6 pt-3 pb-1 text-[13px] font-semibold text-ocbc-ink">
          <span>12:56</span>
          <div className="flex items-center gap-1.5">
            <SignalHigh size={15} strokeWidth={2.5} />
            <Wifi size={15} strokeWidth={2.5} />
            <BatteryFull size={18} strokeWidth={2} />
          </div>
        </div>

        {/* App content */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
