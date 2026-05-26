import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Battery, Rocket, Cpu, Wifi } from "lucide-react";

export default function ShishupalGroundStation() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-mono">
      {/* --- TOP HUD --- */}
      <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">SHISHUPAL <span className="text-zinc-500">MK1A</span></h1>
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
          <TabsTrigger value="rover" className="px-8  text-white">ROVER DIAGNOSTICS</TabsTrigger>
          <TabsTrigger value="bms" className="px-8  text-white">BMS / POWER</TabsTrigger>
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
    </div>
  );
}