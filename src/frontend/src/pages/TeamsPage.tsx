import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Coins,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../context/GameContext";

// =====================
// Types
// =====================
interface Challenge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  daysLeft: number;
  xpReward: number;
  coinReward: number;
  memberCount: number;
  joined: boolean;
  contribution: number; // user's contribution
}

interface Teammate {
  id: string;
  name: string;
  avatar: string;
  level: number;
  contribution: number;
  target: number;
  unit: string;
}

// =====================
// Seed Data
// =====================
const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    name: "Marathon Crew",
    emoji: "🏃",
    description: "Run a combined 200 km as a team this month",
    currentValue: 134,
    targetValue: 200,
    unit: "km",
    daysLeft: 12,
    xpReward: 2000,
    coinReward: 150,
    memberCount: 24,
    joined: false,
    contribution: 0,
  },
  {
    id: "c2",
    name: "Iron Squad",
    emoji: "💪",
    description: "Log 300 combined strength sessions in 45 days",
    currentValue: 187,
    targetValue: 300,
    unit: "sessions",
    daysLeft: 20,
    xpReward: 3000,
    coinReward: 200,
    memberCount: 18,
    joined: false,
    contribution: 0,
  },
  {
    id: "c3",
    name: "Zen Masters",
    emoji: "🧘",
    description: "Complete 100 mindfulness or yoga sessions together",
    currentValue: 62,
    targetValue: 100,
    unit: "sessions",
    daysLeft: 8,
    xpReward: 1500,
    coinReward: 100,
    memberCount: 31,
    joined: false,
    contribution: 0,
  },
  {
    id: "c4",
    name: "Step Storm",
    emoji: "👟",
    description: "Hit 1,000,000 combined steps before the deadline",
    currentValue: 647000,
    targetValue: 1000000,
    unit: "steps",
    daysLeft: 5,
    xpReward: 2500,
    coinReward: 175,
    memberCount: 45,
    joined: false,
    contribution: 0,
  },
];

const MOCK_TEAMMATES: Teammate[] = [
  {
    id: "t1",
    name: "IronWolf_Kai",
    avatar: "🐺",
    level: 28,
    contribution: 18,
    target: 20,
    unit: "km",
  },
  {
    id: "t2",
    name: "RunnerStar_Mia",
    avatar: "⭐",
    level: 19,
    contribution: 24,
    target: 20,
    unit: "km",
  },
  {
    id: "t3",
    name: "ShadowDrake",
    avatar: "🐉",
    level: 42,
    contribution: 31,
    target: 20,
    unit: "km",
  },
  {
    id: "t4",
    name: "FlexQueen_Zara",
    avatar: "💪",
    level: 12,
    contribution: 11,
    target: 20,
    unit: "km",
  },
  {
    id: "t5",
    name: "ZenWarrior_Asha",
    avatar: "🧘",
    level: 35,
    contribution: 22,
    target: 20,
    unit: "km",
  },
];

// =====================
// Challenge Card
// =====================
interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  onJoin: (id: string) => void;
  onContribute: (id: string) => void;
}

