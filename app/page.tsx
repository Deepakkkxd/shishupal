"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Battery,
  Cpu,
  Wifi,
  Lock,
  ShieldAlert,
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  Power,
  RotateCcw,
  Zap,
  Gauge
} from "lucide-react";

// --- CONFIGURATION ---
const CORRECT_PASSCODE = "1234"; // <-- Set your 4-digit PIN here

export default function ShishupalGroundStation() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [hasError, setHasError] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Controls & Telemetry State
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<string>("IDLE");
  const [throttle, setThrottle] = useState<number>(0);

  useEffect(() => {
    const authenticated = sessionStorage.getItem("shishupal_unlocked") === "true";
    setIsUnlocked(authenticated);
    setIsLoading(false);
  }, []);

  useEffect(() => {
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

  const sendCommand = (cmd: string) => {
    setLastCommand(cmd);
    console.log(`[GROUND STATION COMMAND]: ${cmd}`);
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

      {/* --- UNIFIED SINGLE PAGE DASHBOARD --- */}
      <main className={`p-8 transition-all duration-300 ${!isUnlocked ? "filter blur-md pointer-events-none select-none" : ""}`}>
        {/* --- TOP HUD --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              SHISHUPAL <span className="text-zinc-500">MK1A</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">MISSION CONTROL: INTEGRATED SENSORS & COMMAND MATRIX</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-1.5">
              <Wifi className="w-3.5 h-3.5 mr-2 animate-pulse" />
              UPLINK: ACTIVE
            </Badge>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 px-3 py-1.5">
              LATENCY: 12ms
            </Badge>
            <Button
              onClick={() => setIsArmed(!isArmed)}
              variant={isArmed ? "destructive" : "outline"}
              className="font-bold tracking-wider text-xs ml-2"
            >
              <Power className="w-3.5 h-3.5 mr-2" />
              {isArmed ? "DISARM" : "ARM COMMANDS"}
            </Button>
          </div>
        </div>

        {/* --- TOP BMS SENSOR QUICK STRIP --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-yellow-500">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                <Battery className="w-3.5 h-3.5 text-yellow-500" />
                MAIN BUS VOLTAGE
              </div>
              <div className="text-2xl font-bold text-zinc-100">14.8V</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-zinc-500 text-xs mb-1">CELL 1 VOLTAGE</div>
              <div className="text-2xl font-bold text-emerald-400">3.72V</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-zinc-500 text-xs mb-1">CELL 2 VOLTAGE</div>
              <div className="text-2xl font-bold text-emerald-400">3.70V</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-zinc-500 text-xs mb-1">CURRENT DRAW</div>
              <div className="text-2xl font-bold text-yellow-400">1.25A</div>
            </CardContent>
          </Card>
        </div>

        {/* --- MAIN SPLIT: SENSORS (LEFT) & CONTROLS (RIGHT) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* === LEFT COLUMN: LIVE TELEMETRY & DIAGNOSTICS (6 COLS) === */}
          <div className="lg:col-span-6 space-y-6">
            {/* Primary Altitude Telemetry */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-zinc-400 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> LIVE TELEMETRY & SENSOR STREAM
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] flex items-center justify-center border-t border-zinc-800/50">
                <div className="text-center">
                  <div className="text-6xl font-bold text-zinc-100 tracking-tight">0.00m</div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">Altitude (AGL) / BMP280</p>
                </div>
              </CardContent>
            </Card>

            {/* Gimbal Angle & Rover Hardware Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" /> GIMBAL ANGLE
                    </span>
                    <span className="text-blue-400 font-bold">0.0°</span>
                  </div>
                  <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-1/2"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" /> ROVER BUS
                    </span>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 text-[10px]">
                      READY
                    </Badge>
                  </div>
                  <p className="text-zinc-400 text-xs mt-3">Target: Arduino Uno + L298N</p>
                </CardContent>
              </Card>
            </div>

            {/* Live Command Log */}
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-500">ACTIVE COMMAND STATUS:</span>
              <span className="text-emerald-400 font-bold">{lastCommand}</span>
            </div>
          </div>

          {/* === RIGHT COLUMN: HARDWARE CONTROLS (6 COLS) === */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Rover D-Pad Control */}
              <Card className="bg-zinc-900 border-zinc-800 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-300 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-emerald-400" /> ROVER D-PAD
                    </span>
                    <Badge variant="outline" className="text-[10px] border-zinc-700">L298N</Badge>
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Directional motor drive signals
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4">
                  <div className="grid grid-cols-3 gap-2 w-44">
                    <div></div>
                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("ROVER_FORWARD")}
                      className="h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-zinc-100"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </Button>
                    <div></div>

                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("ROVER_LEFT")}
                      className="h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-zinc-100"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("ROVER_STOP")}
                      variant="destructive"
                      className="h-12 font-bold text-[11px]"
                    >
                      STOP
                    </Button>
                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("ROVER_RIGHT")}
                      className="h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-zinc-100"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>

                    <div></div>
                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("ROVER_BACKWARD")}
                      className="h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-zinc-100"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </Button>
                    <div></div>
                  </div>
                </CardContent>
              </Card>

              {/* Actuators & Ignition Test */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-300 text-sm flex items-center justify-between">
                    <span>GNC ACTUATORS</span>
                    <Badge variant="outline" className="text-[10px] border-zinc-700">OVERRIDES</Badge>
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Servo and ignition triggers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                      <span>THROTTLE</span>
                      <span className="text-zinc-300 font-bold">{throttle}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={!isArmed}
                      value={throttle}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setThrottle(val);
                        sendCommand(`SET_THROTTLE_${val}`);
                      }}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("GIMBAL_CENTER")}
                      variant="outline"
                      className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-xs gap-1.5 h-9"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      CENTER
                    </Button>
                    <Button
                      disabled={!isArmed}
                      onClick={() => sendCommand("GIMBAL_SWEEP_TEST")}
                      variant="outline"
                      className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-xs gap-1.5 h-9"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      SWEEP
                    </Button>
                  </div>

                  <Button
                    disabled={!isArmed}
                    onClick={() => sendCommand("TEST_PYRO_IGNITION")}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 gap-2 font-bold py-4 text-xs"
                  >
                    <Flame className="w-4 h-4" />
                    PYRO CONTINUITY TEST
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
