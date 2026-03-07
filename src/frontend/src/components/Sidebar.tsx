import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart2,
  Bot,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Salad,
  Shield,
  ShoppingBag,
  Smartphone,
  Swords,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGame } from "../context/GameContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    to: "/workouts",
    label: "Workouts",
    icon: Dumbbell,
    ocid: "nav.workouts.link",
  },
  {
    to: "/activity",
    label: "Activity Log",
    icon: Activity,
    ocid: "nav.activity.link",
  },
  {
    to: "/history",
    label: "History",
    icon: Clock,
    ocid: "nav.history.link",
  },
  {
    to: "/nutrition",
    label: "Nutrition",
    icon: Salad,
    ocid: "nav.nutrition.link",
  },
  {
    to: "/coach",
    label: "AI Coach",
    icon: Bot,
    ocid: "nav.coach.link",
  },
  { to: "/sleep", label: "Sleep Tracker", icon: Moon, ocid: "nav.sleep.link" },
  {
    to: "/mood",
    label: "Mood & Wellness",
    icon: Heart,
    ocid: "nav.mood.link",
  },
  {
    to: "/social",
    label: "Social Feed",
    icon: Users,
    ocid: "nav.social.link",
  },
  {
    to: "/teams",
    label: "Team Challenges",
    icon: Shield,
    ocid: "nav.teams.link",
  },
  {
    to: "/quests",
    label: "Quests & Bosses",
    icon: Swords,
    ocid: "nav.quests.link",
  },
  {
    to: "/bosses",
    label: "Boss Battles",
    icon: Flame,
    ocid: "nav.bosses.link",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart2,
    ocid: "nav.analytics.link",
  },
  {
    to: "/device-sync",
    label: "Device Sync",
    icon: Smartphone,
    ocid: "nav.devicesync.link",
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    ocid: "nav.leaderboard.link",
  },
  {
    to: "/shop",
    label: "Reward Shop",
    icon: ShoppingBag,
    ocid: "nav.shop.link",
  },
  { to: "/profile", label: "Profile", icon: User, ocid: "nav.profile.link" },
];

export function AppSidebar() {
  const { state } = useGame();
  const { clear, identity } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const xpPercent = Math.floor((state.totalXp / state.xpToNextLevel) * 100);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl level-badge">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-black text-white leading-none">
              FitQuest
            </h1>
            <span className="text-xs text-muted-foreground font-medium tracking-wider">
              RPG
            </span>
          </div>
        </div>
      </div>

      {/* Character mini-card */}
      <div className="mx-4 mb-4 rounded-xl border border-border/60 bg-card/50 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-xl">
            {state.equippedSkin}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground truncate">
                Adventurer
              </span>
              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold level-badge text-white">
                Lv.{state.level}
              </span>
            </div>
            <div className="mt-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{state.totalXp.toLocaleString()} XP</span>
                <span>{xpPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full xp-bar-fill rounded-full transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.to === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.ocid}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "nav-link-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-primary" : "",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="truncate">
            {identity?.getPrincipal().toString().slice(0, 8)}...
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          onClick={() => clear()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card border border-border shadow-lg"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 overflow-y-auto lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
