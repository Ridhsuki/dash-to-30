"use client";

import dynamic from "next/dynamic";

const DynamicPhaser = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a1a] text-white font-mono">
      BOOTING ENGINE...
    </div>
  ),
});

export default function GameWrapper({ aiConfig }: { aiConfig: any }) {
  return <DynamicPhaser aiConfig={aiConfig} />;
}
