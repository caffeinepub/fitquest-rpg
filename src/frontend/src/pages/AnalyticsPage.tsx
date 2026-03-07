import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart2,
  Flame,
  Heart,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGame } from "../context/GameContext";

// ─── Custom Tooltip Styles ────────────────────────────────────────────────
const chartTooltipStyle = {
  backgroundColor: "oklch(0.16 0.022 270)",
  border: "1px solid oklch(0.26 0.022 270)",
  borderRadius: "10px",
  color: "oklch(0.97 0.01 270)",
  fontSize: "12px",
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
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
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 100% 100%, ${color}, transparent)`,
          }}
        />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1.5">
                {label}
              </p>
              <p className="text-3xl font-display font-black text-white leading-none">
                {value}
              </p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              )}
            </div>
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}` }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <h2 className="font-display font-bold text-white text-base leading-tight">
          {title}
        </h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Activity Color Map ─────────────────────────────────────────────────────
const ACTIVITY_COLORS: Record<string, string> = {
  running: "oklch(0.65 0.22 25)",
  gym_strength: "oklch(0.67 0.22 295)",
  yoga: "oklch(0.72 0.18 145)",
  hiit: "oklch(0.80 0.18 85)",
  cycling: "oklch(0.60 0.18 225)",
  walking: "oklch(0.72 0.18 160)",
  swimming: "oklch(0.65 0.20 200)",
};

const ACTIVITY_LABELS: Record<string, string> = {
  running: "Running",
  gym_strength: "Strength",
  yoga: "Yoga",
  hiit: "HIIT",
  cycling: "Cycling",
  walking: "Walking",
  swimming: "Swimming",
};

