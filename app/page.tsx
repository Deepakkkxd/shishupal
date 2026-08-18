"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Battery, Cpu, Wifi, Lock, ShieldAlert } from "lucide-react";

// --- CONFIGURATION ---
const CORRECT_PASSCODE = "1234"; // <-- Set your 4-digit PIN here

export default function ShishupalGroundStation() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [hasError, setHasError] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if session is already authenticated
    const authenticated = sessionStorage.getItem("shishupal_unlocked") === "true";
    setIsUnlocked(authenticated);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Focus the first input upon mounting if locked
    if (!isUnlocked && !isLoading) {
      inputRefs.current[0]?.focus();
    }
  }, [isUnlocked, isLoading]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setHasError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 4) {
      if (fullCode === CORRECT_PASSCODE) {
        sessionStorage.setItem("shishupal_unlocked", "true");
        setIsUnlocked(true);
      } else {
        triggerError();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
      if (pasted === CORRECT_PASSCODE) {
        sessionStorage.setItem("shishupal_unlocked", "true");
        setIsUnlocked(true);
      } else {
        triggerError();
      }
    }
  };

  const triggerError = () => {
    setHasError(true);
    setTimeout(() => {
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }, 450);
  };

  if (isLoading) return null;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      {/* --- PASSCODE LOCK OVERLAY --- */}
      {!isUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
          <div
            className={`w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl transition-all ${
              hasError ? "animate-shake border-red-500/50" : ""
            }`}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
              <Lock className="h-6 w-6 text-zinc-300" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              GROUND CONTROL ACCESS
            </h2>
            <p className="mt-1 text-xs text-zinc-500 uppercase tracking-wider">
              Enter 4-Digit Authorization Code
            </p>

            {/* PIN Input Row */}
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
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="h-14 w-12 rounded-lg border border-zinc-700 bg-zinc-950 text-center text-2xl font-bold text-zinc-100 shadow-inner outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              ))}
            </div>

            {hasError && (
              <div className="mt-4 flex items-center justify-center gap-1 text-xs font-medium text-red-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ACCESS DENIED: INVALID PASSCODE</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DASHBOARD CONTENT --- */}
      <main className={`p-8 transition-all duration-300 ${!isUnlocked ? "filter blur-md pointer-events-none select-none" : ""}`}>
        {/* --- TOP HUD --- */}
        <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              SHISHUPAL <span className="text-zinc-500">MK1A</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">GROUND CONTROL DATA</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-4">
              <Wifi className="w-3 h-3 mr-2 animate-pulse" />
              UPLINK: ACTIVE
            </Badge>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
              LATENCY: 12ms
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="booster" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-8 p-1">
            <TabsTrigger value="booster" className="px-8 text-white">ROCKET GNC</TabsTrigger>
            <TabsTrigger value="rover" className="px-8 text-white">ROVER DIAGNOSTICS</TabsTrigger>
            <TabsTrigger value="bms" className="px-8 text-white">BMS / POWER</TabsTrigger>
          </TabsList>

          {/* --- ROCKET TAB --- */}
          <TabsContent value="booster" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Telemetry */}
              <Card className="bg-zinc-900 border-zinc-800 col-span-2">
                <CardHeader>
                  <CardTitle className="text-zinc-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> LIVE TELEMETRY
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center border-t border-zinc-800/50">
                  <div className="text-zinc-700 text-center">
                    <div className="text-5xl font-bold text-zinc-200">0.00m</div>
                    <p className="text-xs uppercase tracking-widest mt-2">Altitude (AGL)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-sm">GIMBAL ANGLE</span>
                      <span className="text-blue-400 font-bold">0.0°</span>
                    </div>
                    <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-yellow-500" />
                        <span className="text-zinc-500 text-sm">MAIN BUS</span>
                      </div>
                      <span className="text-xl font-bold">14.8V</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* --- ROVER TAB --- */}
          <TabsContent value="rover">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-20 text-center">
                <Cpu className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">Rover Mk 1A/B Control Interface Ready</p>
                <p className="text-zinc-700 text-xs mt-2">Target Hardware: Arduino Uno + L298N</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
