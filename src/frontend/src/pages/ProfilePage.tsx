import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Dumbbell,
  Edit2,
  Loader2,
  Lock,
  Save,
  TrendingDown,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { type Profile, Type, Type__1 } from "../backend.d";
import { useGame } from "../context/GameContext";
import { ACHIEVEMENTS } from "../data/achievements";
import { AVATAR_OPTIONS, getAvatarEmoji } from "../data/avatars";
import { useActor } from "../hooks/useActor";

const RARITY_STYLES = {
  common: "text-gray-400 border-gray-400/30 bg-gray-400/10",
  rare: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  legendary: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
};

export function ProfilePage() {
  const { state, addBodyMetric } = useGame();
  const { actor, isFetching } = useActor();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");

  const { data: profile, refetch: refetchProfile } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const [form, setForm] = useState({
    displayName: "",
    age: "25",
    heightCm: "170",
    weightKg: "70",
    fitnessGoal: Type.general as Type,
    skillLevel: Type__1.beginner as Type__1,
    avatarChoice: 1,
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName,
        age: profile.age.toString(),
        heightCm: profile.heightCm.toString(),
        weightKg: profile.weightKg.toString(),
        fitnessGoal: profile.fitnessGoal,
        skillLevel: profile.skillLevel,
        avatarChoice: Number(profile.avatarChoice),
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!actor || !form.displayName.trim()) return;
    setSaving(true);
    try {
      const updatedProfile: Profile = {
        displayName: form.displayName.trim(),
        age: BigInt(Number.parseInt(form.age) || 25),
        heightCm: BigInt(Number.parseInt(form.heightCm) || 170),
        weightKg: BigInt(Number.parseInt(form.weightKg) || 70),
        fitnessGoal: form.fitnessGoal,
        skillLevel: form.skillLevel,
        avatarChoice: BigInt(form.avatarChoice),
      };
      await actor.saveCallerUserProfile(updatedProfile);
      await refetchProfile();
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMetric = () => {
    if (!newWeight) return;
    addBodyMetric({
      date: new Date().toISOString().split("T")[0],
      weight: Number.parseFloat(newWeight),
      bodyFat: Number.parseFloat(newBodyFat) || 0,
    });
    toast.success("Body metric logged!");
    setNewWeight("");
    setNewBodyFat("");
  };

  const avatarEmoji = getAvatarEmoji(
    form.avatarChoice || Number(profile?.avatarChoice) || 1,
  );
  const memberSince = "February 2026";
  const totalXpEarned = state.totalXp + state.level * 1000;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-black text-white">
            Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Your hero stats and achievements
          </p>
        </div>
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/60"
            onClick={() => setEditing(true)}
            data-ocid="profile.edit.button"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card + edit form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Profile card */}
          <Card className="border-border/60 bg-card/80 card-glow-violet">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">
                    {avatarEmoji}
                  </div>
                  <span className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black level-badge text-white">
                    {state.level}
                  </span>
                </div>
                <div>
                  <h2 className="font-display font-black text-lg text-white">
                    {profile?.displayName ?? "Adventurer"}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/40 text-primary mt-1"
                  >
                    Level {state.level} Hero
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {memberSince}
                  </p>
                </div>
              </div>

              <Separator className="my-4 bg-border/50" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Dumbbell,
                    label: "Workouts",
                    value: state.completedWorkouts,
                    color: "text-orange-400",
                  },
                  {
                    icon: Zap,
                    label: "Total XP",
                    value: totalXpEarned.toLocaleString(),
                    color: "text-primary",
                  },
                  {
                    icon: Trophy,
                    label: "Coins Earned",
                    value: state.coins,
                    color: "text-yellow-400",
                  },
                  {
                    icon: CheckCircle,
                    label: "Achievements",
                    value: state.achievements.length,
                    color: "text-green-400",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-muted/25 border border-border/40 p-3"
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
                    <p className="font-bold text-foreground text-sm">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/30 bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-sm font-bold flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-primary" />
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-foreground/70">
                      Hero Name
                    </Label>
                    <Input
                      value={form.displayName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, displayName: e.target.value }))
                      }
                      className="mt-1 h-9 text-sm bg-input/50 border-border/60"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-foreground/70">Age</Label>
                      <Input
                        type="number"
                        value={form.age}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, age: e.target.value }))
                        }
                        className="mt-1 h-9 text-sm bg-input/50 border-border/60"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-foreground/70">
                        Ht (cm)
                      </Label>
                      <Input
                        type="number"
                        value={form.heightCm}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, heightCm: e.target.value }))
                        }
                        className="mt-1 h-9 text-sm bg-input/50 border-border/60"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-foreground/70">
                        Wt (kg)
                      </Label>
                      <Input
                        type="number"
                        value={form.weightKg}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, weightKg: e.target.value }))
                        }
                        className="mt-1 h-9 text-sm bg-input/50 border-border/60"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-foreground/70">
                      Fitness Goal
                    </Label>
                    <Select
                      value={form.fitnessGoal}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, fitnessGoal: v as Type }))
                      }
                    >
                      <SelectTrigger className="mt-1 h-9 text-sm bg-input/50 border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Type.loseWeight}>
                          Lose Weight
                        </SelectItem>
                        <SelectItem value={Type.gainMuscle}>
                          Gain Muscle
                        </SelectItem>
                        <SelectItem value={Type.endurance}>
                          Endurance
                        </SelectItem>
                        <SelectItem value={Type.general}>General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-foreground/70">
                      Skill Level
                    </Label>
                    <Select
                      value={form.skillLevel}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, skillLevel: v as Type__1 }))
                      }
                    >
                      <SelectTrigger className="mt-1 h-9 text-sm bg-input/50 border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Type__1.beginner}>
                          Beginner
                        </SelectItem>
                        <SelectItem value={Type__1.intermediate}>
                          Intermediate
                        </SelectItem>
                        <SelectItem value={Type__1.advanced}>
                          Advanced
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Avatar selection */}
                  <div>
                    <Label className="text-xs text-foreground/70">Avatar</Label>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          type="button"
                          key={av.id}
                          onClick={() =>
                            setForm((p) => ({ ...p, avatarChoice: av.id }))
                          }
                          className={cn(
                            "flex items-center justify-center rounded-lg p-2 text-xl border transition-all",
                            form.avatarChoice === av.id
                              ? "border-primary bg-primary/15"
                              : "border-border/40 bg-muted/20 hover:border-border",
                          )}
                          title={av.name}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border/60"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 font-bold"
                      onClick={handleSave}
                      disabled={saving}
                      data-ocid="profile.save.submit_button"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Body Metrics chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-400" />
                  Body Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add metric */}
                <div className="flex gap-2 mb-5">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="h-9 text-sm bg-input/50 border-border/60"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Body fat %"
                      value={newBodyFat}
                      onChange={(e) => setNewBodyFat(e.target.value)}
                      className="h-9 text-sm bg-input/50 border-border/60"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddMetric}
                    disabled={!newWeight}
                    className="h-9 font-bold"
                  >
                    Log
                  </Button>
                </div>

                {/* Chart */}
                {state.bodyMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={state.bodyMetrics}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.26 0.022 270)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "oklch(0.55 0.025 270)" }}
                        tickFormatter={(d) =>
                          new Date(d).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "oklch(0.55 0.025 270)" }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.16 0.022 270)",
                          border: "1px solid oklch(0.26 0.022 270)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="oklch(0.67 0.22 295)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.67 0.22 295)", r: 4 }}
                        name="Weight (kg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="oklch(0.72 0.18 145)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.72 0.18 145)", r: 4 }}
                        name="Body Fat %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    Log your first measurement to see progress
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  Achievements
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/40 text-primary ml-auto"
                  >
                    {state.achievements.length}/{ACHIEVEMENTS.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {ACHIEVEMENTS.map((achievement, idx) => {
                    const earned = state.achievements.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        data-ocid={`profile.achievement.item.${idx + 1}`}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                          earned
                            ? cn("border", RARITY_STYLES[achievement.rarity])
                            : "border-border/40 bg-muted/10 opacity-40 grayscale",
                        )}
                      >
                        <div className="relative">
                          <span className="text-2xl">{achievement.emoji}</span>
                          {!earned && (
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-foreground leading-tight">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                          {achievement.description}
                        </p>
                        {earned && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs py-0",
                              RARITY_STYLES[achievement.rarity],
                            )}
                          >
                            {achievement.xpReward} XP
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
