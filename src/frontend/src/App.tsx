import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { Profile } from "./backend.d";
import { AppSidebar } from "./components/Sidebar";
import { GameProvider } from "./context/GameContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ActivityPage } from "./pages/ActivityPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BossesPage } from "./pages/BossesPage";
import { CoachPage } from "./pages/CoachPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DeviceSyncPage } from "./pages/DeviceSyncPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MoodPage } from "./pages/MoodPage";
import { NutritionPage } from "./pages/NutritionPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuestsPage } from "./pages/QuestsPage";
import { ShopPage } from "./pages/ShopPage";
import { SleepPage } from "./pages/SleepPage";
import { SocialPage } from "./pages/SocialPage";
import { TeamsPage } from "./pages/TeamsPage";
import { WorkoutHistoryPage } from "./pages/WorkoutHistoryPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";

// =============
// Layout wrapper (authenticated + has profile)
// =============
function AppLayout() {
  return (
    <GameProvider>
      <div className="flex min-h-screen bg-game-mesh">
        <AppSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto pb-16">
            <Outlet />
          </div>
          <footer className="text-center pb-6 text-xs text-muted-foreground/50">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </footer>
        </main>
      </div>
    </GameProvider>
  );
}

// =============
// Router definition
// =============
const rootRoute = createRootRoute({
  component: AppRoot,
});

function AppRoot() {
  return <Outlet />;
}

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: DashboardPage,
});

const workoutsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/workouts",
  component: WorkoutsPage,
});

const activityRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/activity",
  component: ActivityPage,
});

const questsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/quests",
  component: QuestsPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/leaderboard",
  component: LeaderboardPage,
});

const shopRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/shop",
  component: ShopPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const nutritionRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/nutrition",
  component: NutritionPage,
});

const coachRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/coach",
  component: CoachPage,
});

const sleepRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/sleep",
  component: SleepPage,
});

const moodRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/mood",
  component: MoodPage,
});

const socialRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/social",
  component: SocialPage,
});

const teamsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/teams",
  component: TeamsPage,
});

const bossesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/bosses",
  component: BossesPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/history",
  component: WorkoutHistoryPage,
});

const deviceSyncRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/device-sync",
  component: DeviceSyncPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    dashboardRoute,
    workoutsRoute,
    activityRoute,
    nutritionRoute,
    coachRoute,
    sleepRoute,
    moodRoute,
    socialRoute,
    teamsRoute,
    questsRoute,
    bossesRoute,
    analyticsRoute,
    historyRoute,
    deviceSyncRoute,
    leaderboardRoute,
    shopRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// =============
// Auth Gate
// =============
function AuthGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const { data: profile, isLoading: profileLoading } = useQuery<Profile | null>(
    {
      queryKey: ["profile"],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getCallerUserProfile();
      },
      enabled: !!actor && !isFetching && !!identity,
    },
  );

  // Loading state
  if (isInitializing || isFetching || (identity && profileLoading)) {
    return (
      <div className="min-h-screen bg-game-mesh flex items-center justify-center">
        <div className="space-y-4 w-48">
          <Skeleton className="h-4 w-full bg-muted/40" />
          <Skeleton className="h-4 w-3/4 bg-muted/40" />
          <Skeleton className="h-4 w-1/2 bg-muted/40" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!identity) {
    return <LoginPage />;
  }

  // Logged in but no profile
  if (profile === null) {
    return (
      <OnboardingPage
        onComplete={() => {
          // Reload to re-query profile
          window.location.reload();
        }}
      />
    );
  }

  // Logged in + has profile → full app
  return <RouterProvider router={router} />;
}

// =============
// App entry
// =============
export default function App() {
  return (
    <>
      <AuthGate />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.022 270)",
            border: "1px solid oklch(0.26 0.022 270)",
            color: "oklch(0.97 0.01 270)",
          },
        }}
      />
    </>
  );
}
