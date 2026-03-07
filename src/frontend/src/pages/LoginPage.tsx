import { Button } from "@/components/ui/button";
import { Dumbbell, Loader2, Shield, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    { icon: Zap, label: "Level up with real workouts", color: "text-primary" },
    {
      icon: Shield,
      label: "RPG skill trees & progression",
      color: "text-green-400",
    },
    {
      icon: Trophy,
      label: "Compete on global leaderboards",
      color: "text-yellow-400",
    },
    {
      icon: Dumbbell,
      label: "Boss challenges & epic rewards",
      color: "text-boss-red",
    },
  ];

  return (
    <div className="min-h-screen bg-game-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-8 card-glow-violet"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl level-badge animate-float"
            >
              <Zap className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="font-display text-4xl font-black text-white">
              FitQuest
              <span className="text-violet-gradient"> RPG</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Transform your fitness journey into an epic adventure
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <span className="text-foreground/80">{f.label}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-12 font-display font-bold text-base tracking-wide bg-primary hover:bg-primary/90"
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Begin Your Quest
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure authentication via Internet Identity
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