function ChallengeCard({
  challenge,
  index,
  onJoin,
  onContribute,
}: ChallengeCardProps) {
  const progressPct = Math.min(
    Math.round((challenge.currentValue / challenge.targetValue) * 100),
    100,
  );

  const formatValue = (v: number, unit: string) => {
    if (unit === "steps" && v >= 1000)
      return `${(v / 1000).toFixed(0)}k ${unit}`;
    return `${v.toLocaleString()} ${unit}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      data-ocid={`teams.challenge.item.${index + 1}`}
    >
      <Card
        className={cn(
          "border-border/60 bg-card/80 transition-all duration-200",
          challenge.joined && "border-violet-400/30 bg-violet-400/5",
        )}
      >
        <CardContent className="p-4">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{challenge.emoji}</span>
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  {challenge.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {challenge.description}
                </p>
              </div>
            </div>
            {challenge.joined && (
              <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Team Progress</span>
              <span className="font-semibold text-foreground/80">
                {formatValue(challenge.currentValue, challenge.unit)} /{" "}
                {formatValue(challenge.targetValue, challenge.unit)}
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-muted/40" />
            <div className="text-right text-xs text-violet-300 font-semibold mt-1">
              {progressPct}%
            </div>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className="border-orange-400/40 text-orange-300 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {challenge.daysLeft} days left
            </Badge>
            <Badge
              variant="outline"
              className="border-green-400/40 text-green-300 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              {challenge.xpReward.toLocaleString()} XP
            </Badge>
            <Badge
              variant="outline"
              className="border-yellow-400/40 text-yellow-300 text-xs"
            >
              <Coins className="h-3 w-3 mr-1" />
              {challenge.coinReward} coins
            </Badge>
            <Badge
              variant="outline"
              className="border-border/60 text-muted-foreground text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              {challenge.memberCount} members
            </Badge>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-border/30">
            {challenge.joined ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-violet-300">
                  Your contribution:{" "}
                  <strong>
                    {formatValue(challenge.contribution, challenge.unit)}
                  </strong>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onContribute(challenge.id)}
                  className="border-violet-400/40 text-violet-300 hover:bg-violet-400/15 text-xs font-bold"
                  data-ocid={`teams.contribute.button.${index + 1}`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Log Progress
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onJoin(challenge.id)}
                className="w-full border-violet-400/40 text-violet-300 hover:bg-violet-400/15 font-bold text-xs"
                data-ocid={`teams.join.button.${index + 1}`}
              >
                <Shield className="h-3 w-3 mr-1.5" />
                Join Challenge
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =====================
// Teammate Row
// =====================
interface TeammateRowProps {
  teammate: Teammate;
  index: number;
}

function TeammateRow({ teammate, index }: TeammateRowProps) {
  const pct = Math.min(
    Math.round((teammate.contribution / teammate.target) * 100),
    100,
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      data-ocid={`teams.teammate.item.${index + 1}`}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 border border-primary/20 text-lg flex-shrink-0">
        {teammate.avatar}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground truncate">
            {teammate.name}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold level-badge text-white flex-shrink-0">
            Lv.{teammate.level}
          </span>
        </div>
        <Progress value={pct} className="h-1.5 bg-muted/40" />
      </div>
      {/* Contribution */}
      <div className="text-right flex-shrink-0">
        <span className="text-xs font-semibold text-foreground/80">
          {teammate.contribution}/{teammate.target}
        </span>
        <span className="block text-xs text-muted-foreground">
          {teammate.unit}
        </span>
      </div>
    </motion.div>
  );
}

// =====================
// Main Page
// =====================
export function TeamsPage() {
  const { addXp } = useGame();
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [activeTab, setActiveTab] = useState("active");

  const joinedChallenges = challenges.filter((c) => c.joined);
  const firstJoined = joinedChallenges[0] ?? null;

  const handleJoin = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: true } : c)),
    );
    setActiveTab("myteam");
    toast.success("You joined the challenge! Good luck, warrior 🛡️");
  };

  const handleContribute = (id: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) return;

    const unitMap: Record<string, number> = {
      km: 2,
      sessions: 1,
      steps: 5000,
    };
    const increment = unitMap[challenge.unit] ?? 1;

    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              currentValue: Math.min(c.currentValue + increment, c.targetValue),
              contribution: c.contribution + increment,
            }
          : c,
      ),
    );

    const xpGained = 150;
    addXp(xpGained);
    toast.success(`Progress logged! +${xpGained} XP 💪`);
  };

  // Combined stats for joined challenges
  const totalTeamProgress =
    firstJoined !== null
      ? Math.round((firstJoined.currentValue / firstJoined.targetValue) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-violet-400" />
          Team Challenges
        </h1>
        <p className="text-muted-foreground text-sm">
          Join a crew, conquer together
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-muted/30 border border-border/40">
          <TabsTrigger
            value="active"
            className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground"
            data-ocid="teams.tab"
          >
            <Shield className="h-4 w-4 mr-2" />
            Active Challenges
          </TabsTrigger>
          <TabsTrigger
            value="myteam"
            className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground"
            data-ocid="teams.tab"
          >
            <Users className="h-4 w-4 mr-2" />
            My Team
            {joinedChallenges.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-400/30 text-violet-300 text-xs font-bold">
                {joinedChallenges.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active Challenges Tab */}
        <TabsContent value="active" className="mt-4 space-y-3">
          {challenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              index={index}
              onJoin={handleJoin}
              onContribute={handleContribute}
            />
          ))}
        </TabsContent>

        {/* My Team Tab */}
        <TabsContent value="myteam" className="mt-4 space-y-4">
          <AnimatePresence mode="wait">
            {joinedChallenges.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
                data-ocid="teams.myteam.empty_state"
              >
                <span className="text-5xl">🛡️</span>
                <p className="text-muted-foreground text-sm text-center">
                  You haven't joined any challenges yet
                </p>
                <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
                  Find a challenge that suits your goals and join your crew
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("active")}
                  className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10"
                  data-ocid="teams.browse.button"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Browse Challenges
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="team"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Overall team progress card */}
                {firstJoined && (
                  <Card className="border-violet-400/30 bg-violet-400/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                        <span className="text-xl">{firstJoined.emoji}</span>
                        {firstJoined.name}
                        <Badge
                          variant="outline"
                          className="ml-auto border-violet-400/40 text-violet-300 text-xs"
                        >
                          Active
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {firstJoined.description}
                      </p>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">
                            Team Progress
                          </span>
                          <span className="font-semibold text-violet-300">
                            {totalTeamProgress}%
                          </span>
                        </div>
                        <Progress
                          value={totalTeamProgress}
                          className="h-2.5 bg-muted/40"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <Badge
                          variant="outline"
                          className="border-orange-400/40 text-orange-300 text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {firstJoined.daysLeft} days left
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-green-400/40 text-green-300 text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {firstJoined.xpReward.toLocaleString()} XP reward
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Teammates list */}
                <Card className="border-border/60 bg-card/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-violet-400" />
                      Your Squad
                      <Badge
                        variant="outline"
                        className="ml-auto border-border/60 text-muted-foreground text-xs"
                      >
                        {MOCK_TEAMMATES.length + 1} members
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* User row */}
                    <div
                      className="flex items-center gap-3 rounded-xl border border-violet-400/30 bg-violet-400/8 p-3"
                      data-ocid="teams.teammate.item.1"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 border border-violet-400/40 text-lg flex-shrink-0">
                        ⚔️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-violet-300 truncate">
                            You
                          </span>
                          <span className="text-xs text-violet-400/70 font-medium">
                            (that's you!)
                          </span>
                        </div>
                        <Progress
                          value={
                            firstJoined
                              ? Math.min(
                                  Math.round(
                                    (firstJoined.contribution / 20) * 100,
                                  ),
                                  100,
                                )
                              : 0
                          }
                          className="h-1.5 bg-muted/40"
                        />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-semibold text-violet-300">
                          {firstJoined?.contribution ?? 0}/20
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {firstJoined?.unit ?? "units"}
                        </span>
                      </div>
                    </div>

                    {MOCK_TEAMMATES.map((teammate, idx) => (
                      <TeammateRow
                        key={teammate.id}
                        teammate={teammate}
                        index={idx + 1}
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Other joined challenges */}
                {joinedChallenges.length > 1 && (
                  <Card className="border-border/60 bg-card/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-violet-400" />
                        More Active Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {joinedChallenges.slice(1).map((challenge, index) => (
                        <div
                          key={challenge.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
                          data-ocid={`teams.challenge.item.${index + 2}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{challenge.emoji}</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {challenge.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {challenge.daysLeft} days left
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContribute(challenge.id)}
                            className="border-violet-400/40 text-violet-300 hover:bg-violet-400/15 text-xs"
                            data-ocid={`teams.contribute.button.${index + 2}`}
                          >
                            Log
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
