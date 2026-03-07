export interface AvatarOption {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 1,
    name: "Warrior",
    emoji: "⚔️",
    description: "Strength-focused fighter",
  },
  {
    id: 2,
    name: "Runner",
    emoji: "🏃",
    description: "Speed and endurance master",
  },
  {
    id: 3,
    name: "Yogi",
    emoji: "🧘",
    description: "Flexibility and balance guru",
  },
  {
    id: 4,
    name: "Swimmer",
    emoji: "🏊",
    description: "Water-based cardio specialist",
  },
  {
    id: 5,
    name: "Cyclist",
    emoji: "🚴",
    description: "Long-distance endurance rider",
  },
  {
    id: 6,
    name: "Ninja",
    emoji: "🥷",
    description: "Agile stealth movement artist",
  },
  { id: 7, name: "Titan", emoji: "🗿", description: "Unstoppable powerhouse" },
  {
    id: 8,
    name: "Monk",
    emoji: "🧙",
    description: "Disciplined mind and body master",
  },
];

export function getAvatarEmoji(choice: number): string {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === choice);
  return avatar?.emoji ?? "⚔️";
}
