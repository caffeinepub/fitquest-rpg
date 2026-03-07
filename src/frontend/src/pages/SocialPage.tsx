import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MessageCircleHeart, Plus, Share2, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../context/GameContext";

// =====================
// Types
// =====================
interface FeedPost {
  id: string;
  user: string;
  avatar: string;
  level: number;
  timestamp: string;
  activity: string;
  xpEarned: number;
  cheers: number;
  cheered: boolean;
}

// =====================
// Seed Data
// =====================
const SEED_POSTS: FeedPost[] = [
  {
    id: "post-1",
    user: "IronWolf_Kai",
    avatar: "🐺",
    level: 28,
    timestamp: "2h ago",
    activity:
      "Crushed a 60-min Strength Training session — new PR on deadlift: 180 kg! 🏋️",
    xpEarned: 480,
    cheers: 14,
    cheered: false,
  },
  {
    id: "post-2",
    user: "RunnerStar_Mia",
    avatar: "⭐",
    level: 19,
    timestamp: "4h ago",
    activity:
      "Completed a 10 km morning run in the rain — absolutely worth it 🌧️🏃",
    xpEarned: 340,
    cheers: 22,
    cheered: false,
  },
  {
    id: "post-3",
    user: "ZenWarrior_Asha",
    avatar: "🧘",
    level: 35,
    timestamp: "6h ago",
    activity:
      "Earned the Iron Will badge — 30-day streak without missing a single workout 🔥",
    xpEarned: 600,
    cheers: 51,
    cheered: false,
  },
  {
    id: "post-4",
    user: "ShadowDrake",
    avatar: "🐉",
    level: 42,
    timestamp: "Yesterday",
    activity:
      "Defeated the Cardio Boss — ran 50 km total this month. Dragon Slayer title unlocked ⚔️",
    xpEarned: 5000,
    cheers: 88,
    cheered: false,
  },
  {
    id: "post-5",
    user: "FlexQueen_Zara",
    avatar: "💪",
    level: 12,
    timestamp: "Yesterday",
    activity:
      "Hit a new personal best: 100 push-ups without stopping. Small victories add up! 🎯",
    xpEarned: 220,
    cheers: 9,
    cheered: false,
  },
  {
    id: "post-6",
    user: "NightOwlFit",
    avatar: "🦉",
    level: 7,
    timestamp: "2 days ago",
    activity:
      "Completed my first HIIT session — didn't die. Actually feel amazing 🤸",
    xpEarned: 180,
    cheers: 17,
    cheered: false,
  },
];

// Recent activities for the share dialog
const SHAREABLE_ACTIVITIES = [
  { label: "Completed a 45-min HIIT session", xp: 320 },
  { label: "Hit a new PR: 100kg squat", xp: 280 },
  { label: "Finished a 5 km run", xp: 200 },
  { label: "Completed a full-body strength session", xp: 260 },
  { label: "30-day streak milestone achieved 🔥", xp: 500 },
];

// =====================
// Post Card Component
// =====================
interface PostCardProps {
  post: FeedPost;
  index: number;
  onCheer: (id: string) => void;
}

function PostCard({ post, index, onCheer }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      data-ocid={`social.post.item.${index + 1}`}
    >
      <Card className="border-border/60 bg-card/80 hover:bg-card/90 transition-colors duration-200">
        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/20 text-xl flex-shrink-0">
                {post.avatar}
              </div>
              {/* User info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {post.user}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold level-badge text-white flex-shrink-0">
                    Lv.{post.level}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.timestamp}
                </span>
              </div>
            </div>

            {/* XP chip */}
            <Badge
              variant="outline"
              className="border-green-400/40 bg-green-400/10 text-green-300 text-xs font-bold flex-shrink-0"
            >
              <Zap className="h-3 w-3 mr-1" />+{post.xpEarned.toLocaleString()}{" "}
              XP
            </Badge>
          </div>

          {/* Activity description */}
          <p className="text-sm text-foreground/85 leading-relaxed mb-3 pl-1">
            {post.activity}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-end pt-1 border-t border-border/30">
            <button
              type="button"
              data-ocid={`social.cheer.button.${index + 1}`}
              onClick={() => onCheer(post.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                post.cheered
                  ? "text-pink-300 bg-pink-400/15 border border-pink-400/40"
                  : "text-muted-foreground hover:text-pink-300 hover:bg-pink-400/10 border border-transparent hover:border-pink-400/30",
              )}
              aria-label={`Cheer for ${post.user}`}
            >
              <MessageCircleHeart className="h-4 w-4" />
              <span>{post.cheers}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =====================
// Main Page
// =====================
export function SocialPage() {
  const { state } = useGame();
  const [posts, setPosts] = useState<FeedPost[]>(SEED_POSTS);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);

  const handleCheer = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              cheers: p.cheered ? p.cheers - 1 : p.cheers + 1,
              cheered: !p.cheered,
            }
          : p,
      ),
    );
  };

  const handleShare = () => {
    if (selectedActivity === null) return;
    const act = SHAREABLE_ACTIVITIES[selectedActivity];
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      user: "You",
      avatar: "⚔️",
      level: state.level,
      timestamp: "Just now",
      activity: act.label,
      xpEarned: act.xp,
      cheers: 0,
      cheered: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setShareOpen(false);
    setSelectedActivity(null);
    toast.success("Activity shared to the feed! 🎉");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-400" />
            Social Feed
          </h1>
          <p className="text-muted-foreground text-sm">
            See what the community is crushing
          </p>
        </div>

        {/* Share Activity Dialog */}
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 font-bold bg-violet-500/20 border border-violet-400/40 text-violet-300 hover:bg-violet-500/30 hover:text-violet-200"
              variant="outline"
              data-ocid="social.share.button"
            >
              <Plus className="h-4 w-4" />
              Share Activity
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-card border-border/60 max-w-sm"
            data-ocid="social.share.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold flex items-center gap-2">
                <Share2 className="h-4 w-4 text-violet-400" />
                Share an Activity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground mb-3">
                Pick a recent activity to share with the community:
              </p>
              {SHAREABLE_ACTIVITIES.map((act, idx) => (
                <button
                  key={act.label}
                  type="button"
                  data-ocid={`social.share.activity.toggle.${idx + 1}`}
                  onClick={() => setSelectedActivity(idx)}
                  className={cn(
                    "w-full text-left rounded-xl border p-3 text-sm transition-all duration-150",
                    selectedActivity === idx
                      ? "border-violet-400/60 bg-violet-400/15 text-foreground"
                      : "border-border/60 bg-muted/20 text-foreground/80 hover:border-violet-400/40 hover:bg-violet-400/8",
                  )}
                >
                  <span className="block leading-snug">{act.label}</span>
                  <span className="text-xs text-green-400 font-semibold mt-1 block">
                    +{act.xp} XP
                  </span>
                </button>
              ))}
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareOpen(false)}
                data-ocid="social.share.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={selectedActivity === null}
                className="font-bold bg-violet-500/20 border border-violet-400/40 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40"
                variant="outline"
                data-ocid="social.share.confirm_button"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Post to Feed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Feed */}
      <div data-ocid="social.feed.list" className="space-y-3">
        <AnimatePresence mode="popLayout">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-4"
              data-ocid="social.feed.empty_state"
            >
              <span className="text-5xl">📭</span>
              <p className="text-muted-foreground text-sm text-center">
                No posts yet — be the first to share!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareOpen(true)}
                className="border-violet-400/40 text-violet-300 hover:bg-violet-400/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share Your Activity
              </Button>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onCheer={handleCheer}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
