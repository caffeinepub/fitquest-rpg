export type WorkoutCategory =
  | "Strength"
  | "Cardio"
  | "Flexibility"
  | "HIIT"
  | "Balance";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  difficulty: Difficulty;
  duration: number; // minutes
  xpReward: number;
  description: string;
  emoji: string;
  exercises: Exercise[];
}

export const WORKOUTS: Workout[] = [
  {
    id: "w1",
    name: "Iron Body",
    category: "Strength",
    difficulty: "Intermediate",
    duration: 45,
    xpReward: 350,
    description:
      "Classic compound lifts targeting all major muscle groups. The foundation of strength.",
    emoji: "🏋️",
    exercises: [
      { name: "Back Squat", sets: 4, reps: "8-10" },
      { name: "Bench Press", sets: 4, reps: "8-10" },
      { name: "Deadlift", sets: 3, reps: "5-6" },
      { name: "Barbell Row", sets: 3, reps: "8-10" },
      { name: "Overhead Press", sets: 3, reps: "8-10" },
    ],
  },
  {
    id: "w2",
    name: "Morning Blaze",
    category: "HIIT",
    difficulty: "Beginner",
    duration: 20,
    xpReward: 280,
    description:
      "High-intensity circuit to ignite your metabolism and wake up every muscle.",
    emoji: "🔥",
    exercises: [
      { name: "Burpees", duration: "40s on / 20s rest", sets: 4 },
      { name: "Jump Squats", duration: "40s on / 20s rest", sets: 4 },
      { name: "Mountain Climbers", duration: "40s on / 20s rest", sets: 4 },
      { name: "High Knees", duration: "40s on / 20s rest", sets: 4 },
    ],
  },
  {
    id: "w3",
    name: "Zen Flow",
    category: "Flexibility",
    difficulty: "Beginner",
    duration: 30,
    xpReward: 180,
    description:
      "Full body yoga flow to improve mobility, reduce stress and restore balance.",
    emoji: "🧘",
    exercises: [
      { name: "Sun Salutation A", sets: 5, reps: "flow" },
      { name: "Warrior II Sequence", duration: "3 min each side" },
      { name: "Pigeon Pose", duration: "2 min each side" },
      { name: "Seated Forward Fold", duration: "3 min" },
      { name: "Savasana", duration: "5 min" },
    ],
  },
  {
    id: "w4",
    name: "Cardio Crusher",
    category: "Cardio",
    difficulty: "Intermediate",
    duration: 40,
    xpReward: 320,
    description:
      "Treadmill interval training that builds cardiovascular endurance and burns fat.",
    emoji: "🏃",
    exercises: [
      { name: "Warm-up jog", duration: "5 min @ 60%" },
      { name: "Sprint intervals", duration: "1 min @ 90%, 2 min @ 60% × 8" },
      { name: "Steady-state run", duration: "10 min @ 75%" },
      { name: "Cool-down walk", duration: "5 min" },
    ],
  },
  {
    id: "w5",
    name: "Power Surge",
    category: "Strength",
    difficulty: "Advanced",
    duration: 60,
    xpReward: 420,
    description:
      "Olympic lifting and powerlifting hybrid for maximum strength and power output.",
    emoji: "⚡",
    exercises: [
      { name: "Power Clean", sets: 5, reps: "3" },
      { name: "Front Squat", sets: 4, reps: "5" },
      { name: "Push Jerk", sets: 4, reps: "3" },
      { name: "Romanian Deadlift", sets: 3, reps: "6" },
      { name: "Pull-ups", sets: 4, reps: "max" },
    ],
  },
  {
    id: "w6",
    name: "Balance Quest",
    category: "Balance",
    difficulty: "Beginner",
    duration: 25,
    xpReward: 200,
    description:
      "Single-leg and stability exercises to build proprioception and prevent injury.",
    emoji: "⚖️",
    exercises: [
      { name: "Single-leg Deadlift", sets: 3, reps: "10 each" },
      { name: "Bosu Ball Squat", sets: 3, reps: "12" },
      { name: "Tree Pose", duration: "1 min each side" },
      { name: "Single-leg Calf Raises", sets: 3, reps: "15 each" },
      { name: "Stability Ball Plank", duration: "45s × 3" },
    ],
  },
  {
    id: "w7",
    name: "Sprint Factory",
    category: "Cardio",
    difficulty: "Advanced",
    duration: 35,
    xpReward: 380,
    description:
      "Elite sprint protocol to maximize VO₂ max and anaerobic capacity.",
    emoji: "💨",
    exercises: [
      { name: "Dynamic warm-up", duration: "10 min" },
      { name: "100m sprints", sets: 10, reps: "100m @ max" },
      { name: "400m tempo runs", sets: 3, reps: "1 min rest" },
      { name: "Stride drills", duration: "5 min" },
    ],
  },
  {
    id: "w8",
    name: "Core Forge",
    category: "Strength",
    difficulty: "Intermediate",
    duration: 30,
    xpReward: 260,
    description:
      "Targeted core-focused session building a steel foundation and injury-resistant midsection.",
    emoji: "🎯",
    exercises: [
      { name: "Hanging Leg Raises", sets: 4, reps: "12" },
      { name: "Cable Crunches", sets: 4, reps: "15" },
      { name: "Ab Wheel Rollout", sets: 3, reps: "10" },
      { name: "Dragon Flag", sets: 3, reps: "6" },
      { name: "Plank Variations", duration: "3 × 1 min" },
    ],
  },
  {
    id: "w9",
    name: "Warrior Flow",
    category: "HIIT",
    difficulty: "Advanced",
    duration: 45,
    xpReward: 440,
    description:
      "Full-body combat-inspired HIIT combining martial arts movements with strength.",
    emoji: "⚔️",
    exercises: [
      { name: "Kettlebell Swings", sets: 5, reps: "20" },
      { name: "Box Jump Burpees", sets: 4, reps: "10" },
      { name: "Battle Rope Slams", duration: "30s × 6" },
      { name: "Sandbag Carries", duration: "40m × 4" },
      { name: "Tire Flips", sets: 3, reps: "8" },
    ],
  },
  {
    id: "w10",
    name: "Flexibility Alchemy",
    category: "Flexibility",
    difficulty: "Intermediate",
    duration: 40,
    xpReward: 220,
    description:
      "Deep stretching and myofascial release to transform your range of motion.",
    emoji: "🌊",
    exercises: [
      { name: "PNF Hamstring Stretch", duration: "5 min each side" },
      { name: "Hip Flexor Couch Stretch", duration: "3 min each side" },
      { name: "Thoracic Rotation", duration: "4 min" },
      { name: "Shoulder Dislocations", sets: 3, reps: "15" },
      { name: "Loaded Jefferson Curl", sets: 3, reps: "8" },
    ],
  },
  {
    id: "w11",
    name: "Endurance Engine",
    category: "Cardio",
    difficulty: "Intermediate",
    duration: 50,
    xpReward: 340,
    description:
      "Zone 2 aerobic training that builds mitochondrial density and fat-burning capacity.",
    emoji: "🚴",
    exercises: [
      { name: "Steady bike ride", duration: "50 min @ 65-70% HR max" },
    ],
  },
  {
    id: "w12",
    name: "Gladiator Gauntlet",
    category: "HIIT",
    difficulty: "Advanced",
    duration: 30,
    xpReward: 460,
    description:
      "The ultimate test of full-body power and conditioning. Not for the faint-hearted.",
    emoji: "🛡️",
    exercises: [
      { name: "Clean & Press", sets: 5, reps: "5" },
      { name: "Thrusters", sets: 4, reps: "10" },
      { name: "Muscle-ups", sets: 3, reps: "5" },
      { name: "Devil Press", sets: 4, reps: "8" },
      { name: "Sprint", duration: "200m × 4" },
    ],
  },
  {
    id: "w13",
    name: "Serenity Now",
    category: "Flexibility",
    difficulty: "Beginner",
    duration: 20,
    xpReward: 160,
    description:
      "Gentle morning mobility routine to loosen joints and prepare for the day.",
    emoji: "☀️",
    exercises: [
      { name: "Cat-Cow", duration: "2 min" },
      { name: "Thread the Needle", duration: "1 min each side" },
      { name: "Child's Pose", duration: "2 min" },
      { name: "Seated Hip Circles", duration: "2 min" },
      { name: "Doorframe Chest Stretch", duration: "1 min each side" },
    ],
  },
  {
    id: "w14",
    name: "Strength Rite",
    category: "Strength",
    difficulty: "Beginner",
    duration: 35,
    xpReward: 240,
    description:
      "Entry-level strength training with perfect form cues for every movement.",
    emoji: "💪",
    exercises: [
      { name: "Goblet Squat", sets: 3, reps: "12" },
      { name: "Dumbbell Press", sets: 3, reps: "10" },
      { name: "Lat Pulldown", sets: 3, reps: "12" },
      { name: "Dumbbell Lunges", sets: 3, reps: "10 each" },
      { name: "Face Pulls", sets: 3, reps: "15" },
    ],
  },
  {
    id: "w15",
    name: "Agility Storm",
    category: "Balance",
    difficulty: "Intermediate",
    duration: 30,
    xpReward: 280,
    description:
      "Ladder drills and agility exercises to enhance speed, reaction, and coordination.",
    emoji: "🌪️",
    exercises: [
      { name: "Ladder Drills", duration: "15 min variety" },
      { name: "Cone Zigzag", sets: 6, reps: "30m" },
      { name: "Reactive Jumps", sets: 4, reps: "10" },
      { name: "Lateral Bounds", sets: 3, reps: "10 each" },
    ],
  },
  {
    id: "w16",
    name: "Night Raid",
    category: "HIIT",
    difficulty: "Intermediate",
    duration: 25,
    xpReward: 300,
    description:
      "Short, intense evening session to maximize caloric burn in minimal time.",
    emoji: "🌙",
    exercises: [
      { name: "Tabata Circuits", duration: "8 rounds × 4 exercises" },
      { name: "Push-ups", duration: "20s × 8" },
      { name: "Air Squats", duration: "20s × 8" },
      { name: "Jumping Jacks", duration: "20s × 8" },
      { name: "Plank", duration: "20s × 8" },
    ],
  },
  {
    id: "w17",
    name: "Posture Warrior",
    category: "Balance",
    difficulty: "Beginner",
    duration: 20,
    xpReward: 180,
    description:
      "Corrective exercises targeting posterior chain and postural muscles.",
    emoji: "🎖️",
    exercises: [
      { name: "Band Pull-aparts", sets: 3, reps: "20" },
      { name: "Scapular Push-ups", sets: 3, reps: "15" },
      { name: "Wall Angels", sets: 3, reps: "12" },
      { name: "Hip Hinge Practice", sets: 3, reps: "15" },
    ],
  },
  {
    id: "w18",
    name: "Road Warrior",
    category: "Cardio",
    difficulty: "Beginner",
    duration: 30,
    xpReward: 240,
    description:
      "Beginner-friendly walk-to-run program to build your aerobic base safely.",
    emoji: "🛣️",
    exercises: [
      { name: "Brisk Walk", duration: "5 min" },
      { name: "Walk/Run Intervals", duration: "1 min run / 2 min walk × 6" },
      { name: "Cool-down walk", duration: "5 min" },
    ],
  },
  {
    id: "w19",
    name: "Titan Protocol",
    category: "Strength",
    difficulty: "Advanced",
    duration: 75,
    xpReward: 500,
    description:
      "Maximum effort powerbuilding session for those chasing elite-level strength.",
    emoji: "🏆",
    exercises: [
      { name: "Competition Squat", sets: 6, reps: "3 @ 85-90%" },
      { name: "Competition Bench", sets: 6, reps: "3 @ 85-90%" },
      { name: "Competition Deadlift", sets: 5, reps: "2 @ 90%" },
      { name: "Weighted Dips", sets: 4, reps: "6" },
      { name: "Barbell Curls", sets: 4, reps: "10" },
    ],
  },
  {
    id: "w20",
    name: "Recovery Ritual",
    category: "Flexibility",
    difficulty: "Beginner",
    duration: 35,
    xpReward: 190,
    description:
      "Active recovery session with foam rolling and light stretching for optimal regeneration.",
    emoji: "💤",
    exercises: [
      { name: "Foam Rolling", duration: "10 min full body" },
      { name: "Lacrosse Ball Pectorals", duration: "3 min each" },
      { name: "Hip Flexor Flow", duration: "5 min" },
      { name: "Hamstring Stretches", duration: "5 min each" },
      { name: "Breathing Exercises", duration: "5 min" },
    ],
  },
];

