import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Flame,
  Shield,
  Skull,
  Star,
  Sword,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";
import type { BossChallenge } from "../hooks/useGameState";

const BOSS_EMOJIS: Record<string, string> = {
  boss1: "🐉",
  boss2: "🏋️",
  boss3: "🧘",
};

const BOSS_PROGRESS_INCREMENTS: Record<string, number> = {
  // ~10% of total phase 3 target
  boss1: 5000, // 50000 total → 5000 per attack
  boss2: 3, // 30 total → 3 per attack
  boss3: 2, // 21 total → 2 per attack
};

function formatProgress(bossId: string, value: number): string {
  if (bossId === "boss1") return `${(value / 1000).toFixed(1)}km`;
  return `${value}`;
}

function PhaseStepper({
  boss,
}: {
  boss: BossChallenge;
}) {
  const phases = boss.phases;
  const max = phases[phases.length - 1];

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.72 0.20 40), oklch(0.80 0.18 85))",
          }}
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(100, (boss.currentProgress / max) * 100)}%`,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Phase markers */}
        {phases.slice(0, -1).map((p) => (
          <div
            key={`marker-${p}`}
            className="absolute top-0 bottom-0 w-0.5 bg-black/40"
            style={{ left: `${(p / max) * 100}%` }}
          />
        ))}
      </div>

      {/* Phase labels */}
      <div className="flex items-center gap-2">
        {phases.map((phase, i) => {
          const isComplete = boss.currentProgress >= phase;
          const isActive =
            !isComplete && (i === 0 || boss.currentProgress >= phases[i - 1]);
          return (
            <div
              key={`phase-label-${phase}`}
              className="flex items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs flex-shrink-0 transition-all",
                  isComplete
                    ? "bg-green-500/30 text-green-400"
                    : isActive
                      ? "bg-primary/20 text-primary pulse-glow"
                      : "bg-muted/40 text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-mono",
                  isComplete
                    ? "text-green-400"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground/60",
                )}
              >
                {formatProgress(boss.id, phase)}
              </span>
              {i < phases.length - 1 && (
                <span className="text-muted-foreground/30 text-xs">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActiveBossCard({
  boss,
  index,
  onJoin,
  onAttack,
}: {
  boss: BossChallenge;
  index: number;
  onJoin: (id: string) => void;
  onAttack: (id: string) => void;
}) {
  const max = boss.phases[boss.phases.length - 1];
  const progressPct = Math.min(100, (boss.currentProgress / max) * 100);
  const emoji = BOSS_EMOJIS[boss.id] ?? "👹";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      data-ocid={`boss.item.${index + 1}`}
    >
      <div
        className={cn(
          "relative rounded-2xl border p-5 flex flex-col gap-4 overflow-hidden h-full transition-all duration-300",
          boss.joined
            ? "border-boss-red/40 bg-gradient-to-br from-[oklch(0.13_0.025_15/0.98)] to-[oklch(0.11_0.018_270/0.95)] boss-card"
            : "border-border/50 bg-card/80",
        )}
      >
        {/* Glow aura for joined bosses */}
        {boss.joined && !boss.completed && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.65 0.22 25 / 0.12), transparent)",
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl",
                boss.joined
                  ? "bg-boss-red/15 ring-1 ring-boss-red/30"
                  : "bg-muted/30",
              )}
            >
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Shield className="h-3.5 w-3.5 text-boss-red" />
                <span className="text-xs font-bold text-boss-red uppercase tracking-widest">
                  {boss.subtitle}
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-white leading-tight">
                {boss.name}
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {boss.joined && (
              <Badge
                variant="outline"
                className="text-xs border-green-500/40 text-green-400 bg-green-500/10"
              >
                ⚔️ Active
              </Badge>
            )}
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                boss.daysRemaining < 7
                  ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                  : "bg-muted/30 text-muted-foreground",
              )}
            >
              <Clock className="h-3 w-3" />
              {boss.daysRemaining}d left
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed relative">
          {boss.description}
        </p>

        {/* Progress */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span className="font-mono text-foreground/70">
              {formatProgress(boss.id, boss.currentProgress)} /{" "}
              {formatProgress(boss.id, max)}
            </span>
          </div>
          <PhaseStepper boss={boss} />
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/30 px-3 py-2.5 relative">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              {boss.xpReward.toLocaleString()} XP
            </span>
          </div>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-1.5">
            <span className="text-base">🪙</span>
            <span className="text-sm font-bold text-yellow-400">
              {boss.coinReward} coins
            </span>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-muted-foreground font-medium">
              {progressPct.toFixed(0)}% done
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          {!boss.joined && (
            <Button
              className="w-full font-bold bg-boss-red hover:bg-boss-red/90 text-white h-11 text-sm"
              onClick={() => onJoin(boss.id)}
              data-ocid={`boss.join_button.${index + 1}`}
            >
              <Sword className="h-4 w-4 mr-2" />
              Join Challenge
            </Button>
          )}
          {boss.joined && !boss.completed && (
            <Button
              className="w-full font-black h-11 text-sm text-white transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.55 0.26 310))",
                boxShadow: "0 4px 20px oklch(0.65 0.22 25 / 0.35)",
              }}
              onClick={() => onAttack(boss.id)}
              data-ocid={`boss.attack_button.${index + 1}`}
            >
              <Flame className="h-4 w-4 mr-2" />
              ⚔️ Attack Boss
            </Button>
          )}
          {boss.completed && (
            <div className="flex items-center justify-center gap-2 h-11 rounded-xl bg-green-500/15 border border-green-500/30">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="font-black text-green-400 text-sm">
                ⚡ Defeated!
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DefeatedBossCard({
  boss,
  index,
}: {
  boss: BossChallenge;
  index: number;
}) {
  const emoji = BOSS_EMOJIS[boss.id] ?? "👹";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-3"
    >
      <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20 text-2xl opacity-60">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-sm text-muted-foreground truncate">
          {boss.name}
        </h4>
        <p className="text-xs text-muted-foreground/60">{boss.subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <Trophy className="h-5 w-5 text-yellow-500/60" />
        <span className="text-xs text-muted-foreground/50 font-bold">
          +{boss.xpReward.toLocaleString()} XP
        </span>
      </div>
    </motion.div>
  );
}

export function BossesPage() {
  const { state, joinBoss, attackBoss } = useGame();
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  const activeBosses = state.bossChallenges.filter((b) => !b.completed);
  const defeatedBosses = state.bossChallenges.filter((b) => b.completed);

  const handleJoin = (bossId: string) => {
    joinBoss(bossId);
    toast.success("Boss challenge joined! The battle begins...", {
      icon: "⚔️",
    });
  };

  const handleAttack = (bossId: string) => {
    const increment = BOSS_PROGRESS_INCREMENTS[bossId] ?? 10;
    const result = attackBoss(bossId, increment);

    if (result.bossDefeated) {
      toast.success("🏆 BOSS DEFEATED! Legendary rewards claimed!", {
        duration: 5000,
        description: "An incredible victory! Check your inventory for rewards.",
      });
    } else if (result.phaseCompleted) {
      toast.success(
        `Phase ${result.phaseIndex} Complete! Bonus XP & coins awarded!`,
        {
          icon: "⚡",
          duration: 3000,
        },
      );
    } else {
      toast("Attack landed! Keep pushing forward!", {
        icon: "⚔️",
      });
    }

    // Check for level up via XP state change
    const newLevel = state.level;
    if (result.bossDefeated && newLevel > state.level) {
      setLevelUpLevel(newLevel);
      setLevelUpOpen(true);
    }
  };

  return (
    <div className="space-y-8">
      <LevelUpModal
        open={levelUpOpen}
        level={levelUpLevel}
        onClose={() => setLevelUpOpen(false)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-black text-white flex items-center gap-3">
            <Skull className="h-8 w-8 text-boss-red" />
            Boss Battles
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Defeat legendary bosses through real-world fitness challenges and
            claim epic loot
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs bg-boss-red/10 border border-boss-red/25 rounded-xl px-3 py-2 flex-shrink-0">
          <Star className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-foreground/70">
            <span className="font-bold text-yellow-400">
              {defeatedBosses.length}
            </span>{" "}
            defeated
          </span>
        </div>
      </motion.div>

      {/* Active Bosses */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Sword className="h-5 w-5 text-boss-red" />
          <h2 className="font-display text-lg font-bold text-white">
            Active Boss Challenges
          </h2>
          <Badge
            variant="outline"
            className="text-xs border-red-500/40 text-red-400 bg-red-500/5"
          >
            Epic Rewards
          </Badge>
        </div>

        {activeBosses.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border border-dashed border-border/40"
            data-ocid="boss.empty_state"
          >
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              All bosses defeated! New challenges coming soon...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <AnimatePresence>
              {activeBosses.map((boss, idx) => (
                <ActiveBossCard
                  key={boss.id}
                  boss={boss}
                  index={idx}
                  onJoin={handleJoin}
                  onAttack={handleAttack}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Defeated Bosses */}
      {defeatedBosses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="font-display text-lg font-bold text-white">
              Trophy Room
            </h2>
            <Badge
              variant="outline"
              className="text-xs border-yellow-500/40 text-yellow-400"
            >
              {defeatedBosses.length} defeated
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {defeatedBosses.map((boss, idx) => (
              <DefeatedBossCard key={boss.id} boss={boss} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Lore / flavor section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border/30 bg-muted/10 p-5"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-4xl">📜</div>
          <div>
            <h3 className="font-display font-bold text-white mb-1.5">
              The Legend of Boss Battles
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each boss represents a pinnacle of physical achievement. The Iron
              Marathoner demands endurance beyond measure. The Iron Titan tests
              raw strength. The Monk requires unwavering consistency. Attack
              bosses by completing real workouts, and your progress is tracked
              across sessions. Defeat them all to become a legend.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
