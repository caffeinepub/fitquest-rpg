import { useCallback, useState } from "react";

export interface Activity {
  type: string;
  date: string;
  duration: number;
  xp: number;
  distance?: number;
  steps?: number;
  notes?: string;
}

export interface BodyMetric {
  date: string;
  weight: number;
  bodyFat: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
}

export interface BossChallenge {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  phases: number[];
  currentProgress: number;
  xpReward: number;
  coinReward: number;
  joined: boolean;
  daysRemaining: number;
  totalDays: number;
  completed: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "skins" | "gear" | "boosters";
  cost: number;
  rarity: "common" | "rare" | "legendary";
  emoji: string;
}

export interface GameState {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  coins: number;
  streakDays: number;
  strengthXp: number;
  enduranceXp: number;
  agilityXp: number;
  weeklyXp: number;
  achievements: string[];
  completedWorkouts: number;
  inventory: string[];
  bodyMetrics: BodyMetric[];
  recentActivities: Activity[];
  dailyQuests: DailyQuest[];
  bossChallenges: BossChallenge[];
  xpBoosterActive: boolean;
  xpBoosterExpiry?: number;
  lastQuestReset?: string;
  equippedSkin: string;
  rankBoostActive: boolean;
  rankBoostExpiry?: number;
}

const STORAGE_KEY = "fitquest_game_state";

function calcXpToNextLevel(level: number): number {
  return Math.floor(100 * (level + 1) ** 1.8);
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: "q1",
    title: "Walking Warrior",
    description: "Walk 8,000 steps today",
    xpReward: 150,
    coinReward: 10,
    current: 4500,
    target: 8000,
    unit: "steps",
    completed: false,
  },
  {
    id: "q2",
    title: "Iron Session",
    description: "Complete any workout",
    xpReward: 200,
    coinReward: 15,
    current: 0,
    target: 1,
    unit: "workouts",
    completed: false,
  },
  {
    id: "q3",
    title: "Hydration Hero",
    description: "Log any fitness activity",
    xpReward: 120,
    coinReward: 8,
    current: 0,
    target: 1,
    unit: "activities",
    completed: false,
  },
];

const DEFAULT_BOSSES: BossChallenge[] = [
  {
    id: "boss1",
    name: "The Iron Marathoner",
    subtitle: "Distance Dominator",
    description:
      "Run 50km total across multiple sessions. Conquer the distance in phases to unlock legendary rewards.",
    phases: [10000, 25000, 50000],
    currentProgress: 18500,
    xpReward: 5000,
    coinReward: 500,
    joined: true,
    daysRemaining: 18,
    totalDays: 30,
    completed: false,
  },
  {
    id: "boss2",
    name: "The Iron Titan",
    subtitle: "Strength Overlord",
    description:
      "Complete 30 strength workouts in 45 days. Forge your body into an unstoppable machine.",
    phases: [10, 20, 30],
    currentProgress: 7,
    xpReward: 4000,
    coinReward: 400,
    joined: true,
    daysRemaining: 38,
    totalDays: 45,
    completed: false,
  },
  {
    id: "boss3",
    name: "The Monk",
    subtitle: "Discipline Master",
    description:
      "Maintain a 21-day activity streak. Prove that consistency is the ultimate power.",
    phases: [7, 14, 21],
    currentProgress: 7,
    xpReward: 6000,
    coinReward: 600,
    joined: false,
    daysRemaining: 21,
    totalDays: 21,
    completed: false,
  },
];

