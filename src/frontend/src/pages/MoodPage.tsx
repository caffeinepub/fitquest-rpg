import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Heart, Wind, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";

// =====================
// Types
// =====================
interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  stress: number; // 1-5
  notes: string;
}

// =====================
// Storage helpers
// =====================
const MOOD_KEY = "fitquest_mood";

function loadMoodEntries(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(MOOD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MoodEntry[];
  } catch {
    return [];
  }
}

function saveMoodEntries(entries: MoodEntry[]) {
  try {
    localStorage.setItem(MOOD_KEY, JSON.stringify(entries));
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

function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// =====================
// Data
// =====================
const MOOD_OPTIONS = [
  { value: 1, emoji: "😫", label: "Terrible" },
  { value: 2, emoji: "😕", label: "Bad" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

const STRESS_OPTIONS = [
  {
    value: 1,
    label: "Low",
    color: "border-green-400/60 bg-green-400/20 text-green-300",
  },
  {
    value: 2,
    label: "Mild",
    color: "border-lime-400/60 bg-lime-400/20 text-lime-300",
  },
  {
    value: 3,
    label: "Moderate",
    color: "border-yellow-400/60 bg-yellow-400/20 text-yellow-300",
  },
  {
    value: 4,
    label: "High",
    color: "border-orange-400/60 bg-orange-400/20 text-orange-300",
  },
  {
    value: 5,
    label: "Extreme",
    color: "border-red-400/60 bg-red-400/20 text-red-300",
  },
];

const AFFIRMATIONS = [
  "Every rep, every step — you're becoming the hero of your own story.",
  "Rest is not retreat. Recovery is part of the quest.",
  "Progress isn't always visible, but it's always happening when you show up.",
  "Your body is your greatest ally. Treat it with the respect it deserves.",
  "Small consistent wins compound into extraordinary results. You're building something real.",
];

// =====================
// Breathing Exercises
// =====================
interface BreathingExercise {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  phases: { label: string; duration: number }[];
  cycles: number;
  xp: number;
}

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "478",
    name: "4-7-8 Breathing",
    emoji: "🌬️",
    desc: "Calms the nervous system and reduces anxiety",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 7 },
      { label: "Exhale", duration: 8 },
    ],
    cycles: 4,
    xp: 50,
  },
  {
    id: "box",
    name: "Box Breathing",
    emoji: "📦",
    desc: "Resets focus and lowers stress — used by Navy SEALs",
    phases: [
      { label: "Inhale", duration: 4 },
      { label: "Hold", duration: 4 },
      { label: "Exhale", duration: 4 },
      { label: "Hold", duration: 4 },
    ],
    cycles: 4,
    xp: 50,
  },
  {
    id: "deep",
    name: "Deep Breathing",
    emoji: "🫁",
    desc: "Simple, powerful relaxation for any moment",
    phases: [
      { label: "Inhale", duration: 5 },
      { label: "Exhale", duration: 5 },
    ],
    cycles: 6,
    xp: 50,
  },
];

// =====================
// Breathing Timer Component
// =====================
interface BreathingTimerProps {
  exercise: BreathingExercise;
  onStop: () => void;
  onComplete: () => void;
}

