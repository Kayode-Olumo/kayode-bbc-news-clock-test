"use client";

import { useEffect, useState } from "react";

interface NewsOverlayProps {
  visible: boolean;
  text: string;
}

type LeftTabFunction = (state: "on" | "off", text?: string) => void;

// Extend Window interface
declare global {
  interface Window {
    leftTab: LeftTabFunction;
  }
}

export default function NewsOverlay({ visible, text }: NewsOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Expose the leftTab function to the window object for Caspar CG to call
    if (typeof window !== "undefined") {
      const leftTab: LeftTabFunction = (state, text) => {
        if (state === "on" && text) {
          setIsVisible(true);
          // You could update some state here to change the text
        } else if (state === "off") {
          setIsVisible(false);
        }
      };
      window.leftTab = leftTab;
    }

    return () => {
      // Clean up the global function when component unmounts
      if (typeof window !== "undefined") {
        window.leftTab = undefined as unknown as LeftTabFunction;
      }
    };
  }, []);

  // Use the prop to control visibility
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  return (
    <div
      className={`absolute bottom-0 left-0 w-full transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center">
        <div className="bg-red-600 text-white py-2 px-4 font-bold">
          {text || "BBC NEWS"}
        </div>
        <div className="bg-white text-black py-2 px-4 font-bold">
          BREAKING NEWS
        </div>
      </div>
    </div>
  );
}
