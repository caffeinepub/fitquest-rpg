import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, Send, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";

// =====================
// Types
// =====================
interface ChatMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
}

// =====================
// Coach Response Engine
// =====================
const WORKOUT_TIPS = [
  "Progressive overload is your best friend — add 2.5% more weight or one more rep each week to keep your muscles guessing.",
  "Compound movements like squats, deadlifts, and bench press give you the most XP per minute. Build your routine around them.",
  "Rest 60-90 seconds between strength sets and 30-45 seconds between cardio intervals for optimal adaptation.",
  "Don't skip your warm-up! 5 minutes of dynamic stretching can prevent injuries that would sideline you for weeks.",
  "The best workout is the one you actually do consistently. Master the basics before chasing advanced techniques.",
];

const NUTRITION_TIPS = [
  "Time your protein intake within 30 minutes post-workout to maximize muscle protein synthesis. A 25-30g serving is the sweet spot.",
  "Carbs are your body's primary fuel source — don't fear them before a big workout session. Eat smart, not less.",
  "Hydration is a hidden performance stat. Even 2% dehydration can reduce your strength output by up to 10%.",
  "Meal prep on Sundays to stay consistent Monday through Friday. Willpower is finite — remove the decision.",
  "Focus on whole foods 80% of the time. The remaining 20% won't break your progress if the fundamentals are solid.",
];

const INJURY_TIPS = [
  "If something hurts (not 'good' muscle burn, but sharp pain), STOP immediately. Your body is sending an emergency signal.",
  "Most injuries come from overtraining. Recovery is when you actually get stronger — respect your rest days.",
  "Ice the first 48 hours after an acute injury, then switch to heat. See a professional if it persists beyond a week.",
  "Mobility work and stretching aren't just for yogis — they're armor against injury and the secret of longevity.",
  "Overtraining syndrome is real. Signs: persistent fatigue, declining performance, irritability, poor sleep. Take a deload week.",
];

const MOTIVATIONAL_MESSAGES = [
  "Remember why you started. That reason is bigger than today's tiredness.",
  "Every legendary hero had a Day 1. You're writing your story — make it one worth telling.",
  "The scoreboard doesn't lie: you show up, you get stronger. It's that simple and that hard.",
  "Champions aren't born in gyms — they're built one disciplined session at a time. You're building yours.",
  "Consistency beats intensity every single time. A 6/10 workout today destroys a 10/10 workout you skip.",
];

const PROGRESS_RESPONSES = [
  (level: number, streak: number) =>
    `Level ${level} with a ${streak}-day streak? That's not luck — that's discipline. You're in the top tier of adventurers who actually show up.`,
  (level: number, streak: number) =>
    `Your stats are looking sharp! ${streak} days straight means you've built a real habit. Level ${level} is where the gains start compounding — keep going.`,
  (level: number, _streak: number) =>
    `Honestly? Level ${level} is impressive. Most people quit before they ever reach this point. The fact you're still here means you've cracked the code.`,
];

function getCoachResponse(
  message: string,
  level: number,
  streak: number,
  fitnessGoal: string,
): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("workout") ||
    lower.includes("exercise") ||
    lower.includes("training") ||
    lower.includes("lift")
  ) {
    return WORKOUT_TIPS[Math.floor(Math.random() * WORKOUT_TIPS.length)];
  }

  if (
    lower.includes("progress") ||
    lower.includes("level") ||
    lower.includes("stat")
  ) {
    const fn =
      PROGRESS_RESPONSES[Math.floor(Math.random() * PROGRESS_RESPONSES.length)];
    return fn(level, streak);
  }

  if (
    lower.includes("eat") ||
    lower.includes("food") ||
    lower.includes("nutrition") ||
    lower.includes("diet") ||
    lower.includes("meal") ||
    lower.includes("protein") ||
    lower.includes("calori")
  ) {
    const tip =
      NUTRITION_TIPS[Math.floor(Math.random() * NUTRITION_TIPS.length)];
    const goalNote =
      fitnessGoal === "loseWeight"
        ? " For your weight loss goal, a slight calorie deficit (300-500 kcal) is the sustainable path."
        : fitnessGoal === "gainMuscle"
          ? " For muscle gain, you need a moderate surplus — aim for 200-300 kcal above maintenance."
          : fitnessGoal === "endurance"
            ? " Endurance athletes need carb-heavy fueling — especially before long sessions."
            : "";
    return tip + goalNote;
  }

  if (
    lower.includes("injur") ||
    lower.includes("hurt") ||
    lower.includes("pain") ||
    lower.includes("sore") ||
    lower.includes("ache")
  ) {
    return INJURY_TIPS[Math.floor(Math.random() * INJURY_TIPS.length)];
  }

  // Default motivational with game state context
  const base =
    MOTIVATIONAL_MESSAGES[
      Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
    ];
  return `${base}\n\nLevel ${level}, ${streak}-day streak — you're proof that the system works when you work the system. What else is on your mind?`;
}

