import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Activity, Clock, Flame, TrendingUp, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useGame } from "../context/GameContext";

// ─── Activity label map ────────────────────────────────────────────────────
const ACTIVITY_LABEL_MAP: Record<string, string> = {
  running: "Running",
  gym_strength: "Gym (Strength)",
  yoga: "Yoga",
  hiit: "HIIT",
  cycling: "Cycling",
  walking: "Walking",
  swimming: "Swimming",
  strength: "Strength",
  cardio: "Cardio",
  flexibility: "Flexibility",
  balance: "Balance",
};

const ACTIVITY_EMOJI_MAP: Record<string, string> = {
  running: "🏃",
  gym_strength: "🏋️",
  yoga: "🧘",
  hiit: "🔥",
  cycling: "🚴",
  walking: "🚶",
  swimming: "🏊",
  strength: "💪",
  cardio: "❤️",
  flexibility: "🤸",
  balance: "⚖️",
};

const ACTIVITY_COLOR_MAP: Record<string, string> = {
  running: "oklch(0.65 0.22 25)",
  gym_strength: "oklch(0.67 0.22 295)",
  yoga: "oklch(0.72 0.18 145)",
  hiit: "oklch(0.80 0.18 85)",
  cycling: "oklch(0.60 0.18 225)",
  walking: "oklch(0.72 0.18 160)",
  swimming: "oklch(0.65 0.20 200)",
  strength: "oklch(0.68 0.22 30)",
  cardio: "oklch(0.62 0.20 10)",
  flexibility: "oklch(0.74 0.17 150)",
  balance: "oklch(0.70 0.15 260)",
};

function getActivityLabel(type: string): string {
  return (
    ACTIVITY_LABEL_MAP[type] ??
    type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

// ─── Date grouping helpers ─────────────────────────────────────────────────
function getDateGroup(dateStr: string): string {
  const today = new Date();
  const activityDate = new Date(`${dateStr}T12:00:00`); // noon to avoid timezone edge cases

  const toDateOnly = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const todayOnly = toDateOnly(today);
  const activityOnly = toDateOnly(activityDate);

  const diffMs = todayOnly.getTime() - activityOnly.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "This Week";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];

// ─── Stat Summary Card ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0, duration: 0.4 }}
    >
      <Card className="border-border/50 bg-card/80 overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 100% 100%, ${color}, transparent)`,
          }}
        />
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}40` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium leading-none mb-1">
                {label}
              </p>
              <p className="text-xl font-display font-black text-white leading-none">
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Activity Entry ─────────────────────────────────────────────────────────
function ActivityEntry({
  activity,
  index,
  globalIndex,
}: {
  activity: {
    type: string;
    date: string;
    duration: number;
    xp: number;
    distance?: number;
    steps?: number;
  };
  index: number;
  globalIndex: number;
}) {
  const label = getActivityLabel(activity.type);
  const emoji = ACTIVITY_EMOJI_MAP[activity.type] ?? "🏃";
  const color = ACTIVITY_COLOR_MAP[activity.type] ?? "oklch(0.67 0.22 295)";

  const formattedDate = new Date(
    `${activity.date}T12:00:00`,
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const ocidIndex = globalIndex + 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      data-ocid={`history.item.${ocidIndex}`}
      className="relative flex items-center gap-4 rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 hover:border-border/60 hover:bg-muted/20 transition-all duration-150 group"
    >
      {/* Color accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />

      {/* Activity icon */}
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-xl flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        {emoji}
      </div>

      {/* Activity info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {activity.duration} min
          </span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          {activity.distance && (
            <span className="text-xs text-muted-foreground">
              📍 {(activity.distance / 1000).toFixed(1)} km
            </span>
          )}
          {activity.steps && (
            <span className="text-xs text-muted-foreground">
              👣 {activity.steps.toLocaleString()} steps
            </span>
          )}
        </div>
      </div>

      {/* XP badge */}
      <div className="flex-shrink-0">
        <Badge
          className="font-mono text-xs font-bold px-2.5 py-1 border-0"
          style={{
            backgroundColor: `${color}25`,
            color: color,
          }}
        >
          <Zap className="h-3 w-3 mr-1" />+{activity.xp}
        </Badge>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export function WorkoutHistoryPage() {
  const { state } = useGame();

  const activities = state.recentActivities;

  // Summary stats
  const totalSessions = activities.length;
  const totalXp = activities.reduce((sum, a) => sum + a.xp, 0);
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const streak = state.streakDays;

  // Group activities by date label
  const grouped = new Map<string, typeof activities>();
  for (const activity of activities) {
    const group = getDateGroup(activity.date);
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(activity);
  }

  // Maintain canonical group order, only include groups that have entries
  const orderedGroups = GROUP_ORDER.filter((g) => grouped.has(g));

  // Track cumulative index for deterministic ocid markers
  let globalIdx = 0;

  return (
    <div className="space-y-6" data-ocid="history.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
          <Clock className="h-7 w-7 text-primary" />
          Workout History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your complete fitness journey — every session earns XP
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Sessions"
          value={totalSessions}
          icon={Activity}
          color="oklch(0.67 0.22 295)"
          delay={0.05}
        />
        <StatCard
          label="Total XP Earned"
          value={totalXp.toLocaleString()}
          icon={Zap}
          color="oklch(0.80 0.18 85)"
          delay={0.1}
        />
        <StatCard
          label="Total Minutes"
          value={totalDuration.toLocaleString()}
          icon={TrendingUp}
          color="oklch(0.65 0.22 25)"
          delay={0.15}
        />
        <StatCard
          label="Day Streak"
          value={`${streak} 🔥`}
          icon={Flame}
          color="oklch(0.72 0.22 35)"
          delay={0.2}
        />
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          data-ocid="history.empty_state"
        >
          <Card className="border-border/40 bg-card/60">
            <CardContent className="py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30 mx-auto mb-4">
                <Trophy className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">
                No activities yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Log your first workout in the Activity Log and watch your
                history come to life here.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orderedGroups.map((group) => {
              const groupActivities = grouped.get(group)!;

              return (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-border/40 bg-card/70">
                    <CardHeader className="pb-3 pt-4">
                      <div className="flex items-center gap-3">
                        <CardTitle className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
                          {group}
                        </CardTitle>
                        <Separator className="flex-1 bg-border/40" />
                        <span className="text-xs text-muted-foreground/60 font-mono">
                          {groupActivities.length} session
                          {groupActivities.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {groupActivities.map((activity, i) => {
                        const currentGlobalIdx = globalIdx;
                        globalIdx++;
                        return (
                          <ActivityEntry
                            key={`${activity.date}-${activity.type}-${i}`}
                            activity={activity}
                            index={i}
                            globalIndex={currentGlobalIdx}
                          />
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
