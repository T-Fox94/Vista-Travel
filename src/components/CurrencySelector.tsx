"use client";

import React from "react";
import { useVistaStore } from "@/store/vista-store";

export default function CurrencySelector() {
  const currency = useVistaStore((s) => s.currency);
  const setCurrency = useVistaStore((s) => s.setCurrency);

  const options: { value: string; label: string }[] = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "ZMW", label: "ZMW" },
    { value: "ZAR", label: "ZAR" },
  ];

  return (
    <div className="hidden md:flex items-center">
      <label className="sr-only">Currency</label>
      <select
        aria-label="Select currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as any)}
        className="bg-white/5 text-white px-3 py-1 rounded-full text-sm border border-white/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-black">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
