import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Crown, Medal, Rocket, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useGame } from "../context/GameContext";
import {
  ALLTIME_LEADERBOARD,
  type LeaderboardEntry,
  WEEKLY_LEADERBOARD,
} from "../data/leaderboard";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 flex-shrink-0">
        <Crown className="h-4 w-4 text-yellow-400" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500/20 flex-shrink-0">
        <Medal className="h-4 w-4 text-slate-300" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-900/20 flex-shrink-0">
        <Medal className="h-4 w-4 text-orange-600" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/30 flex-shrink-0">
      <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
    </div>
  );
}

function LeaderboardTable({
  data,
}: {
  data: LeaderboardEntry[];
  currentUserRank: number;
}) {
  return (
    <div className="space-y-2">
      {data.map((entry, idx) => (
        <motion.div
          key={entry.rank}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
          data-ocid={`leaderboard.row.${idx + 1}`}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
            entry.isCurrentUser
              ? "border-primary/40 bg-primary/10 card-glow-violet"
              : "border-border/50 bg-card/60 hover:border-border/70",
          )}
        >
          <RankBadge rank={entry.rank} />

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40 text-lg flex-shrink-0">
            {entry.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-bold truncate",
                  entry.isCurrentUser ? "text-primary" : "text-foreground",
                )}
              >
                {entry.name}
              </span>
              {entry.isCurrentUser && (
                <Badge
                  variant="outline"
                  className="text-xs border-primary/40 text-primary flex-shrink-0"
                >
                  You
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Level {entry.level}
            </span>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {entry.weeklyXp.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">XP this week</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Build a sorted leaderboard with re-ranked entries based on live user XP */
function buildDynamicLeaderboard(
  base: LeaderboardEntry[],
  userXpField: "weeklyXp" | "totalXp",
  liveUserXp: number,
  userAvatar: string,
): { sorted: LeaderboardEntry[]; userRank: number } {
  const updated = base.map((e) =>
    e.isCurrentUser
      ? { ...e, [userXpField]: liveUserXp, avatar: userAvatar }
      : e,
  );
  const sorted = [...updated]
    .sort((a, b) => b[userXpField] - a[userXpField])
    .map((e, i) => ({ ...e, rank: i + 1 }));
  const userEntry = sorted.find((e) => e.isCurrentUser);
  return { sorted, userRank: userEntry?.rank ?? 0 };
}

export function LeaderboardPage() {
  const { state } = useGame();

  const { sorted: weeklyData, userRank: weeklyRank } = buildDynamicLeaderboard(
    WEEKLY_LEADERBOARD,
    "weeklyXp",
    state.weeklyXp,
    state.equippedSkin,
  );

  const { sorted: allTimeData, userRank: allTimeRank } =
    buildDynamicLeaderboard(
      ALLTIME_LEADERBOARD,
      "totalXp",
      state.totalXp,
      state.equippedSkin,
    );

  // Next rank calculation (weekly)
  const entryAboveUser =
    weeklyRank > 1 ? weeklyData.find((e) => e.rank === weeklyRank - 1) : null;
  const userWeeklyEntry = weeklyData.find((e) => e.isCurrentUser);
  const userWeeklyXp = userWeeklyEntry?.weeklyXp ?? state.weeklyXp;
  const xpGap = entryAboveUser ? entryAboveUser.weeklyXp - userWeeklyXp : 0;
  const nextRankTarget = entryAboveUser ? entryAboveUser.weeklyXp : 0;
  const progressToNextRank =
    nextRankTarget > 0
      ? Math.min(100, Math.floor((userWeeklyXp / nextRankTarget) * 100))
      : 100;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-black text-white">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Compete with adventurers worldwide
        </p>
      </motion.div>

      {/* User rank summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/30 bg-primary/10 card-glow-violet">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Your Rank This Week
                  </p>
                  <p className="font-display text-2xl font-black text-white">
                    #{weeklyRank || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Weekly XP
                  </p>
                  <p className="font-display text-2xl font-black text-white">
                    {state.weeklyXp.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Next Rank card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        data-ocid="leaderboard.next_rank.card"
      >
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-4">
            {weeklyRank === 1 ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 flex-shrink-0">
                  <Crown className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-400">
                    You're #1 this week!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stay on top — keep grinding!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Next Rank:{" "}
                      <span className="text-primary">#{weeklyRank - 1}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {xpGap.toLocaleString()} XP needed to reach{" "}
                      <span className="text-foreground font-medium">
                        {entryAboveUser?.name}
                      </span>
                    </p>
                  </div>
                  <Link to="/shop">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-legendary/40 text-legendary hover:bg-legendary/10 text-xs font-bold flex-shrink-0"
                      data-ocid="leaderboard.rank_boost.button"
                    >
                      <Rocket className="h-3.5 w-3.5 mr-1.5" />
                      Get Rank Boost
                    </Button>
                  </Link>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{userWeeklyXp.toLocaleString()} XP</span>
                    <span>{nextRankTarget.toLocaleString()} XP</span>
                  </div>
                  <Progress value={progressToNextRank} className="h-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rank Boost active banner */}
      {state.rankBoostActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-legendary/40 bg-legendary/10 px-4 py-3 flex items-center gap-3 pulse-glow"
        >
          <Rocket className="h-5 w-5 text-legendary flex-shrink-0" />
          <p className="text-sm font-bold text-legendary">
            🚀 Rank Boost Active — Earning 2× Weekly XP!
          </p>
        </motion.div>
      )}

      {/* Leaderboard table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weekly">
              <TabsList className="mb-4 bg-muted/30 border border-border/50">
                <TabsTrigger
                  value="weekly"
                  className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
                  data-ocid="leaderboard.weekly.tab"
                >
                  This Week
                </TabsTrigger>
                <TabsTrigger
                  value="alltime"
                  className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
                  data-ocid="leaderboard.alltime.tab"
                >
                  All Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weekly">
                <LeaderboardTable
                  data={weeklyData}
                  currentUserRank={weeklyRank}
                />
              </TabsContent>

              <TabsContent value="alltime">
                <LeaderboardTable
                  data={allTimeData}
                  currentUserRank={allTimeRank}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