export function AnalyticsPage() {
  const { state } = useGame();

  // ── Weekly XP data (mock Mon–Sat + today) ─────────────────────────────────
  const weeklyXpData = [
    { day: "Mon", xp: 420 },
    { day: "Tue", xp: 680 },
    { day: "Wed", xp: 290 },
    { day: "Thu", xp: 850 },
    { day: "Fri", xp: 510 },
    { day: "Sat", xp: 730 },
    { day: "Today", xp: state.weeklyXp },
  ];

  // ── Skill XP data ─────────────────────────────────────────────────────────
  const skillData = [
    {
      skill: "Strength",
      xp: state.strengthXp,
      fill: "oklch(0.65 0.22 25)",
    },
    {
      skill: "Endurance",
      xp: state.enduranceXp,
      fill: "oklch(0.60 0.18 225)",
    },
    {
      skill: "Agility",
      xp: state.agilityXp,
      fill: "oklch(0.72 0.18 145)",
    },
  ];

  // ── Body weight data ──────────────────────────────────────────────────────
  const bodyData = state.bodyMetrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: m.weight,
    bodyFat: m.bodyFat,
  }));

  // ── Activity breakdown ────────────────────────────────────────────────────
  const activityCounts: Record<string, number> = {};
  for (const a of state.recentActivities) {
    activityCounts[a.type] = (activityCounts[a.type] ?? 0) + 1;
  }
  const activityPieData = Object.entries(activityCounts).map(
    ([type, count]) => ({
      name: ACTIVITY_LABELS[type] ?? type,
      value: count,
      fill: ACTIVITY_COLORS[type] ?? "oklch(0.67 0.22 295)",
    }),
  );

  // ── Weekly total XP ───────────────────────────────────────────────────────
  const weeklyTotal = weeklyXpData.reduce((sum, d) => sum + d.xp, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your fitness journey — XP earned, strength gained, and progress
          over time
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Weekly XP"
          value={weeklyTotal.toLocaleString()}
          sub="this week"
          icon={Zap}
          color="oklch(0.67 0.22 295 / 0.25)"
          delay={0}
        />
        <StatCard
          label="Workouts"
          value={state.completedWorkouts}
          sub="total completed"
          icon={Activity}
          color="oklch(0.60 0.18 225 / 0.25)"
          delay={0.06}
        />
        <StatCard
          label="Streak"
          value={`${state.streakDays}🔥`}
          sub="days in a row"
          icon={Flame}
          color="oklch(0.72 0.22 35 / 0.25)"
          delay={0.12}
        />
        <StatCard
          label="Coins"
          value={state.coins.toLocaleString()}
          sub="in your wallet"
          icon={Star}
          color="oklch(0.80 0.18 85 / 0.25)"
          delay={0.18}
        />
      </div>

      {/* Weekly XP + Skills – side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Weekly XP Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="border-border/50 bg-card/80 h-full">
            <CardHeader className="pb-2">
              <SectionHeader
                icon={TrendingUp}
                title="Weekly XP Activity"
                sub="Experience points earned each day"
              />
            </CardHeader>
            <CardContent data-ocid="analytics.weekly_xp.chart_point">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={weeklyXpData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.26 0.022 270 / 0.5)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "oklch(0.55 0.025 270)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.55 0.025 270)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    cursor={{ fill: "oklch(0.67 0.22 295 / 0.08)" }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} XP`,
                      "XP Earned",
                    ]}
                  />
                  <Bar dataKey="xp" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {weeklyXpData.map((entry) => (
                      <Cell
                        key={`cell-${entry.day}`}
                        fill={
                          entry.day === "Today"
                            ? "oklch(0.80 0.18 85)"
                            : "oklch(0.67 0.22 295)"
                        }
                        opacity={entry.day === "Today" ? 1 : 0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill XP Bars */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-card/80 h-full">
            <CardHeader className="pb-2">
              <SectionHeader
                icon={Trophy}
                title="Skill XP Breakdown"
                sub="Your class progression"
              />
            </CardHeader>
            <CardContent
              className="space-y-4 pt-2"
              data-ocid="analytics.skills.chart_point"
            >
              {skillData.map((skill) => {
                const maxSkillXp = Math.max(...skillData.map((s) => s.xp), 1);
                const pct = Math.min(100, (skill.xp / maxSkillXp) * 100);
                return (
                  <div key={skill.skill} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground/80">
                        {skill.skill}
                      </span>
                      <span
                        className="font-mono font-bold"
                        style={{ color: skill.fill }}
                      >
                        {skill.xp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: skill.fill }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Recharts hidden bar chart for marker */}
              <div className="hidden">
                <ResponsiveContainer width="100%" height={1}>
                  <BarChart data={skillData}>
                    <Bar dataKey="xp">
                      {skillData.map((s, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: recharts Cell requires index key
                        <Cell key={i} fill={s.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dominant skill badge */}
              <div className="mt-4 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Dominant Class
                </p>
                {(() => {
                  const dominant = skillData.reduce((a, b) =>
                    a.xp >= b.xp ? a : b,
                  );
                  return (
                    <Badge
                      variant="outline"
                      className="text-xs font-bold"
                      style={{
                        borderColor: `${dominant.fill}80`,
                        color: dominant.fill,
                        backgroundColor: `${dominant.fill}18`,
                      }}
                    >
                      {dominant.skill} Specialist
                    </Badge>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Body Weight + Activity Pie – side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Body Weight Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <SectionHeader
                icon={Heart}
                title="Body Composition"
                sub="Weight (kg) & body fat % over time"
              />
            </CardHeader>
            <CardContent data-ocid="analytics.body.chart_point">
              {bodyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={bodyData}
                    margin={{ top: 4, right: 12, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.26 0.022 270 / 0.5)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "oklch(0.55 0.025 270)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="weight"
                      orientation="left"
                      tick={{ fill: "oklch(0.55 0.025 270)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={["dataMin - 2", "dataMax + 2"]}
                    />
                    <YAxis
                      yAxisId="fat"
                      orientation="right"
                      tick={{ fill: "oklch(0.55 0.025 270)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={["dataMin - 2", "dataMax + 2"]}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value: number, name: string) => [
                        `${value}${name === "bodyFat" ? "%" : "kg"}`,
                        name === "weight" ? "Weight" : "Body Fat",
                      ]}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "weight" ? "Weight (kg)" : "Body Fat (%)"
                      }
                      wrapperStyle={{
                        fontSize: "11px",
                        color: "oklch(0.55 0.025 270)",
                      }}
                    />
                    <Line
                      yAxisId="weight"
                      type="monotone"
                      dataKey="weight"
                      stroke="oklch(0.67 0.22 295)"
                      strokeWidth={2.5}
                      dot={{
                        fill: "oklch(0.67 0.22 295)",
                        r: 4,
                        strokeWidth: 0,
                      }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="fat"
                      type="monotone"
                      dataKey="bodyFat"
                      stroke="oklch(0.72 0.22 35)"
                      strokeWidth={2}
                      dot={{
                        fill: "oklch(0.72 0.22 35)",
                        r: 3,
                        strokeWidth: 0,
                      }}
                      activeDot={{ r: 5 }}
                      strokeDasharray="5 3"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="h-60 flex items-center justify-center text-center"
                  data-ocid="analytics.body.empty_state"
                >
                  <p className="text-muted-foreground/50 text-sm">
                    Log body metrics to see your progress chart
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Breakdown Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-card/80 h-full">
            <CardHeader className="pb-2">
              <SectionHeader
                icon={Activity}
                title="Activity Mix"
                sub="Recent workout distribution"
              />
            </CardHeader>
            <CardContent data-ocid="analytics.activity.chart_point">
              {activityPieData.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={activityPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {activityPieData.map((entry, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: recharts Cell requires index key
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(value: number, name: string) => [
                          `${value} session${value !== 1 ? "s" : ""}`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="w-full space-y-1.5">
                    {activityPieData.map((entry) => (
                      <div
                        key={entry.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.fill }}
                          />
                          <span className="text-muted-foreground">
                            {entry.name}
                          </span>
                        </div>
                        <span className="font-bold text-foreground/80">
                          {entry.value}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="h-60 flex items-center justify-center"
                  data-ocid="analytics.activity.empty_state"
                >
                  <p className="text-muted-foreground/50 text-sm text-center">
                    Log activities to see your breakdown
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Personal Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <SectionHeader
              icon={Trophy}
              title="Personal Records"
              sub="Your all-time best achievements"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Best Streak",
                  value: `${state.streakDays} days`,
                  emoji: "🔥",
                  color: "text-orange-400",
                },
                {
                  label: "Total Workouts",
                  value: state.completedWorkouts.toString(),
                  emoji: "💪",
                  color: "text-primary",
                },
                {
                  label: "Total XP Earned",
                  value: state.totalXp.toLocaleString(),
                  emoji: "⚡",
                  color: "text-yellow-400",
                },
                {
                  label: "Current Level",
                  value: `Level ${state.level}`,
                  emoji: "🏆",
                  color: "text-yellow-500",
                },
                {
                  label: "Coins Earned",
                  value: state.coins.toLocaleString(),
                  emoji: "🪙",
                  color: "text-yellow-300",
                },
                {
                  label: "Achievements",
                  value: `${state.achievements.length} unlocked`,
                  emoji: "🎖️",
                  color: "text-green-400",
                },
              ].map((rec, i) => (
                <motion.div
                  key={rec.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 p-4",
                    "hover:border-border/60 transition-colors",
                  )}
                >
                  <span className="text-2xl flex-shrink-0">{rec.emoji}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{rec.label}</p>
                    <p
                      className={cn(
                        "text-lg font-display font-black",
                        rec.color,
                      )}
                    >
                      {rec.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
