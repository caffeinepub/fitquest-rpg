import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface LevelUpModalProps {
  open: boolean;
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ open, level, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent
            className="max-w-sm border-0 bg-transparent shadow-none p-0"
            data-ocid="levelup.dialog"
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-[oklch(0.18_0.04_295)] to-[oklch(0.10_0.02_270)] p-8 text-center card-glow-violet">
              {/* Particle stars */}
              {Array.from({ length: 8 }, (_, i) => i).map((i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 15)],
                    y: [0, -(30 + i * 20)],
                  }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 1.2 }}
                  style={{
                    left: `${20 + i * 8}%`,
                    top: "40%",
                  }}
                >
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}

              <DialogHeader>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full level-badge"
                >
                  <span className="font-display text-3xl font-black text-white">
                    {level}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DialogTitle className="font-display text-3xl font-black text-white mb-1">
                    LEVEL UP!
                  </DialogTitle>
                  <p className="text-muted-foreground">
                    You&apos;ve reached{" "}
                    <span className="font-bold text-primary">
                      Level {level}
                    </span>
                  </p>
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 space-y-2 rounded-xl bg-muted/30 p-4"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
                  Unlocked
                </p>
                {level >= 10 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <Trophy className="h-4 w-4" />
                    <span>Skill Tree Tier 2 unlocked</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Zap className="h-4 w-4" />
                  <span>+5% XP bonus for this level</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Star className="h-4 w-4" />
                  <span>New badge available in achievements</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6"
              >
                <Button
                  onClick={onClose}
                  className="w-full font-display font-bold tracking-wide bg-primary hover:bg-primary/90"
                  data-ocid="levelup.close_button"
                >
                  Continue Quest
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