export const ACTIVITY_TYPES = [
  { value: "walking", label: "Walking", emoji: "🚶", category: "endurance" },
  { value: "running", label: "Running", emoji: "🏃", category: "endurance" },
  { value: "cycling", label: "Cycling", emoji: "🚴", category: "endurance" },
  {
    value: "gym_strength",
    label: "Gym / Strength",
    emoji: "🏋️",
    category: "strength",
  },
  { value: "yoga", label: "Yoga", emoji: "🧘", category: "agility" },
  { value: "hiit", label: "HIIT", emoji: "🔥", category: "strength" },
  { value: "swimming", label: "Swimming", emoji: "🏊", category: "endurance" },
  { value: "sports", label: "Sports", emoji: "⚽", category: "agility" },
];

export function calcActivityXp(
  type: string,
  durationMin: number,
  distanceM?: number,
): number {
  const intensityMap: Record<string, number> = {
    walking: 1.0,
    yoga: 0.8,
    cycling: 1.2,
    swimming: 1.5,
    running: 1.5,
    sports: 1.3,
    gym_strength: 1.3,
    hiit: 2.0,
  };

  const intensity = intensityMap[type] ?? 1.0;
  let base = durationMin * intensity * 4;

  if (distanceM && distanceM > 0) {
    base += distanceM * 0.01;
  }

  return Math.floor(base);
}