function BreathingTimer({ exercise, onStop, onComplete }: BreathingTimerProps) {
  const [cycleIdx, setCycleIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(exercise.phases[0].duration);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        setPhaseIdx((prevPhase) => {
          const nextPhase = prevPhase + 1;
          if (nextPhase < exercise.phases.length) {
            setCountdown(exercise.phases[nextPhase].duration);
            return nextPhase;
          }
          // End of cycle
          setCycleIdx((prevCycle) => {
            const nextCycle = prevCycle + 1;
            if (nextCycle < exercise.cycles) {
              setCountdown(exercise.phases[0].duration);
              setPhaseIdx(0);
              return nextCycle;
            }
            // Session complete
            setDone(true);
            if (!completedRef.current) {
              completedRef.current = true;
              setTimeout(() => onComplete(), 300);
            }
            return prevCycle;
          });
          return 0;
        });
        return 0;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [done, exercise, onComplete]);

  const currentPhase = exercise.phases[phaseIdx] ?? exercise.phases[0];
  const phaseDuration = currentPhase.duration;
  const progress = ((phaseDuration - countdown) / phaseDuration) * 100;

  const phaseColor =
    currentPhase.label === "Inhale"
      ? "text-green-400"
      : currentPhase.label === "Exhale"
        ? "text-blue-400"
        : "text-yellow-400";

  const ringColor =
    currentPhase.label === "Inhale"
      ? "stroke-green-400"
      : currentPhase.label === "Exhale"
        ? "stroke-blue-400"
        : "stroke-yellow-400";

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl"
        >
          ✅
        </motion.div>
        <p className="text-sm font-bold text-green-400">Session Complete!</p>
        <p className="text-xs text-muted-foreground">+50 XP earned</p>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {/* Animated ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width="100"
          height="100"
          className="-rotate-90"
          aria-label="Breathing timer progress"
        >
          <title>Breathing timer progress</title>
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={ringColor}
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset:
                circumference - (progress / 100) * circumference,
            }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span
            key={countdown}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("text-3xl font-black font-display", phaseColor)}
          >
            {countdown}
          </motion.span>
        </div>
      </div>

      <div className="text-center">
        <p className={cn("text-sm font-bold", phaseColor)}>
          {currentPhase.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cycle {cycleIdx + 1} of {exercise.cycles}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onStop}
        className="border-border/60 text-muted-foreground hover:text-foreground"
        data-ocid="mood.breathing.stop_button"
      >
        Stop
      </Button>
    </div>
  );
}

// =====================
// Main Page
// =====================
export function MoodPage() {
  const { addXp } = useGame();
  const [entries, setEntries] = useState<MoodEntry[]>(loadMoodEntries);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  // Form state
  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedStress, setSelectedStress] = useState(0);
  const [notes, setNotes] = useState("");

  // Breathing state
  const [activeBreathing, setActiveBreathing] = useState<string | null>(null);

  // Affirmation rotation
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [affirmationVisible, setAffirmationVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmationVisible(false);
      setTimeout(() => {
        setAffirmationIdx((i) => (i + 1) % AFFIRMATIONS.length);
        setAffirmationVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const last7Days = getLast7Days();
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const handleSubmit = () => {
    if (selectedMood === 0 || selectedStress === 0) return;

    const today = formatDateKey(new Date());
    const newEntry: MoodEntry = {
      date: today,
      mood: selectedMood,
      stress: selectedStress,
      notes: notes.trim(),
    };

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      const updated = [newEntry, ...filtered];
      saveMoodEntries(updated);
      return updated;
    });

    const result = addXp(100);
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    toast.success("Mood logged! +100 XP 💪");

    // Reset
    setSelectedMood(0);
    setSelectedStress(0);
    setNotes("");
  };

  const handleBreathingComplete = () => {
    const result = addXp(50);
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    toast.success("Breathing session complete! +50 XP 🧘");
    setTimeout(() => setActiveBreathing(null), 2000);
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
            <Heart className="h-6 w-6 text-pink-400" />
            Mood & Wellness
          </h1>
          <p className="text-muted-foreground text-sm">
            Your mental health is part of your stats
          </p>
        </div>
      </motion.div>

      {/* Affirmation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-pink-400/30 bg-pink-400/10 px-5 py-4 flex items-start gap-3"
      >
        <span className="text-xl flex-shrink-0 mt-0.5">✨</span>
        <AnimatePresence mode="wait">
          <motion.p
            key={affirmationIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: affirmationVisible ? 1 : 0, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-pink-200 font-medium italic"
          >
            "{AFFIRMATIONS[affirmationIdx]}"
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Log Mood Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-400" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Mood selector */}
            <div>
              <Label className="text-sm text-foreground/80 mb-3 block">
                Current Mood
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    data-ocid={`mood.mood.toggle.${opt.value}`}
                    onClick={() => setSelectedMood(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all duration-150",
                      selectedMood === opt.value
                        ? "border-pink-400/60 bg-pink-400/20"
                        : "border-border/60 bg-muted/20 hover:border-pink-400/40 hover:bg-pink-400/10",
                    )}
                    aria-label={opt.label}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-xs text-muted-foreground leading-none">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress level */}
            <div>
              <Label className="text-sm text-foreground/80 mb-3 block">
                Stress Level
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {STRESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    data-ocid={`mood.stress.toggle.${opt.value}`}
                    onClick={() => setSelectedStress(opt.value)}
                    className={cn(
                      "flex-1 min-w-0 rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-150 text-center",
                      selectedStress === opt.value
                        ? opt.color
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border/80",
                    )}
                    aria-label={`Stress: ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm text-foreground/80 mb-1.5 block">
                Notes{" "}
                <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                placeholder="What's on your mind today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-input/50 border-border/60"
                data-ocid="mood.notes.input"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={selectedMood === 0 || selectedStress === 0}
              className="w-full font-bold bg-pink-500/20 border border-pink-400/40 text-pink-300 hover:bg-pink-500/30"
              variant="outline"
              data-ocid="mood.log.submit_button"
            >
              <Zap className="h-4 w-4 mr-2" />
              Log Mood (+100 XP)
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* 7-Day History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-400" />
              7-Day Mood History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 space-y-3"
                data-ocid="mood.history.empty_state"
              >
                <span className="text-4xl">💭</span>
                <p className="text-muted-foreground text-sm">
                  No mood entries yet
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Start tracking to see your emotional pattern
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {last7Days.map((dateStr, idx) => {
                  const entry = entryMap.get(dateStr);
                  const moodOpt = MOOD_OPTIONS.find(
                    (m) => m.value === entry?.mood,
                  );
                  return (
                    <div
                      key={dateStr}
                      data-ocid={`mood.history.item.${idx + 1}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3 border",
                        entry
                          ? "border-border/60 bg-muted/20"
                          : "border-border/30 bg-muted/10",
                      )}
                    >
                      <span className="text-xl flex-shrink-0">
                        {moodOpt?.emoji ?? "—"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/80">
                          {moodOpt?.label ?? "No entry"}
                        </p>
                        {entry?.notes && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {formatDisplayDate(dateStr)}
                        </p>
                        {entry && (
                          <p className="text-xs text-pink-300/70 mt-0.5">
                            Stress:{" "}
                            {STRESS_OPTIONS[entry.stress - 1]?.label ?? "—"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Guided Breathing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-400" />
              Guided Breathing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {BREATHING_EXERCISES.map((ex, idx) => (
              <div
                key={ex.id}
                className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3">
                  <span className="text-2xl flex-shrink-0">{ex.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/90">
                      {ex.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{ex.desc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {activeBreathing === ex.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">
                          Active
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeBreathing !== null}
                        onClick={() => setActiveBreathing(ex.id)}
                        className="border-green-400/40 text-green-300 hover:bg-green-400/20 disabled:opacity-40"
                        data-ocid={`mood.breathing.start_button.${idx + 1}`}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {activeBreathing === ex.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border/40 bg-green-400/5 overflow-hidden"
                    >
                      <BreathingTimer
                        exercise={ex}
                        onStop={() => setActiveBreathing(null)}
                        onComplete={handleBreathingComplete}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <p className="text-xs text-muted-foreground/60 text-center pt-1">
              Complete a full session to earn +50 XP
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