const DEFAULT_STATE: GameState = {
  level: 5,
  totalXp: 8420,
  xpToNextLevel: calcXpToNextLevel(5),
  coins: 340,
  streakDays: 7,
  strengthXp: 3200,
  enduranceXp: 2800,
  agilityXp: 1800,
  weeklyXp: 1250,
  achievements: ["first_blood", "first_steps", "week_warrior", "centurion"],
  completedWorkouts: 23,
  inventory: [],
  bodyMetrics: [
    { date: "2026-02-01", weight: 82, bodyFat: 18 },
    { date: "2026-02-08", weight: 81.5, bodyFat: 17.8 },
    { date: "2026-02-15", weight: 81, bodyFat: 17.5 },
    { date: "2026-02-22", weight: 80.5, bodyFat: 17.2 },
    { date: "2026-03-01", weight: 80, bodyFat: 17 },
  ],
  recentActivities: [
    {
      type: "running",
      date: "2026-03-06",
      duration: 35,
      xp: 280,
      distance: 5000,
    },
    { type: "gym_strength", date: "2026-03-05", duration: 45, xp: 350 },
    { type: "yoga", date: "2026-03-04", duration: 30, xp: 144 },
    { type: "hiit", date: "2026-03-03", duration: 25, xp: 300 },
    { type: "cycling", date: "2026-03-02", duration: 60, xp: 432 },
  ],
  dailyQuests: DEFAULT_QUESTS,
  bossChallenges: DEFAULT_BOSSES,
  xpBoosterActive: false,
  lastQuestReset: new Date().toDateString(),
  equippedSkin: "⚔️",
  rankBoostActive: false,
};

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw) as Partial<GameState>;
    // Reset daily quests if it's a new day
    const today = new Date().toDateString();
    const lastReset = saved.lastQuestReset;
    if (lastReset !== today) {
      saved.dailyQuests = DEFAULT_QUESTS;
      saved.lastQuestReset = today;
    }
    // Clear expired XP booster
    if (
      saved.xpBoosterActive &&
      saved.xpBoosterExpiry &&
      Date.now() > saved.xpBoosterExpiry
    ) {
      saved.xpBoosterActive = false;
      saved.xpBoosterExpiry = undefined;
    }
    // Clear expired Rank Boost
    if (
      saved.rankBoostActive &&
      saved.rankBoostExpiry &&
      Date.now() > saved.rankBoostExpiry
    ) {
      saved.rankBoostActive = false;
      saved.rankBoostExpiry = undefined;
    }
    return { ...DEFAULT_STATE, ...saved };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useGameState() {
  const [state, setStateRaw] = useState<GameState>(loadState);

  const setState = useCallback((updater: (prev: GameState) => GameState) => {
    setStateRaw((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addXp = useCallback(
    (amount: number): { leveledUp: boolean; newLevel: number } => {
      let leveledUp = false;
      let newLevel = 0;

      setState((prev) => {
        const multiplier = prev.xpBoosterActive ? 1.5 : 1;
        const earned = Math.floor(amount * multiplier);
        let totalXp = prev.totalXp + earned;
        let level = prev.level;
        let xpToNext = prev.xpToNextLevel;
        let leveled = false;

        while (totalXp >= xpToNext) {
          totalXp -= xpToNext;
          level++;
          xpToNext = calcXpToNextLevel(level);
          leveled = true;
        }

        leveledUp = leveled;
        newLevel = level;

        return {
          ...prev,
          totalXp,
          level,
          xpToNextLevel: xpToNext,
          weeklyXp: prev.weeklyXp + earned,
        };
      });

      return { leveledUp, newLevel };
    },
    [setState],
  );

  const addCoins = useCallback(
    (amount: number) => {
      setState((prev) => ({ ...prev, coins: prev.coins + amount }));
    },
    [setState],
  );

  const spendCoins = useCallback(
    (amount: number): boolean => {
      let success = false;
      setState((prev) => {
        if (prev.coins < amount) return prev;
        success = true;
        return { ...prev, coins: prev.coins - amount };
      });
      return success;
    },
    [setState],
  );

  const addToInventory = useCallback(
    (itemId: string) => {
      setState((prev) => ({
        ...prev,
        inventory: [...prev.inventory, itemId],
      }));
    },
    [setState],
  );

  const logActivity = useCallback(
    (activity: Activity) => {
      setState((prev) => {
        const activities = [activity, ...prev.recentActivities].slice(0, 20);
        // Update skill XP based on type
        let strengthXp = prev.strengthXp;
        let enduranceXp = prev.enduranceXp;
        let agilityXp = prev.agilityXp;
        if (activity.type === "gym_strength" || activity.type === "hiit") {
          strengthXp += Math.floor(activity.xp * 0.6);
        }
        if (
          activity.type === "running" ||
          activity.type === "cycling" ||
          activity.type === "swimming"
        ) {
          enduranceXp += Math.floor(activity.xp * 0.6);
        }
        if (
          activity.type === "yoga" ||
          activity.type === "walking" ||
          activity.type === "sports"
        ) {
          agilityXp += Math.floor(activity.xp * 0.6);
        }
        return {
          ...prev,
          recentActivities: activities,
          completedWorkouts: prev.completedWorkouts + 1,
          strengthXp,
          enduranceXp,
          agilityXp,
        };
      });
    },
    [setState],
  );

  const completeQuest = useCallback(
    (questId: string) => {
      setState((prev) => {
        const quests = prev.dailyQuests.map((q) => {
          if (q.id === questId && !q.completed) {
            return { ...q, completed: true, current: q.target };
          }
          return q;
        });
        return { ...prev, dailyQuests: quests };
      });
    },
    [setState],
  );

  const joinBoss = useCallback(
    (bossId: string) => {
      setState((prev) => ({
        ...prev,
        bossChallenges: prev.bossChallenges.map((b) =>
          b.id === bossId ? { ...b, joined: true } : b,
        ),
      }));
    },
    [setState],
  );

  const addBodyMetric = useCallback(
    (metric: BodyMetric) => {
      setState((prev) => ({
        ...prev,
        bodyMetrics: [...prev.bodyMetrics, metric].slice(-20),
      }));
    },
    [setState],
  );

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      setState((prev) => {
        if (prev.achievements.includes(achievementId)) return prev;
        return {
          ...prev,
          achievements: [...prev.achievements, achievementId],
        };
      });
    },
    [setState],
  );

  const activateXpBooster = useCallback(() => {
    setState((prev) => ({
      ...prev,
      xpBoosterActive: true,
      xpBoosterExpiry: Date.now() + 24 * 60 * 60 * 1000,
    }));
  }, [setState]);

  const equipSkin = useCallback(
    (emoji: string) => {
      setState((prev) => ({ ...prev, equippedSkin: emoji }));
    },
    [setState],
  );

  const activateRankBoost = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rankBoostActive: true,
      rankBoostExpiry: Date.now() + 48 * 60 * 60 * 1000,
    }));
  }, [setState]);

  const attackBoss = useCallback(
    (
      bossId: string,
      progressAmount: number,
    ): {
      phaseCompleted: boolean;
      bossDefeated: boolean;
      phaseIndex: number;
    } => {
      let phaseCompleted = false;
      let bossDefeated = false;
      let phaseIndex = 0;

      setState((prev) => {
        const boss = prev.bossChallenges.find((b) => b.id === bossId);
        if (!boss || boss.completed || !boss.joined) return prev;

        const oldProgress = boss.currentProgress;
        const newProgress = oldProgress + progressAmount;
        const maxProgress = boss.phases[boss.phases.length - 1];

        // Find which phase was just crossed
        const oldPhaseIdx = boss.phases.findIndex((p) => oldProgress < p);
        const newPhaseIdx = boss.phases.findIndex((p) => newProgress < p);

        let xpToAdd = 0;
        let coinsToAdd = 0;

        if (newPhaseIdx !== oldPhaseIdx || newProgress >= maxProgress) {
          // Phase(s) were crossed – award proportional rewards
          const phaseRewards = [0.3, 0.4, 0.3];
          const phaseCrossed =
            newPhaseIdx === -1 ? boss.phases.length - 1 : newPhaseIdx - 1;
          if (phaseCrossed >= 0) {
            xpToAdd = Math.floor(boss.xpReward * phaseRewards[phaseCrossed]);
            coinsToAdd = Math.floor(
              boss.coinReward * phaseRewards[phaseCrossed],
            );
          }
          phaseCompleted = true;
          phaseIndex = newPhaseIdx === -1 ? boss.phases.length : newPhaseIdx;
        }

        const finalCompleted = newProgress >= maxProgress;
        if (finalCompleted) {
          // Award final phase bonus if not already awarded
          if (!phaseCompleted) {
            xpToAdd += Math.floor(boss.xpReward * 0.3);
            coinsToAdd += Math.floor(boss.coinReward * 0.3);
          }
          bossDefeated = true;
        }

        const updatedBosses = prev.bossChallenges.map((b) =>
          b.id === bossId
            ? {
                ...b,
                currentProgress: Math.min(newProgress, maxProgress),
                completed: finalCompleted,
              }
            : b,
        );

        // Calculate XP/level updates inline
        const multiplier = prev.xpBoosterActive ? 1.5 : 1;
        const earnedXp = Math.floor(xpToAdd * multiplier);
        let totalXp = prev.totalXp + earnedXp;
        let level = prev.level;
        let xpToNext = prev.xpToNextLevel;
        while (totalXp >= xpToNext) {
          totalXp -= xpToNext;
          level++;
          xpToNext = Math.floor(100 * (level + 1) ** 1.8);
        }

        return {
          ...prev,
          bossChallenges: updatedBosses,
          totalXp,
          level,
          xpToNextLevel: xpToNext,
          weeklyXp: prev.weeklyXp + earnedXp,
          coins: prev.coins + coinsToAdd,
        };
      });

      return { phaseCompleted, bossDefeated, phaseIndex };
    },
    [setState],
  );

  return {
    state,
    addXp,
    addCoins,
    spendCoins,
    addToInventory,
    logActivity,
    completeQuest,
    joinBoss,
    addBodyMetric,
    unlockAchievement,
    activateXpBooster,
    equipSkin,
    activateRankBoost,
    attackBoss,
  };
}
