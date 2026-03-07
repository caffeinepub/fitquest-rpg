import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronRight, Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Profile, Type, Type__1 } from "../backend.d";
import { AVATAR_OPTIONS } from "../data/avatars";
import { useActor } from "../hooks/useActor";

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    displayName: "",
    age: "",
    heightCm: "",
    weightKg: "",
    fitnessGoal: "" as Type | "",
    skillLevel: "" as Type__1 | "",
    avatarChoice: 1,
  });

  const handleSubmit = async () => {
    if (!actor) return;
    if (!form.displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    if (!form.fitnessGoal || !form.skillLevel) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const profile: Profile = {
        displayName: form.displayName.trim(),
        age: BigInt(Number.parseInt(form.age) || 25),
        heightCm: BigInt(Number.parseInt(form.heightCm) || 170),
        weightKg: BigInt(Number.parseInt(form.weightKg) || 70),
        fitnessGoal: form.fitnessGoal as Type,
        skillLevel: form.skillLevel as Type__1,
        avatarChoice: BigInt(form.avatarChoice),
      };
      await actor.saveCallerUserProfile(profile);
      toast.success("Profile created! Your quest begins...");
      onComplete();
    } catch (err) {
      toast.error("Failed to save profile. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-game-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-8 card-glow-violet"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl level-badge">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-display text-2xl font-black text-white">
              Create Your Hero
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Set up your character profile
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === s ? "w-8 bg-primary" : "w-4 bg-muted/50",
                )}
              />
            ))}
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <Label
                  htmlFor="displayName"
                  className="text-foreground/80 text-sm"
                >
                  Hero Name
                </Label>
                <Input
                  id="displayName"
                  placeholder="Enter your warrior name"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, displayName: e.target.value }))
                  }
                  className="mt-1.5 bg-input/50 border-border/60 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="age" className="text-foreground/80 text-sm">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={form.age}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, age: e.target.value }))
                    }
                    className="mt-1.5 bg-input/50 border-border/60"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="height"
                    className="text-foreground/80 text-sm"
                  >
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={form.heightCm}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, heightCm: e.target.value }))
                    }
                    className="mt-1.5 bg-input/50 border-border/60"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="weight"
                    className="text-foreground/80 text-sm"
                  >
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={form.weightKg}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, weightKg: e.target.value }))
                    }
                    className="mt-1.5 bg-input/50 border-border/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-foreground/80 text-sm">
                    Fitness Goal
                  </Label>
                  <Select
                    value={form.fitnessGoal}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, fitnessGoal: v as Type }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 bg-input/50 border-border/60">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Type.loseWeight}>
                        Lose Weight
                      </SelectItem>
                      <SelectItem value={Type.gainMuscle}>
                        Gain Muscle
                      </SelectItem>
                      <SelectItem value={Type.endurance}>Endurance</SelectItem>
                      <SelectItem value={Type.general}>
                        General Fitness
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground/80 text-sm">
                    Skill Level
                  </Label>
                  <Select
                    value={form.skillLevel}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, skillLevel: v as Type__1 }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 bg-input/50 border-border/60">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Type__1.beginner}>Beginner</SelectItem>
                      <SelectItem value={Type__1.intermediate}>
                        Intermediate
                      </SelectItem>
                      <SelectItem value={Type__1.advanced}>Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={
                  !form.displayName.trim() ||
                  !form.fitnessGoal ||
                  !form.skillLevel
                }
                className="w-full font-display font-bold tracking-wide mt-2"
              >
                Choose Your Avatar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">
                Choose your warrior avatar
              </p>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    type="button"
                    key={avatar.id}
                    onClick={() =>
                      setForm((p) => ({ ...p, avatarChoice: avatar.id }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all duration-150",
                      form.avatarChoice === avatar.id
                        ? "border-primary bg-primary/15 card-glow-violet"
                        : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40",
                    )}
                  >
                    <span className="text-2xl">{avatar.emoji}</span>
                    <span className="text-xs font-medium text-foreground/70 leading-tight text-center">
                      {avatar.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-border/60"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 font-display font-bold tracking-wide"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Quest
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
