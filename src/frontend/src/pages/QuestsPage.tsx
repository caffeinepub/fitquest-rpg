import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Shield,
  Sword,
  Target,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";

function PhaseIndicator({
  phases,
  current,
  unit,
}: {
  phases: number[];
  current: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {phases.map((phase, i) => {
        const isComplete = current >= phase;
        const isActive = !isComplete && (i === 0 || current >= phases[i - 1]);
        return (
          <div key={`phase-${phase}`} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full flex-shrink-0",
                isComplete
                  ? "bg-green-400"
                  : isActive
                    ? "bg-primary pulse-glow"
                    : "bg-muted/60",
              )}
            />
            <span
              className={cn(
                "text-xs font-mono",
                isComplete
                  ? "text-green-400"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
            >
              {unit === "km" ? `${phase / 1000}km` : phase}
            </span>
            {i < phases.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function QuestsPage() {
  const { state, addXp, addCoins, completeQuest, joinBoss } = useGame();
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  const handleCompleteQuest = (questId: string, xp: number, coins: number) => {
    completeQuest(questId);
    const result = addXp(xp);
    addCoins(coins);
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    toast.success(`Quest complete! +${xp} XP, +${coins} coins`);
  };

  const handleJoinBoss = (bossId: string) => {
    joinBoss(bossId);
    toast.success("Boss challenge joined! The battle begins...");
  };

  return (
    <div className="space-y-6">
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
          Quests & Bosses
        </h1>
        <p className="text-muted-foreground text-sm">
          Complete quests and defeat boss challenges for legendary rewards
        </p>
      </motion.div>

      {/* Daily Quests */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-white">
            Daily Quests
          </h2>
          <Badge
            variant="outline"
            className="text-xs border-primary/40 text-primary"
          >
            Resets daily
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {state.dailyQuests.map((quest, idx) => {
            const progress = Math.min(
              100,
              Math.floor((quest.current / quest.target) * 100),
            );
            const canComplete =
              quest.current >= quest.target && !quest.completed;

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                data-ocid={`quests.daily.item.${idx + 1}`}
              >
                <Card
                  className={cn(
                    "border h-full transition-all duration-200",
                    quest.completed
                      ? "border-green-500/30 bg-green-500/5 quest-complete"
                      : canComplete
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/60 bg-card/80",
                  )}
                >
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {quest.completed && (
                            <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold mb-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </div>
                          )}
                          <h3
                            className={cn(
                              "font-display font-bold text-sm",
                              quest.completed
                                ? "text-muted-foreground line-through"
                                : "text-white",
                            )}
                          >
                            {quest.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {quest.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs font-bold text-primary">
                            +{quest.xpReward}
                          </p>
                          <p className="text-xs text-yellow-500">
                            +{quest.coinReward}🪙
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-foreground/70 font-mono">
                            {quest.current.toLocaleString()} /{" "}
                            {quest.target.toLocaleString()} {quest.unit}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              quest.completed ? "bg-green-500" : "xp-bar-fill",
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {canComplete && (
                      <Button
                        size="sm"
                        className="mt-3 w-full h-8 text-xs font-bold bg-green-600 hover:bg-green-500"
                        onClick={() =>
                          handleCompleteQuest(
                            quest.id,
                            quest.xpReward,
                            quest.coinReward,
                          )
                        }
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Claim Reward
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Boss Challenges */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sword className="h-5 w-5 text-boss-red" />
          <h2 className="font-display text-lg font-bold text-white">
            Boss Challenges
          </h2>
          <Badge
            variant="outline"
            className="text-xs border-red-500/40 text-red-400"
          >
            Epic Rewards
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.bossChallenges.map((boss, idx) => {
            const maxPhase = boss.phases[boss.phases.length - 1];
            const progressPercent = Math.min(
              100,
              Math.floor((boss.currentProgress / maxPhase) * 100),
            );
            const currentPhaseIdx = boss.phases.findIndex(
              (p) => boss.currentProgress < p,
            );
            const activePhase =
              currentPhaseIdx === -1 ? boss.phases.length - 1 : currentPhaseIdx;

            return (
              <motion.div
                key={boss.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                data-ocid={`quests.boss.item.${idx + 1}`}
              >
                <div className="boss-card rounded-2xl border p-5 h-full flex flex-col">
                  {/* Boss header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-boss-red" />
                          <span className="text-xs font-semibold text-boss-red uppercase tracking-wider">
                            {boss.subtitle}
                          </span>
                        </div>
                        <h3 className="font-display font-black text-lg text-white leading-tight">
                          {boss.name}
                        </h3>
                      </div>
                      {boss.joined && (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500/40 text-green-400 flex-shrink-0"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {boss.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="flex-1 mb-4">
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">
                          Phase {Math.min(activePhase + 1, boss.phases.length)}{" "}
                          of {boss.phases.length}
                        </span>
                        <span className="font-mono text-foreground/70">
                          {(boss.currentProgress / 1000).toFixed(1)} /{" "}
                          {(maxPhase / 1000).toFixed(0)} km
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progressPercent}%`,
                            background:
                              "linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.72 0.20 40))",
                          }}
                        />
                      </div>
                    </div>

                    {/* Phases */}
                    <PhaseIndicator
                      phases={boss.phases}
                      current={boss.currentProgress}
                      unit="km"
                    />

                    {/* Time remaining */}
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{boss.daysRemaining} days remaining</span>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border/40 px-3 py-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">
                        {boss.xpReward.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🪙</span>
                      <span className="text-xs font-bold text-yellow-500">
                        {boss.coinReward} coins
                      </span>
                    </div>
                  </div>

                  {!boss.joined && (
                    <Button
                      size="sm"
                      className="w-full font-bold bg-boss-red hover:bg-boss-red/90 text-white"
                      onClick={() => handleJoinBoss(boss.id)}
                      data-ocid={
                        idx === 0 ? "quests.boss.join_button.1" : undefined
                      }
                    >
                      <Sword className="h-4 w-4 mr-1.5" />
                      Join Challenge
                    </Button>
                  )}
                  {boss.joined && progressPercent >= 100 && (
                    <Button
                      size="sm"
                      className="w-full font-bold bg-green-600 hover:bg-green-500"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Claim Victory
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
