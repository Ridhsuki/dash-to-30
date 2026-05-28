"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function GlobalToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Toaster
      position="top-center"
      containerStyle={{
        zIndex: 999999,
        top: 18,
      }}
      toastOptions={{
        duration: 1700,
        style: {
          background: "#ffffff",
          color: "#4A3A2A",
          border: "1px solid rgba(139, 94, 60, 0.25)",
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "13px",
          fontWeight: 700,
          boxShadow: "0 10px 24px rgba(74, 58, 42, 0.16)",
        },
      }}
    />
  );
}