const QUICK_PROMPTS = [
  { label: "Give me a workout tip", icon: "💪" },
  { label: "How's my progress?", icon: "📊" },
  { label: "What should I eat today?", icon: "🥗" },
  { label: "How to avoid injury?", icon: "🛡️" },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm flex-shrink-0">
        🤖
      </div>
      <div
        className="rounded-2xl rounded-bl-sm bg-card border border-border/60 px-4 py-3"
        data-ocid="coach.messages.loading_state"
      >
        <div className="flex items-center gap-1.5">
          {[
            { delay: 0, key: "dot-a" },
            { delay: 0.15, key: "dot-b" },
            { delay: 0.3, key: "dot-c" },
          ].map(({ delay, key }) => (
            <motion.div
              key={key}
              className="h-2 w-2 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================
// Main Page
// =====================
export function CoachPage() {
  const { state } = useGame();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fitnessGoalStr = typeof state === "object" ? "general" : "general";

  // Welcome message on mount — intentionally runs once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: welcome message reads initial state only once
  useEffect(() => {
    const welcome: ChatMessage = {
      id: "welcome",
      role: "coach",
      content: `Coach Rex here! I'm your personal AI fitness companion. Level ${state.level} and ${state.streakDays}-day streak? You're absolutely crushing it, warrior! ⚔️\n\nWhether you need workout tips, nutrition advice, or just a push to get moving — I've got your back. What can I help you with today?`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([welcome]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when messages or typing state change
  // biome-ignore lint/correctness/useExhaustiveDependencies: bottomRef is a stable ref, messages/isTyping are the actual triggers
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay (1–1.5s)
    const delay = 1000 + Math.random() * 500;
    setTimeout(() => {
      const responseText = getCoachResponse(
        text,
        state.level,
        state.streakDays,
        fitnessGoalStr,
      );
      const coachMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        role: "coach",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, coachMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] space-y-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
              Coach Rex
              <Bot className="h-5 w-5 text-primary" />
            </h1>
            <p className="text-muted-foreground text-sm">
              Your personal AI fitness companion • Always online
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">
                Lv.{state.level}
              </span>
            </div>
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-orange-400">
                {state.streakDays}d
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pb-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={prompt.label}
              type="button"
              data-ocid={`coach.quick_prompt.button.${idx + 1}`}
              onClick={() => sendMessage(prompt.label)}
              disabled={isTyping}
              className={cn(
                "flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150",
                "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <span>{prompt.icon}</span>
              {prompt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-2">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  data-ocid={`coach.message.item.${idx + 1}`}
                  className={cn(
                    "flex items-end gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {msg.role === "coach" && (
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm flex-shrink-0">
                      🤖
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-card border border-border/60 text-foreground",
                    )}
                  >
                    {msg.content.split("\n").map((line, i) => {
                      const lines = msg.content.split("\n");
                      return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable split of static string
                        <span key={`${msg.id}-line-${i}`}>
                          {line}
                          {i < lines.length - 1 && <br />}
                        </span>
                      );
                    })}
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        msg.role === "user"
                          ? "text-primary-foreground/60 text-right"
                          : "text-muted-foreground",
                      )}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted/60 border border-border/60 flex items-center justify-center text-sm flex-shrink-0">
                      ⚔️
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="pt-3"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/80 p-2 pl-4">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Coach Rex anything…"
            disabled={isTyping}
            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            data-ocid="coach.message.input"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-9 w-9 rounded-xl flex-shrink-0 font-bold"
            data-ocid="coach.send.primary_button"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/40 text-center mt-2">
          Coach Rex is an AI assistant. Always consult a medical professional
          for health concerns.
        </p>
      </motion.div>
    </div>
  );
}
