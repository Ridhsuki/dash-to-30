"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import SettingsModal from "./SettingsModal";

export default function HomeSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open settings"
        className="h-9 w-9 rounded-xl border-2 border-[#8B5E3C] bg-[#FFF6E8] text-[#4A3A2A] flex items-center justify-center shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C] hover:bg-white transition-all cursor-pointer"
      >
        <Settings className="h-4 w-4" />
      </button>

      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
