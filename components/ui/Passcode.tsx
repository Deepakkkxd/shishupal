"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lock } from "lucide-react";

interface PasscodeLockProps {
  passcode?: string;
  onSuccess?: () => void;
}

export default function PasscodeLock({
  passcode = "1234",
  onSuccess,
}: PasscodeLockProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input box automatically
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow numbers only

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // Take only the latest digit
    setDigits(newDigits);
    setError(false);

    // Auto-advance to the next box
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check code if all 4 digits are entered
    const fullPin = newDigits.join("");
    if (fullPin.length === 4) {
      if (fullPin === passcode) {
        sessionStorage.setItem("site_unlocked", "true");
        if (onSuccess) onSuccess();
      } else {
        triggerError();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pasted)) {
      const splitDigits = pasted.split("");
      setDigits(splitDigits);
      if (pasted === passcode) {
        sessionStorage.setItem("site_unlocked", "true");
        if (onSuccess) onSuccess();
      } else {
        triggerError();
      }
    }
  };

  const triggerError = () => {
    setError(true);
    setTimeout(() => {
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
      <div
        className={`w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl transition-all dark:bg-slate-900 ${
          error ? "animate-shake border-2 border-red-500" : ""
        }`}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Lock className="h-6 w-6 text-slate-700 dark:text-slate-200" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Enter Passcode
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter the 4-digit PIN to access this page
        </p>

        {/* 4 Input Boxes */}
        <div className="mt-6 flex justify-center gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="h-14 w-12 rounded-xl border border-slate-300 bg-slate-50 text-center text-2xl font-bold text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500"
            />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-xs font-semibold text-red-500">
            Incorrect PIN. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
