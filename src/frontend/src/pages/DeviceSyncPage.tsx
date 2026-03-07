import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  CheckCircle2,
  Heart,
  Info,
  Loader2,
  Moon,
  RefreshCw,
  Smartphone,
  Unlink,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Device definitions ─────────────────────────────────────────────────────
interface Device {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  simData: {
    steps?: number;
    calories?: number;
    heartRate?: number;
    sleep?: string;
  };
}

const DEVICES: Device[] = [
  {
    id: "google_fit",
    name: "Google Fit",
    emoji: "🏃",
    description: "Google's fitness platform for Android & Wear OS",
    color: "oklch(0.65 0.22 145)",
    simData: { steps: 8_420, calories: 642, heartRate: 72 },
  },
  {
    id: "apple_health",
    name: "Apple Health",
    emoji: "❤️",
    description: "Apple's health aggregation for iPhone & Apple Watch",
    color: "oklch(0.65 0.22 10)",
    simData: { steps: 7_830, calories: 580, heartRate: 68, sleep: "7h 14m" },
  },
  {
    id: "strava",
    name: "Strava",
    emoji: "🚴",
    description: "Social fitness tracking for running & cycling",
    color: "oklch(0.68 0.22 35)",
    simData: { steps: undefined, calories: 760, heartRate: 158 },
  },
  {
    id: "garmin",
    name: "Garmin",
    emoji: "⌚",
    description: "GPS sports watches and advanced training metrics",
    color: "oklch(0.62 0.18 220)",
    simData: { steps: 9_100, calories: 710, heartRate: 65, sleep: "7h 52m" },
  },
  {
    id: "fitbit",
    name: "Fitbit",
    emoji: "💪",
    description: "Wearables focused on health & sleep tracking",
    color: "oklch(0.72 0.18 200)",
    simData: { steps: 6_250, calories: 498, heartRate: 75, sleep: "6h 45m" },
  },
  {
    id: "apple_watch",
    name: "Apple Watch",
    emoji: "🍎",
    description: "Apple's wearable with ECG & workout tracking",
    color: "oklch(0.67 0.10 270)",
    simData: { steps: 9_870, calories: 820, heartRate: 71, sleep: "8h 02m" },
  },
];

// Initially connected: Google Fit and Strava
const INITIALLY_CONNECTED = new Set(["google_fit", "strava"]);

