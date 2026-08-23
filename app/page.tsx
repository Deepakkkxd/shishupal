"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShishupalGCS() {
  const [boardIp, setBoardIp] = useState("10.215.223.214");
  const [activeCommand, setActiveCommand] = useState<string>("IDLE");
  const [linkStatus, setLinkStatus] = useState<"CONNECTED" | "STANDBY" | "ERROR">("STANDBY");
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const lastSentCmdRef = useRef<string>("stop");

  // Load saved IP from localStorage if available
  useEffect(() => {
    const savedIp = localStorage.getItem("shishupal_ip");
    if (savedIp) setBoardIp(savedIp);
  }, []);

  const handleIpChange = (newIp: string) => {
    setBoardIp(newIp);
    localStorage.setItem("shishupal_ip", newIp);
  };

  // Dispatch network request to ESP-01
  const sendDriveCommand = useCallback(
    async (cmd: "forward" | "backward" | "left" | "right" | "stop") => {
      if (!boardIp) return;
      if (lastSentCmdRef.current === cmd && cmd !== "stop") return;

      lastSentCmdRef.current = cmd;
      setActiveCommand(cmd.toUpperCase());

      try {
        await fetch(`http://${boardIp}/cmd/${cmd}`, {
          method: "GET",
          mode: "no-cors",
        });
        setLinkStatus("CONNECTED");
      } catch (err) {
        console.error("Transmission failed:", err);
        setLinkStatus("ERROR");
      }
    },
    [boardIp]
  );

  // Background Keep-Alive Ping every 8 seconds
  useEffect(() => {
    if (!boardIp) return;
    const interval = setInterval(async () => {
      try {
        await fetch(`http://${boardIp}/cmd/ping`, {
          method: "GET",
          mode: "no-cors",
        });
      } catch {
        // silent ping catch
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [boardIp]);

  // Keyboard navigation event listeners (WASD & Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        e.preventDefault();
      }

      setActiveKeys((prev) => ({ ...prev, [key]: true }));

      if (key === "w" || key === "arrowup") sendDriveCommand("forward");
      else if (key === "s" || key === "arrowdown") sendDriveCommand("backward");
      else if (key === "a" || key === "arrowleft") sendDriveCommand("left");
      else if (key === "d" || key === "arrowright") sendDriveCommand("right");
      else if (key === " ") sendDriveCommand("stop");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const key = e.key.toLowerCase();
      setActiveKeys((prev) => ({ ...prev, [key]: false }));

      if (["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        sendDriveCommand("stop");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sendDriveCommand]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header Panel */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-widest text-sky-400 uppercase">
            Shishupal GCS
          </h1>
          <p className="text-xs text-zinc-400 font-mono">Autonomous & Tele-Op Ground Link</p>
        </div>

        {/* Link Configuration Card */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Network Target Link
              </CardTitle>
              <Badge
                variant={
                  linkStatus === "CONNECTED"
                    ? "default"
                    : linkStatus === "ERROR"
                    ? "destructive"
                    : "secondary"
                }
                className={
                  linkStatus === "CONNECTED"
                    ? "bg-emerald-600 text-emerald-50 hover:bg-emerald-600"
                    : ""
                }
              >
                {linkStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-mono">ESP-01 IP ADDRESS</label>
              <input
                type="text"
                value={boardIp}
                onChange={(e) => handleIpChange(e.target.value)}
                placeholder="e.g. 192.168.43.120"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Motion Controller */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Kinematics (WASD)
              </CardTitle>
              <span className="text-xs font-mono font-bold text-sky-400">
                CMD: {activeCommand}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto py-2">
              <div />
              <Button
                variant="outline"
                className={`h-16 text-lg font-bold border-zinc-700 ${
                  activeKeys["w"] || activeKeys["arrowup"]
                    ? "bg-sky-500 text-zinc-950 hover:bg-sky-500"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                }`}
                onMouseDown={() => sendDriveCommand("forward")}
                onMouseUp={() => sendDriveCommand("stop")}
                onTouchStart={() => sendDriveCommand("forward")}
                onTouchEnd={() => sendDriveCommand("stop")}
              >
                ▲
              </Button>
              <div />

              <Button
                variant="outline"
                className={`h-16 text-lg font-bold border-zinc-700 ${
                  activeKeys["a"] || activeKeys["arrowleft"]
                    ? "bg-sky-500 text-zinc-950 hover:bg-sky-500"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                }`}
                onMouseDown={() => sendDriveCommand("left")}
                onMouseUp={() => sendDriveCommand("stop")}
                onTouchStart={() => sendDriveCommand("left")}
                onTouchEnd={() => sendDriveCommand("stop")}
              >
                ◀
              </Button>

              <Button
                variant="destructive"
                className="h-16 text-lg font-bold bg-rose-700 hover:bg-rose-600 text-zinc-100 shadow-md"
                onClick={() => sendDriveCommand("stop")}
              >
                ■
              </Button>

              <Button
                variant="outline"
                className={`h-16 text-lg font-bold border-zinc-700 ${
                  activeKeys["d"] || activeKeys["arrowright"]
                    ? "bg-sky-500 text-zinc-950 hover:bg-sky-500"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                }`}
                onMouseDown={() => sendDriveCommand("right")}
                onMouseUp={() => sendDriveCommand("stop")}
                onTouchStart={() => sendDriveCommand("right")}
                onTouchEnd={() => sendDriveCommand("stop")}
              >
                ▶
              </Button>

              <div />
              <Button
                variant="outline"
                className={`h-16 text-lg font-bold border-zinc-700 ${
                  activeKeys["s"] || activeKeys["arrowdown"]
                    ? "bg-sky-500 text-zinc-950 hover:bg-sky-500"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                }`}
                onMouseDown={() => sendDriveCommand("backward")}
                onMouseUp={() => sendDriveCommand("stop")}
                onTouchStart={() => sendDriveCommand("backward")}
                onTouchEnd={() => sendDriveCommand("stop")}
              >
                ▼
              </Button>
              <div />
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Status Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex justify-between items-center text-xs font-mono text-zinc-400">
          <span>TX PORT: 80 (HTTP)</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LINK ACTIVE</span>
          </div>
        </div>
      </div>
    </main>
  );
}
