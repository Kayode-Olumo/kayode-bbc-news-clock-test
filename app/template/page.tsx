"use client";

import { useEffect } from "react";

type LeftTabFunction = (state: "on" | "off", text?: string) => void;

declare global {
  interface Window {
    leftTab: LeftTabFunction;
  }
}

const CasparTemplate = () => {
  useEffect(() => {
    window.leftTab = (state: "on" | "off", text?: string) => {
      console.log(`leftTab called with: ${state}, ${text}`);

      const lowerThirds = document.getElementById("lower-thirds");
      const newsText = document.getElementById("news-text");

      if (!lowerThirds || !newsText) return;

      if (state === "on") {
        if (text) {
          newsText.textContent = text;
        }

        lowerThirds.classList.add("visible");
      } else if (state === "off") {
        lowerThirds.classList.remove("visible");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "o") {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        window.leftTab("on", `BBC NEWS ${hours}:${minutes}`);
      } else if (event.key === "f") {
        window.leftTab("off");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    console.log("BBC News Lower Thirds template loaded");
    console.log('Press "o" to test showing the overlay, "f" to test hiding it');

    return () => {
      window.leftTab = undefined as unknown as LeftTabFunction;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-transparent overflow-hidden">
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-4 rounded shadow-md z-10">
        <h2 className="text-lg font-bold mb-2">Caspar CG Template</h2>
        <p className="mb-2">
          This is the HTML template that Caspar CG would load.
        </p>
        <p className="text-sm">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded">o</kbd> to show
          the overlay
        </p>
        <p className="text-sm">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded">f</kbd> to hide
          the overlay
        </p>
      </div>

      {/* Lower thirds */}
      <div
        id="lower-thirds"
        className="absolute bottom-0 left-0 w-full transform translate-y-full transition-transform duration-500 ease-in-out"
      >
        <div className="flex">
          <div
            id="news-text"
            className="bg-red-600 text-white py-3 px-6 font-bold text-2xl"
          >
            BBC NEWS 00:00
          </div>
          <div className="bg-white text-black py-3 px-6 font-bold text-2xl">
            BREAKING NEWS
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasparTemplate;
