import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle, Rocket, ShoppingBag, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../context/GameContext";
import { SHOP_ITEMS } from "../data/shop";

const RARITY_STYLES = {
  common: {
    card: "border-border/60 bg-card/80",
    badge: "text-gray-400 border-gray-400/40 bg-gray-400/10",
    label: "Common",
  },
  rare: {
    card: "border-primary/30 bg-card/80",
    badge: "text-primary border-primary/40 bg-primary/10",
    label: "Rare",
  },
  legendary: {
    card: "border-legendary/40 bg-card/80 card-glow-legendary",
    badge: "text-legendary border-legendary/40 bg-legendary/10",
    label: "Legendary",
  },
};

export function ShopPage() {
  const {
    state,
    spendCoins,
    addToInventory,
    activateXpBooster,
    equipSkin,
    activateRankBoost,
  } = useGame();
  const [activeTab, setActiveTab] = useState<"skins" | "gear" | "boosters">(
    "skins",
  );

  const handleBuy = (itemId: string, cost: number, name: string) => {
    if (state.inventory.includes(itemId)) return;
    if (state.coins < cost) {
      toast.error(`Not enough coins! Need ${cost - state.coins} more`);
      return;
    }
    const success = spendCoins(cost);
    if (success) {
      addToInventory(itemId);
      if (itemId === "booster_xp_24h") activateXpBooster();
      if (itemId === "booster_rank_boost_48h") activateRankBoost();
      toast.success(`"${name}" purchased!`);
    }
  };

  const ownedItems = SHOP_ITEMS.filter((item) =>
    state.inventory.includes(item.id),
  );

  // Track equip button index for data-ocid
  let equipButtonCount = 0;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-black text-white">
            Reward Shop
          </h1>
          <p className="text-muted-foreground text-sm">
            Spend your hard-earned coins on epic rewards
          </p>
        </div>
        {/* Coin balance */}
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
          <span className="text-xl">🪙</span>
          <span className="font-display font-black text-xl text-yellow-400">
            {state.coins.toLocaleString()}
          </span>
        </div>
      </motion.div>

      {/* Active booster banners */}
      <div className="space-y-2">
        {state.xpBoosterActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 flex items-center gap-3 pulse-glow"
          >
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-primary">
                XP Booster Active!
              </p>
              <p className="text-xs text-muted-foreground">
                Earning 1.5× XP on all activities
              </p>
            </div>
          </motion.div>
        )}
        {state.rankBoostActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-legendary/40 bg-legendary/10 px-4 py-3 flex items-center gap-3 pulse-glow"
          >
            <Rocket className="h-5 w-5 text-legendary" />
            <div>
              <p className="text-sm font-bold text-legendary">
                Rank Boost Active!
              </p>
              <p className="text-xs text-muted-foreground">
                Earning 2× weekly XP to climb the leaderboard
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "skins" | "gear" | "boosters")
          }
        >
          <TabsList className="bg-muted/30 border border-border/50 mb-5">
            <TabsTrigger
              value="skins"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
              data-ocid="shop.skins.tab"
            >
              🎭 Skins
            </TabsTrigger>
            <TabsTrigger
              value="gear"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
              data-ocid="shop.gear.tab"
            >
              ⚔️ Gear
            </TabsTrigger>
            <TabsTrigger
              value="boosters"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
              data-ocid="shop.boosters.tab"
            >
              ⚗️ Boosters
            </TabsTrigger>
          </TabsList>

          {(["skins", "gear", "boosters"] as const).map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {SHOP_ITEMS.filter((item) => item.category === cat).map(
                  (item, idx) => {
                    const owned = state.inventory.includes(item.id);
                    const styles = RARITY_STYLES[item.rarity];
                    const canAfford = state.coins >= item.cost;
                    const isEquipped =
                      item.category === "skins" &&
                      state.equippedSkin === item.emoji;

                    // Only count equip buttons for skins that are owned but not equipped
                    let equipOcid: string | undefined;
                    if (owned && item.category === "skins" && !isEquipped) {
                      equipButtonCount++;
                      if (equipButtonCount === 1) {
                        equipOcid = "shop.equip_button.1";
                      }
                    }

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        data-ocid={`shop.item.${idx + 1}`}
                      >
                        <Card
                          className={cn(
                            "border transition-all duration-200 h-full",
                            styles.card,
                            item.rarity === "legendary" && "animate-float",
                            isEquipped && "ring-2 ring-green-500/50",
                          )}
                        >
                          <CardContent className="p-4 flex flex-col h-full">
                            {/* Item icon */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30 text-3xl">
                                {item.emoji}
                              </div>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", styles.badge)}
                              >
                                {styles.label}
                              </Badge>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <h3
                                className={cn(
                                  "font-display font-bold text-sm mb-1",
                                  item.rarity === "legendary"
                                    ? "legendary-shimmer"
                                    : "text-white",
                                )}
                              >
                                {item.name}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            {/* Price & buy */}
                            <div className="mt-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-base">🪙</span>
                                <span className="font-bold text-yellow-400">
                                  {item.cost.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  coins
                                </span>
                              </div>
                              {owned ? (
                                item.category === "skins" ? (
                                  isEquipped ? (
                                    // Currently equipped — glowing equipped badge
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled
                                      className="w-full h-8 text-xs border-green-500/60 text-green-400 bg-green-500/10"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                      Equipped
                                    </Button>
                                  ) : (
                                    // Owned but not equipped — show Equip button
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full h-8 text-xs border-primary/50 text-primary hover:bg-primary/10 font-bold"
                                      onClick={() => equipSkin(item.emoji)}
                                      data-ocid={equipOcid}
                                    >
                                      ✨ Equip
                                    </Button>
                                  )
                                ) : (
                                  // Non-skin owned item
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="w-full h-8 text-xs border-green-500/40 text-green-400"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Owned
                                  </Button>
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  className={cn(
                                    "w-full h-8 text-xs font-bold",
                                    !canAfford &&
                                      "opacity-50 cursor-not-allowed",
                                  )}
                                  onClick={() =>
                                    handleBuy(item.id, item.cost, item.name)
                                  }
                                  disabled={!canAfford}
                                  data-ocid={
                                    idx === 0 ? "shop.buy_button.1" : undefined
                                  }
                                >
                                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                  Buy
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  },
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Inventory */}
      {ownedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/60 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                My Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {ownedItems.map((item) => {
                  const isEquipped =
                    item.category === "skins" &&
                    state.equippedSkin === item.emoji;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 transition-all",
                        isEquipped
                          ? "border-green-500/50 bg-green-500/15 ring-1 ring-green-500/30"
                          : "border-green-500/30 bg-green-500/10",
                      )}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-green-400">
                          {isEquipped ? "✓ Equipped" : "Owned"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
