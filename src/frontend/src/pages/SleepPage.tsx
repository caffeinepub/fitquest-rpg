import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  Flame,
  Moon,
  Plus,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";

// =====================
// Types
// =====================
interface SleepEntry {
  date: string; // YYYY-MM-DD
  hours: number;
  quality: number; // 1-5
  notes: string;
}

// =====================
// Storage helpers
// =====================
const SLEEP_KEY = "fitquest_sleep";

function loadSleepEntries(): SleepEntry[] {
  try {
    const raw = localStorage.getItem(SLEEP_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SleepEntry[];
  } catch {
    return [];
  }
}

function saveSleepEntries(entries: SleepEntry[]) {
  try {
    localStorage.setItem(SLEEP_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDateKey(d));
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getSleepScore(avgHours: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (avgHours < 5)
    return {
      label: "Poor",
      color: "text-red-400",
      bgColor: "bg-red-400/20 border-red-400/40",
    };
  if (avgHours < 6.5)
    return {
      label: "Fair",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20 border-yellow-400/40",
    };
  if (avgHours < 7.5)
    return {
      label: "Good",
      color: "text-blue-400",
      bgColor: "bg-blue-400/20 border-blue-400/40",
    };
  return {
    label: "Excellent",
    color: "text-green-400",
    bgColor: "bg-green-400/20 border-green-400/40",
  };
}

function getBarColor(hours: number): string {
  if (hours === 0) return "bg-muted/30";
  if (hours < 6) return "bg-red-400/80";
  if (hours < 7) return "bg-yellow-400/80";
  return "bg-blue-400/80";
}

function getSleepStreak(entries: SleepEntry[]): number {
  if (entries.length === 0) return 0;
  const entryMap = new Map(entries.map((e) => [e.date, e]));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    if (entryMap.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// =====================
// Hour options
// =====================
const HOUR_OPTIONS: { value: string; label: string }[] = [];
for (let h = 1; h <= 12; h += 0.5) {
  const val = h.toFixed(1);
  const hrs = Math.floor(h);
  const mins = h % 1 === 0.5 ? "30" : "00";
  HOUR_OPTIONS.push({ value: val, label: `${hrs}h ${mins}m` });
}

// =====================
// Sleep Tips
// =====================
const SLEEP_TIPS = [
  {
    emoji: "📱",
    title: "No screens 1 hour before bed",
    desc: "Blue light suppresses melatonin production. Try a book or light stretching instead.",
  },
  {
    emoji: "🌡️",
    title: "Keep your room cool",
    desc: "The ideal sleep temperature is 65–68°F (18–20°C). Your core body temp needs to drop to initiate sleep.",
  },
  {
    emoji: "⏰",
    title: "Stick to a sleep schedule",
    desc: "Going to bed and waking at the same time daily trains your circadian rhythm for deeper, restorative sleep.",
  },
];

// =====================
// Main Page
// =====================
export function SleepPage() {
  const { addXp } = useGame();
  const [entries, setEntries] = useState<SleepEntry[]>(loadSleepEntries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  // Form state
  const [selectedHours, setSelectedHours] = useState("7.5");
  const [selectedQuality, setSelectedQuality] = useState(0);
  const [notes, setNotes] = useState("");

  const last7Days = getLast7Days();
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const last7Entries = last7Days.map((d) => entryMap.get(d) ?? null);
  const filledEntries = last7Entries.filter(Boolean) as SleepEntry[];
  const avgHours =
    filledEntries.length > 0
      ? filledEntries.reduce((sum, e) => sum + e.hours, 0) /
        filledEntries.length
      : 0;

  const sleepScore = getSleepScore(avgHours);
  const streak = getSleepStreak(entries);

  const maxHours = Math.max(...last7Entries.map((e) => e?.hours ?? 0), 10);

  const handleSubmit = () => {
    if (!selectedHours || selectedQuality === 0) return;

    const today = formatDateKey(new Date());
    const newEntry: SleepEntry = {
      date: today,
      hours: Number.parseFloat(selectedHours),
      quality: selectedQuality,
      notes: notes.trim(),
    };

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      const updated = [newEntry, ...filtered];
      saveSleepEntries(updated);
      return updated;
    });

    const result = addXp(80);
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    toast.success("Sleep logged! +80 XP 🌙");

    // Reset form
    setSelectedHours("7.5");
    setSelectedQuality(0);
    setNotes("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <LevelUpModal
        open={levelUpOpen}
        level={levelUpLevel}
        onClose={() => setLevelUpOpen(false)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
            <Moon className="h-6 w-6 text-blue-400" />
            Sleep Tracker
          </h1>
          <p className="text-muted-foreground text-sm">
            Rest is a stat — optimize your recovery
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 font-bold bg-blue-500/20 border border-blue-400/40 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200"
              variant="outline"
              data-ocid="sleep.log.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-card border-border/60 max-w-sm"
            data-ocid="sleep.log.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-400" />
                Log Tonight's Sleep
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              {/* Hours */}
              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block">
                  Hours Slept
                </Label>
                <Select value={selectedHours} onValueChange={setSelectedHours}>
                  <SelectTrigger
                    className="bg-input/50 border-border/60"
                    data-ocid="sleep.hours.select"
                  >
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality stars */}
              <div>
                <Label className="text-sm text-foreground/80 mb-2 block">
                  Sleep Quality
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      data-ocid={`sleep.quality.toggle.${star}`}
                      onClick={() => setSelectedQuality(star)}
                      className={cn(
                        "h-9 w-9 rounded-lg border transition-all duration-150 flex items-center justify-center",
                        selectedQuality >= star
                          ? "border-blue-400/60 bg-blue-400/20 text-blue-300"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:border-blue-400/40 hover:bg-blue-400/10",
                      )}
                      aria-label={`${star} star quality`}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={selectedQuality >= star ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                  {selectedQuality > 0 && (
                    <span className="text-xs text-blue-300 font-medium ml-1">
                      {
                        ["", "Terrible", "Poor", "Average", "Good", "Perfect"][
                          selectedQuality
                        ]
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-sm text-foreground/80 mb-1.5 block">
                  Notes{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Textarea
                  placeholder="Anything that affected your sleep tonight?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-input/50 border-border/60 resize-none h-20 text-sm"
                  data-ocid="sleep.notes.textarea"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedHours || selectedQuality === 0}
                className="w-full font-bold bg-blue-500/20 border border-blue-400/40 text-blue-300 hover:bg-blue-500/30"
                variant="outline"
                data-ocid="sleep.log.submit_button"
              >
                <Zap className="h-4 w-4 mr-2" />
                Save Sleep Log (+80 XP)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {/* Sleep Score */}
        <Card className="border-border/60 bg-card/80 col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground font-medium">
                7-Day Score
              </span>
            </div>
            {avgHours > 0 ? (
              <div className="space-y-1">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-sm font-bold border",
                    sleepScore.bgColor,
                    sleepScore.color,
                  )}
                >
                  {sleepScore.label}
                </span>
                <p className="text-xs text-muted-foreground">
                  Avg {avgHours.toFixed(1)}h/night
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-muted-foreground font-medium">
                Sleep Streak
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-display">
                {streak}
              </span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </CardContent>
        </Card>

        {/* Total entries */}
        <Card className="border-border/60 bg-card/80 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground font-medium">
                Total Logs
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-display">
                {entries.length}
              </span>
              <span className="text-xs text-muted-foreground">sessions</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-blue-400" />
              Weekly Sleep Chart
              <Badge
                variant="outline"
                className="ml-auto text-xs border-blue-400/40 text-blue-300"
              >
                Last 7 days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filledEntries.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 space-y-3"
                data-ocid="sleep.history.empty_state"
              >
                <Moon className="h-10 w-10 text-blue-400/30" />
                <p className="text-muted-foreground text-sm text-center">
                  No sleep logged yet
                </p>
                <p className="text-xs text-muted-foreground/60 text-center">
                  Start tracking your sleep to see your weekly pattern
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Chart bars */}
                <div className="flex items-end justify-between gap-2 h-32 px-1">
                  {last7Days.map((dateStr, idx) => {
                    const entry = entryMap.get(dateStr);
                    const hours = entry?.hours ?? 0;
                    const heightPct =
                      maxHours > 0 ? (hours / maxHours) * 100 : 0;
                    return (
                      <div
                        key={dateStr}
                        className="flex flex-col items-center gap-1 flex-1"
                        data-ocid={`sleep.history.item.${idx + 1}`}
                      >
                        <span className="text-xs text-muted-foreground/70 font-mono">
                          {hours > 0 ? `${hours}h` : "—"}
                        </span>
                        <div className="w-full flex-1 flex items-end rounded-t-sm overflow-hidden bg-muted/20 relative">
                          {hours > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 }}
                              className={cn(
                                "w-full rounded-t-sm",
                                getBarColor(hours),
                              )}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day labels */}
                <div className="flex justify-between gap-2 px-1">
                  {last7Days.map((dateStr) => (
                    <div key={dateStr} className="flex-1 text-center">
                      <span className="text-xs text-muted-foreground">
                        {getDayLabel(dateStr)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 pt-1">
                  {[
                    { color: "bg-red-400/80", label: "<6h" },
                    { color: "bg-yellow-400/80", label: "6–7h" },
                    { color: "bg-blue-400/80", label: "7h+" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-sm flex-shrink-0",
                          item.color,
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sleep Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-400" />
              Sleep Hygiene Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SLEEP_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-400/5 p-3"
              >
                <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground/90">
                    {tip.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
