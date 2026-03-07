import { type ReactNode, createContext, useContext } from "react";
import {
  type Activity,
  type BodyMetric,
  type GameState,
  useGameState,
} from "../hooks/useGameState";

interface GameContextValue {
  state: GameState;
  addXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addToInventory: (itemId: string) => void;
  logActivity: (activity: Activity) => void;
  completeQuest: (questId: string) => void;
  joinBoss: (bossId: string) => void;
  attackBoss: (
    bossId: string,
    progressAmount: number,
  ) => { phaseCompleted: boolean; bossDefeated: boolean; phaseIndex: number };
  addBodyMetric: (metric: BodyMetric) => void;
  unlockAchievement: (achievementId: string) => void;
  activateXpBooster: () => void;
  equipSkin: (emoji: string) => void;
  activateRankBoost: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameState = useGameState();

  return (
    <GameContext.Provider value={gameState}>{children}</GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
