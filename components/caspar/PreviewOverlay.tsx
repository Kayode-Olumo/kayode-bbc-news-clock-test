"use client";
import { useCasparClock } from "@/hooks/useCasparClock";

export default function PreviewOverlay() {
  const { isVisible, currentTime } = useCasparClock();
  const displayText = `BBC NEWS ${currentTime || "00:00"}`;

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div
        className={`flex transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-red-600 text-white py-2 px-4 font-bold text-sm">
          {displayText}
        </div>
        <div className="bg-white text-black py-2 px-4 font-bold text-sm">
          BREAKING NEWS
        </div>
      </div>
    </div>
  );
}
