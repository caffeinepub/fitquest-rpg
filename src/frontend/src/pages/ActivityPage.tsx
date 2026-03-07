import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Clock, MapPin, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";
import { ACTIVITY_TYPES, calcActivityXp } from "../data/workouts";

const ACTIVITY_EMOJIS: Record<string, string> = {
  running: "🏃",
  gym_strength: "🏋️",
  yoga: "🧘",
  hiit: "🔥",
  cycling: "🚴",
  walking: "🚶",
  swimming: "🏊",
  sports: "⚽",
};

export function ActivityPage() {
  const { state, addXp, logActivity } = useGame();
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  const [form, setForm] = useState({
    type: "running",
    duration: "",
    distance: "",
    steps: "",
    notes: "",
  });

  const previewXp = form.duration
    ? calcActivityXp(
        form.type,
        Number.parseInt(form.duration) || 0,
        form.distance ? Number.parseInt(form.distance) : undefined,
      )
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.duration) return;

    const xp = previewXp;
    const activity = {
      type: form.type,
      date: new Date().toISOString().split("T")[0],
      duration: Number.parseInt(form.duration),
      xp,
      distance: form.distance ? Number.parseInt(form.distance) : undefined,
      steps: form.steps ? Number.parseInt(form.steps) : undefined,
      notes: form.notes || undefined,
    };

    logActivity(activity);
    const result = addXp(xp);

    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }

    toast.success(`Activity logged! +${xp} XP earned`);
    setForm({
      type: "running",
      duration: "",
      distance: "",
      steps: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-5">
      <LevelUpModal
        open={levelUpOpen}
        level={levelUpLevel}
        onClose={() => setLevelUpOpen(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-black text-white">
          Activity Log
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your fitness activities and earn XP
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Log form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/60 bg-card/80 card-glow-violet">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Log New Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm text-foreground/80">
                    Activity Type
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                  >
                    <SelectTrigger
                      className="mt-1.5 bg-input/50 border-border/60 focus:ring-primary"
                      data-ocid="activity.type.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.emoji} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-foreground/80">
                    Duration (minutes)
                  </Label>
                  <div className="relative mt-1.5">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="30"
                      min="1"
                      value={form.duration}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, duration: e.target.value }))
                      }
                      className="pl-9 bg-input/50 border-border/60"
                      data-ocid="activity.duration.input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-foreground/80">
                      Distance (m)
                    </Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="5000"
                        value={form.distance}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, distance: e.target.value }))
                        }
                        className="pl-9 bg-input/50 border-border/60"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground/80">Steps</Label>
                    <Input
                      type="number"
                      placeholder="8000"
                      value={form.steps}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, steps: e.target.value }))
                      }
                      className="mt-1.5 bg-input/50 border-border/60"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-foreground/80">
                    Notes (optional)
                  </Label>
                  <Textarea
                    placeholder="How did it feel?"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    className="mt-1.5 bg-input/50 border-border/60 resize-none h-20"
                  />
                </div>

                {/* XP preview */}
                {previewXp > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-4 py-3"
                  >
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-primary">
                        +{previewXp} XP
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estimated reward
                      </p>
                    </div>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={!form.duration}
                  className="w-full font-display font-bold h-11"
                  data-ocid="activity.log.submit_button"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Log Activity
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <Card className="border-border/60 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold">
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.recentActivities.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="activity.empty_state"
                >
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No activities yet. Log your first one!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.recentActivities.map((activity, i) => {
                    const typeInfo = ACTIVITY_TYPES.find(
                      (t) => t.value === activity.type,
                    );
                    return (
                      <div
                        key={`${activity.date}-${activity.type}-${i}`}
                        data-ocid={`activity.item.${i + 1}`}
                        className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 hover:border-border/70 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-xl flex-shrink-0">
                          {ACTIVITY_EMOJIS[activity.type] ?? "🏃"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {typeInfo?.label ?? activity.type.replace("_", " ")}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {activity.duration} min
                            </span>
                            {activity.distance && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {(activity.distance / 1000).toFixed(1)} km
                              </span>
                            )}
                            {activity.steps && (
                              <span className="text-xs text-muted-foreground">
                                👣 {activity.steps.toLocaleString()} steps
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-primary flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" />+{activity.xp}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(activity.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
