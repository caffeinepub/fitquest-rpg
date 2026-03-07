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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Dumbbell,
  Flame,
  Heart,
  Plus,
  Wind,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";
import { ACTIVITY_TYPES, calcActivityXp } from "../data/workouts";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border/60 bg-card/80 hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {label}
              </p>
              <p className="text-xl font-bold font-display text-foreground">
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardPage() {
  const { state, addXp, addCoins, logActivity, completeQuest } = useGame();
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [logType, setLogType] = useState("running");
  const [logDuration, setLogDuration] = useState("");
  const [logDistance, setLogDistance] = useState("");

  const xpPercent = Math.floor((state.totalXp / state.xpToNextLevel) * 100);
  const strengthPercent = Math.min(
    100,
    Math.floor((state.strengthXp / 10000) * 100),
  );
  const endurancePercent = Math.min(
    100,
    Math.floor((state.enduranceXp / 10000) * 100),
  );
  const agilityPercent = Math.min(
    100,
    Math.floor((state.agilityXp / 10000) * 100),
  );

  const handleCompleteQuest = (questId: string, xp: number, coins: number) => {
    completeQuest(questId);
    const result = addXp(xp);
    addCoins(coins);
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    toast.success(`Quest complete! +${xp} XP +${coins} coins`);
  };

  const handleLogActivity = () => {
    if (!logDuration) return;
    const xp = calcActivityXp(
      logType,
      Number.parseInt(logDuration),
      logDistance ? Number.parseInt(logDistance) : undefined,
    );
    const activity = {
      type: logType,
      date: new Date().toISOString().split("T")[0],
      duration: Number.parseInt(logDuration),
      xp,
      distance: logDistance ? Number.parseInt(logDistance) : undefined,
    };
    logActivity(activity);
    const result = addXp(xp);
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    toast.success(`Activity logged! +${xp} XP`);
    setLogOpen(false);
    setLogDuration("");
    setLogDistance("");
  };

  const activityEmojis: Record<string, string> = {
    running: "🏃",
    gym_strength: "🏋️",
    yoga: "🧘",
    hiit: "🔥",
    cycling: "🚴",
    walking: "🚶",
    swimming: "🏊",
    sports: "⚽",
  };

  const previewXp = logDuration
    ? calcActivityXp(
        logType,
        Number.parseInt(logDuration) || 0,
        logDistance ? Number.parseInt(logDistance) : undefined,
      )
    : 0;

  return (
    <div className="space-y-6">
      <LevelUpModal
        open={levelUpOpen}
        level={levelUpLevel}
        onClose={() => setLevelUpOpen(false)}
      />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-black text-white">
            Command Center
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Quick log button */}
        <Dialog open={logOpen} onOpenChange={setLogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 font-bold"
              data-ocid="dashboard.log_activity.button"
            >
              <Plus className="h-4 w-4" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-card border-border/60 max-w-sm"
            data-ocid="activity.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold">
                Quick Log Activity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-sm text-foreground/80">
                  Activity Type
                </Label>
                <Select value={logType} onValueChange={setLogType}>
                  <SelectTrigger
                    className="mt-1.5 bg-input/50 border-border/60"
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
                <Input
                  type="number"
                  placeholder="30"
                  value={logDuration}
                  onChange={(e) => setLogDuration(e.target.value)}
                  className="mt-1.5 bg-input/50 border-border/60"
                  data-ocid="activity.duration.input"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground/80">
                  Distance (meters, optional)
                </Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={logDistance}
                  onChange={(e) => setLogDistance(e.target.value)}
                  className="mt-1.5 bg-input/50 border-border/60"
                />
              </div>
              {previewXp > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    +{previewXp} XP estimated
                  </span>
                </div>
              )}
              <Button
                onClick={handleLogActivity}
                disabled={!logDuration}
                className="w-full font-bold"
                data-ocid="activity.log.submit_button"
              >
                Log Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Zap}
          label="Total XP"
          value={state.totalXp.toLocaleString()}
          color="bg-primary/80"
          delay={0.05}
        />
        <StatCard
          icon={CoinIcon}
          label="Coins"
          value={state.coins.toLocaleString()}
          color="bg-yellow-600/80"
          delay={0.1}
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${state.streakDays} days`}
          color="bg-orange-600/80"
          delay={0.15}
        />
        <StatCard
          icon={Dumbbell}
          label="Workouts"
          value={state.completedWorkouts}
          color="bg-green-700/80"
          delay={0.2}
        />
      </div>

      {/* Character card + skill bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Character card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border/60 bg-card/80 card-glow-violet h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">
                    ⚔️
                  </div>
                  <span className="absolute -bottom-1 -right-1 inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs font-black level-badge text-white">
                    {state.level}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-black text-lg text-white truncate">
                    Adventurer
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/40 text-primary"
                    >
                      Level {state.level}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Flame className="h-3 w-3" />
                      {state.streakDays}d streak
                    </span>
                  </div>
                </div>
              </div>

              {/* XP bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">
                    XP Progress
                  </span>
                  <span className="text-primary font-bold">
                    {state.totalXp.toLocaleString()} /{" "}
                    {state.xpToNextLevel.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full xp-bar-fill rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {state.xpToNextLevel - state.totalXp} XP to Level{" "}
                  {state.level + 1}
                </p>
              </div>

              {/* Skill bars */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Dumbbell className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs font-medium text-foreground/70">
                      Strength
                    </span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full strength-bar-fill rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                    {state.strengthXp.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Heart className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-foreground/70">
                      Endurance
                    </span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${endurancePercent}%` }}
                      transition={{ duration: 1, delay: 0.55 }}
                      className="h-full endurance-bar-fill rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                    {state.enduranceXp.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Wind className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-foreground/70">
                      Agility
                    </span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agilityPercent}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full agility-bar-fill rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                    {state.agilityXp.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/60 bg-card/80 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Daily Quests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.dailyQuests.map((quest, idx) => {
                const questOcidIndex = idx + 1;
                const progress = Math.min(
                  100,
                  Math.floor((quest.current / quest.target) * 100),
                );
                const canComplete =
                  quest.current >= quest.target && !quest.completed;

                return (
                  <div
                    key={quest.id}
                    data-ocid={`dashboard.quest.item.${questOcidIndex}`}
                    className={cn(
                      "rounded-xl border p-3 transition-all",
                      quest.completed
                        ? "border-green-500/30 bg-green-500/5 quest-complete"
                        : "border-border/60 bg-muted/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {quest.completed && (
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                          )}
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              quest.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground",
                            )}
                          >
                            {quest.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {quest.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-primary">
                          +{quest.xpReward} XP
                        </p>
                        <p className="text-xs text-yellow-500">
                          +{quest.coinReward} 🪙
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full xp-bar-fill rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                        {quest.current.toLocaleString()}/
                        {quest.target.toLocaleString()}
                      </span>
                    </div>
                    {canComplete && (
                      <Button
                        size="sm"
                        className="mt-2 w-full h-7 text-xs font-bold bg-green-600 hover:bg-green-500"
                        onClick={() =>
                          handleCompleteQuest(
                            quest.id,
                            quest.xpReward,
                            quest.coinReward,
                          )
                        }
                        data-ocid={
                          idx === 0
                            ? "dashboard.quest.complete_button.1"
                            : undefined
                        }
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete Quest
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.recentActivities.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="activity.empty_state"
              >
                <p>No activities logged yet. Start your quest!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.recentActivities.slice(0, 5).map((activity, i) => {
                  const typeInfo = ACTIVITY_TYPES.find(
                    (t) => t.value === activity.type,
                  );
                  return (
                    <div
                      key={`${activity.date}-${activity.type}-${i}`}
                      data-ocid={`activity.item.${i + 1}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 text-lg flex-shrink-0">
                        {activityEmojis[activity.type] ?? "🏃"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize">
                          {typeInfo?.label ?? activity.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.duration} min
                          {activity.distance
                            ? ` · ${(activity.distance / 1000).toFixed(1)}km`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary">
                          +{activity.xp}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
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
  );
}

function CoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Coins"
      role="img"
    >
      <title>Coins</title>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9 10l3-2 3 2M9 14l3 2 3-2" />
    </svg>
  );
}
