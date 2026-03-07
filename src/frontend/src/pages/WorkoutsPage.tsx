import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, Play, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";
import { WORKOUTS, type Workout, type WorkoutCategory } from "../data/workouts";

const CATEGORIES: { value: "all" | WorkoutCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Strength", label: "Strength" },
  { value: "Cardio", label: "Cardio" },
  { value: "Flexibility", label: "Flexibility" },
  { value: "HIIT", label: "HIIT" },
  { value: "Balance", label: "Balance" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-green-400 border-green-400/40 bg-green-400/10",
  Intermediate: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  Advanced: "text-red-400 border-red-400/40 bg-red-400/10",
};

const CATEGORY_COLORS: Record<string, string> = {
  Strength: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  Cardio: "text-green-400 border-green-400/30 bg-green-400/10",
  Flexibility: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  HIIT: "text-red-400 border-red-400/30 bg-red-400/10",
  Balance: "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

function WorkoutSheet({
  workout,
  onStart,
}: { workout: Workout; onStart: () => void }) {
  return (
    <SheetContent
      className="bg-card border-border/60 w-full sm:max-w-lg overflow-y-auto"
      data-ocid="workout.sheet"
    >
      <SheetHeader className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
            {workout.emoji}
          </div>
          <div>
            <SheetTitle className="font-display font-black text-xl text-white">
              {workout.name}
            </SheetTitle>
            <div className="flex gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn("text-xs", CATEGORY_COLORS[workout.category])}
              >
                {workout.category}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", DIFFICULTY_COLORS[workout.difficulty])}
              >
                {workout.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl bg-muted/30 border border-border/40 p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Duration</span>
          </div>
          <p className="font-bold text-foreground">{workout.duration} min</p>
        </div>
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-3">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Zap className="h-3.5 w-3.5" />
            <span className="text-xs">XP Reward</span>
          </div>
          <p className="font-bold text-primary">+{workout.xpReward} XP</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {workout.description}
      </p>

      {/* Exercise list */}
      <div className="mb-6">
        <h4 className="font-display font-bold text-sm text-foreground/80 uppercase tracking-wider mb-3">
          Exercise List
        </h4>
        <div className="space-y-2">
          {workout.exercises.map((ex, i) => (
            <div
              key={`${ex.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {ex.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {ex.sets && ex.reps
                  ? `${ex.sets}×${ex.reps}`
                  : ex.sets
                    ? `${ex.sets} sets`
                    : (ex.duration ?? "")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full font-display font-bold text-base h-12 gap-2"
        data-ocid="workout.start_button.1"
      >
        <Play className="h-5 w-5" />
        Start Workout
      </Button>
    </SheetContent>
  );
}

export function WorkoutsPage() {
  const { addXp, addCoins, logActivity } = useGame();
  const [filter, setFilter] = useState<"all" | WorkoutCategory>("all");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);

  const filtered =
    filter === "all" ? WORKOUTS : WORKOUTS.filter((w) => w.category === filter);

  const handleStartWorkout = (workout: Workout) => {
    logActivity({
      type: workout.category.toLowerCase().replace(" ", "_"),
      date: new Date().toISOString().split("T")[0],
      duration: workout.duration,
      xp: workout.xpReward,
    });
    const result = addXp(workout.xpReward);
    addCoins(Math.floor(workout.xpReward * 0.1));
    if (result.leveledUp) {
      setLevelUpLevel(result.newLevel);
      setLevelUpOpen(true);
    }
    setSheetOpen(false);
    toast.success(`"${workout.name}" complete! +${workout.xpReward} XP`);
  };

  return (
    <div className="space-y-5">
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
          Workouts
        </h1>
        <p className="text-muted-foreground text-sm">
          {WORKOUTS.length} workouts available
        </p>
      </motion.div>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as "all" | WorkoutCategory)}
      >
        <TabsList
          className="flex-wrap h-auto gap-1 bg-muted/30 border border-border/50 p-1"
          data-ocid="workout.filter.tab"
        >
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Workout grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((workout, idx) => (
          <Sheet
            key={workout.id}
            open={sheetOpen && selectedWorkout?.id === workout.id}
            onOpenChange={(open) => {
              setSheetOpen(open);
              if (!open) setSelectedWorkout(null);
            }}
          >
            <SheetTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-ocid={`workout.item.${idx + 1}`}
              >
                <Card
                  className="border-border/60 bg-card/80 hover:border-primary/40 hover:bg-card cursor-pointer transition-all duration-200 group"
                  onClick={() => {
                    setSelectedWorkout(workout);
                    setSheetOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-xl">
                        {workout.emoji}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-white mb-1 leading-tight">
                      {workout.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {workout.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs py-0",
                          CATEGORY_COLORS[workout.category],
                        )}
                      >
                        {workout.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs py-0",
                          DIFFICULTY_COLORS[workout.difficulty],
                        )}
                      >
                        {workout.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration}m
                      </span>
                      <span className="flex items-center gap-1 font-bold text-primary">
                        <Zap className="h-3 w-3" />+{workout.xpReward} XP
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </SheetTrigger>
            {selectedWorkout?.id === workout.id && (
              <WorkoutSheet
                workout={workout}
                onStart={() => handleStartWorkout(workout)}
              />
            )}
          </Sheet>
        ))}
      </div>
    </div>
  );
}