// ─── Device Card ────────────────────────────────────────────────────────────
function DeviceCard({
  device,
  index,
  connected,
  syncing,
  lastSync,
  onConnect,
  onDisconnect,
  onSync,
}: {
  device: Device;
  index: number;
  connected: boolean;
  syncing: boolean;
  lastSync: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}) {
  const ocidBase = `devicesync.item.${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      data-ocid={ocidBase}
    >
      <Card
        className="border-border/50 bg-card/80 overflow-hidden relative transition-all duration-200 hover:border-border/70"
        style={
          connected
            ? {
                boxShadow: `0 0 0 1px ${device.color}30, 0 4px 24px ${device.color}12`,
              }
            : undefined
        }
      >
        {/* Color accent top bar */}
        {connected && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ backgroundColor: device.color }}
          />
        )}

        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl flex-shrink-0"
                style={{ backgroundColor: `${device.color}20` }}
              >
                {device.emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">
                  {device.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug max-w-[180px]">
                  {device.description}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0">
              {connected ? (
                <Badge
                  className="text-xs gap-1 border-0 px-2"
                  style={{
                    backgroundColor: `${device.color}22`,
                    color: device.color,
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs gap-1 border-border/50 text-muted-foreground"
                >
                  <XCircle className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>

          {/* Connected data row */}
          {connected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div
                className="rounded-xl px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5"
                style={{ backgroundColor: `${device.color}10` }}
              >
                {device.simData.steps !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Steps:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: device.color }}
                    >
                      {device.simData.steps.toLocaleString()}
                    </span>
                  </div>
                )}
                {device.simData.calories !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">Cal:</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: device.color }}
                    >
                      {device.simData.calories}
                    </span>
                  </div>
                )}
                {device.simData.heartRate !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">BPM:</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: device.color }}
                    >
                      {device.simData.heartRate}
                    </span>
                  </div>
                )}
                {device.simData.sleep !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Moon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Sleep:
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: device.color }}
                    >
                      {device.simData.sleep}
                    </span>
                  </div>
                )}
              </div>

              {lastSync && (
                <p className="text-[10px] text-muted-foreground/60 mt-1.5 px-0.5">
                  Last synced: {lastSync}
                </p>
              )}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 text-xs font-medium border border-border/50 hover:border-border/70"
                  onClick={onSync}
                  disabled={syncing}
                  data-ocid={`devicesync.connect_button.${index}`}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Sync Now
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 border border-border/50"
                  onClick={onDisconnect}
                  data-ocid={`devicesync.delete_button.${index}`}
                >
                  <Unlink className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs font-bold"
                onClick={onConnect}
                style={{
                  backgroundColor: `${device.color}22`,
                  color: device.color,
                  borderColor: `${device.color}40`,
                }}
                variant="outline"
                data-ocid={`devicesync.connect_button.${index}`}
              >
                <Wifi className="h-3 w-3 mr-1.5" />
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export function DeviceSyncPage() {
  const [connected, setConnected] = useState<Set<string>>(
    () => new Set(INITIALLY_CONNECTED),
  );
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>(
    () => ({
      google_fit: "2 hours ago",
      strava: "5 hours ago",
    }),
  );

  const handleConnect = (deviceId: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      next.add(deviceId);
      return next;
    });
    setLastSyncTimes((prev) => ({ ...prev, [deviceId]: "Just now" }));
    const device = DEVICES.find((d) => d.id === deviceId);
    toast.success(`${device?.name ?? "Device"} connected successfully!`);
  };

  const handleDisconnect = (deviceId: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      next.delete(deviceId);
      return next;
    });
    const device = DEVICES.find((d) => d.id === deviceId);
    toast(`${device?.name ?? "Device"} disconnected`, { icon: "🔌" });
  };

  const handleSyncDevice = (deviceId: string) => {
    setSyncingDevice(deviceId);
    setTimeout(() => {
      setSyncingDevice(null);
      setLastSyncTimes((prev) => ({ ...prev, [deviceId]: "Just now" }));
      const device = DEVICES.find((d) => d.id === deviceId);
      toast.success(`${device?.name ?? "Device"} synced!`);
    }, 1500);
  };

  const handleSyncAll = () => {
    if (connected.size === 0) {
      toast("No devices connected", { icon: "ℹ️" });
      return;
    }
    setSyncingAll(true);
    setTimeout(() => {
      setSyncingAll(false);
      const newTimes: Record<string, string> = {};
      for (const id of connected) newTimes[id] = "Just now";
      setLastSyncTimes((prev) => ({ ...prev, ...newTimes }));
      toast.success(
        `All ${connected.size} device${connected.size !== 1 ? "s" : ""} synced!`,
      );
    }, 1500);
  };

  const connectedCount = connected.size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
            <Smartphone className="h-7 w-7 text-primary" />
            Device Sync
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {connectedCount > 0
              ? `${connectedCount} device${connectedCount !== 1 ? "s" : ""} connected — health data flows automatically`
              : "Connect your devices to sync health data into FitQuest"}
          </p>
        </div>

        <Button
          className="font-bold gap-2 h-10"
          onClick={handleSyncAll}
          disabled={syncingAll || connectedCount === 0}
          data-ocid="devicesync.sync_all_button"
        >
          {syncingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncingAll ? "Syncing..." : "Sync All Connected"}
        </Button>
      </motion.div>

      {/* Device grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DEVICES.map((device, i) => (
          <DeviceCard
            key={device.id}
            device={device}
            index={i + 1}
            connected={connected.has(device.id)}
            syncing={syncingDevice === device.id}
            lastSync={lastSyncTimes[device.id] ?? null}
            onConnect={() => handleConnect(device.id)}
            onDisconnect={() => handleDisconnect(device.id)}
            onSync={() => handleSyncDevice(device.id)}
          />
        ))}
      </div>

      {/* Data Permissions info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              Data Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              FitQuest requests read-only access to the following data types.
              Your data is never sold and stays on your device until you choose
              to share it.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  icon: Activity,
                  label: "Steps & Activity",
                  desc: "Daily step count, active minutes",
                },
                {
                  icon: Zap,
                  label: "Workouts",
                  desc: "Sessions, duration, distance",
                },
                {
                  icon: Heart,
                  label: "Heart Rate",
                  desc: "Resting & active BPM data",
                },
                {
                  icon: Moon,
                  label: "Sleep",
                  desc: "Duration, cycles, sleep score",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold text-foreground/80">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-border/30" />
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              All integrations are simulated in this demo. In production,
              connecting a device opens OAuth authentication with the respective
              platform. You can revoke access at any time by disconnecting.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
