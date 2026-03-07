import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Apple,
  Camera,
  CheckCircle2,
  Droplets,
  Flame,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Salad,
  Scan,
  Trash2,
  Utensils,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Profile } from "../backend.d";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";

// =====================
// Types
// =====================
interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  loggedAt: string;
}

interface AiScanResult {
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

// =====================
// Macro targets by fitness goal
// =====================
const MACRO_TARGETS = {
  loseWeight: { calories: 1600, protein: 120, carbs: 150, fat: 50 },
  gainMuscle: { calories: 2800, protein: 200, carbs: 300, fat: 80 },
  endurance: { calories: 2400, protein: 160, carbs: 280, fat: 65 },
  general: { calories: 2000, protein: 150, carbs: 220, fat: 60 },
};

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  Lunch: "text-green-400 border-green-400/40 bg-green-400/10",
  Dinner: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  Snack: "text-purple-400 border-purple-400/40 bg-purple-400/10",
};

const MEAL_TYPE_EMOJI: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snack: "🍎",
};

const STORAGE_KEY = "fitquest_nutrition";
const WATER_KEY = "fitquest_water";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "text-green-400 border-green-400/40 bg-green-400/10",
  medium: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  low: "text-rose-400 border-rose-400/40 bg-rose-400/10",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High Confidence",
  medium: "Medium Confidence",
  low: "Low Confidence",
};

function getTodayKey() {
  return new Date().toDateString();
}

function loadMeals(): MealEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { date: string; meals: MealEntry[] };
    if (parsed.date !== getTodayKey()) return [];
    return parsed.meals;
  } catch {
    return [];
  }
}

function saveMeals(meals: MealEntry[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: getTodayKey(), meals }),
    );
  } catch {
    // ignore
  }
}

function loadWater(): number {
  try {
    const raw = localStorage.getItem(WATER_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { date: string; count: number };
    if (parsed.date !== getTodayKey()) return 0;
    return parsed.count;
  } catch {
    return 0;
  }
}

function saveWater(count: number) {
  try {
    localStorage.setItem(
      WATER_KEY,
      JSON.stringify({ date: getTodayKey(), count }),
    );
  } catch {
    // ignore
  }
}

// =====================
// MacroBar component
// =====================
function MacroBar({
  label,
  current,
  target,
  unit,
  color,
  icon: Icon,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const isOver = pct >= 100;
  const isNear = pct >= 90;

  const barColor = isOver ? "bg-destructive" : isNear ? "bg-amber-500" : color;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground/80">
            {label}
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-mono font-bold",
            isOver
              ? "text-destructive"
              : isNear
                ? "text-amber-400"
                : "text-muted-foreground",
          )}
        >
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full transition-colors", barColor)}
        />
      </div>
    </div>
  );
}

// =====================
// AI Calorie Scanner
// =====================
type ScannerState = "idle" | "previewing" | "scanning" | "result" | "error";

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ??
  "AIzaSyDxW4c6FyWgefYKzu7MOpkZTCvq0KhGDNU";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function analyzeImageWithGemini(
  base64Image: string,
  mimeType: string,
): Promise<AiScanResult> {
  const prompt = `You are a professional nutritionist and food analyst. Carefully analyze this food image to estimate the nutritional content.

Steps:
1. Identify every food item visible in the image
2. Estimate the portion size and volume of each item based on visual cues (plate size, utensils, packaging, etc.)
3. Calculate total calories and macros based on identified items AND their estimated quantities

Respond ONLY with valid JSON in this exact format (no markdown, no code fences, just raw JSON):
{"mealName": "string (descriptive name listing main components)", "calories": number, "protein": number, "carbs": number, "fat": number, "confidence": "low|medium|high", "notes": "string (mention identified items, portion estimates, and any assumptions)"}

All numbers must be integers. Be realistic with portion sizes. If multiple items, sum all together. If you cannot identify food, set calories to 0 and explain in notes.`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown code fences
  const jsonText = rawText.replace(/```(?:json)?\n?/g, "").trim();

  let parsed: AiScanResult;
  try {
    parsed = JSON.parse(jsonText) as AiScanResult;
  } catch {
    throw new Error("Could not parse AI response");
  }

  // Validate shape
  if (typeof parsed.calories !== "number" || !parsed.mealName) {
    throw new Error("Unexpected AI response format");
  }

  return parsed;
}

function AiCalorieScanner({
  onLogMeal,
}: {
  onLogMeal: (result: AiScanResult) => void;
}) {
  const [scannerState, setScannerState] = useState<ScannerState>("idle");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [result, setResult] = useState<AiScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const noApiKey = !GEMINI_API_KEY;

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      // Extract base64 part
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setImageMime(file.type);
      setScannerState("previewing");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleScan = async () => {
    if (!imageBase64) return;
    setScannerState("scanning");
    setErrorMsg("");

    try {
      const scanResult = await analyzeImageWithGemini(imageBase64, imageMime);
      setResult(scanResult);
      setScannerState("result");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Analysis failed. Try again.";
      setErrorMsg(msg);
      setScannerState("error");
    }
  };

  const handleReset = () => {
    setScannerState("idle");
    setImageSrc(null);
    setImageBase64("");
    setResult(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogMeal = () => {
    if (result) {
      onLogMeal(result);
      handleReset();
    }
  };

  // No API key state
  if (noApiKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/15 flex items-center justify-center">
                <Camera className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground mb-1">
                  AI Analysis Unavailable
                </h3>
                <p className="text-sm text-muted-foreground">
                  To enable AI calorie scanning, add your Gemini API key.
                </p>
              </div>
              <div className="w-full rounded-xl bg-muted/30 border border-border/60 p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-foreground/80 font-mono">
                  Setup Instructions
                </p>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>
                    Get a free API key at{" "}
                    <span className="text-primary font-mono">
                      aistudio.google.com
                    </span>
                  </li>
                  <li>
                    Add{" "}
                    <span className="font-mono text-amber-400">
                      VITE_GEMINI_API_KEY=your_key
                    </span>{" "}
                    to your environment
                  </li>
                  <li>Restart the dev server and refresh</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Scan className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-sm">
            AI Calorie Scanner
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload a food photo for instant macro analysis
          </p>
        </div>
      </div>

      {/* Dropzone / Preview / States */}
      <AnimatePresence mode="wait">
        {scannerState === "idle" && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="nutrition.scanner.upload_button"
            />

            {/* Dropzone */}
            <button
              type="button"
              data-ocid="nutrition.scanner.dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "w-full rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 py-12 px-6 cursor-pointer group",
                isDragOver
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-border/60 bg-card/40 hover:border-primary/60 hover:bg-primary/5",
              )}
              aria-label="Upload food photo for AI calorie analysis"
            >
              <motion.div
                animate={
                  isDragOver
                    ? { scale: 1.15, rotate: 5 }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ type: "spring", stiffness: 300 }}
                className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              >
                <ImagePlus className="h-7 w-7 text-primary" />
              </motion.div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground/90">
                  {isDragOver ? "Drop your photo here!" : "Upload a food photo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to browse · JPG, PNG, WebP
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <Zap className="h-3 w-3 text-primary" />
                <span>Powered by Google Gemini Vision AI</span>
              </div>
            </button>
          </motion.div>
        )}

        {(scannerState === "previewing" || scannerState === "scanning") &&
          imageSrc && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Image preview with scan overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-black">
                <img
                  src={imageSrc}
                  alt="Food preview"
                  className="w-full max-h-64 object-cover"
                />

                {/* Scanning animation overlay */}
                {scannerState === "scanning" && (
                  <div
                    data-ocid="nutrition.scanner.loading_state"
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3"
                  >
                    {/* Scan line */}
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: ["5%", "95%", "5%"] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: "2px",
                      }}
                      className="bg-primary shadow-[0_0_12px_2px_oklch(0.67_0.22_295)]"
                    />
                    {/* Corner brackets */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-sm" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-sm" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-sm" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-sm" />

                    <div className="relative z-10 flex flex-col items-center gap-2 bg-black/60 px-5 py-3 rounded-xl border border-primary/30">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-xs font-semibold text-primary font-mono">
                        Analyzing nutrition data...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {scannerState === "previewing" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border/60"
                    onClick={handleReset}
                    data-ocid="nutrition.scanner.reset_button"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Change Photo
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 flex-1 font-bold"
                    onClick={handleScan}
                    data-ocid="nutrition.scanner.scan_button"
                  >
                    <Scan className="h-3.5 w-3.5" />
                    Scan Calories
                  </Button>
                </div>
              )}

              {scannerState === "scanning" && (
                <Button
                  size="sm"
                  disabled
                  className="w-full gap-2 font-bold"
                  data-ocid="nutrition.scanner.scan_button"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing...
                </Button>
              )}
            </motion.div>
          )}

        {scannerState === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
            data-ocid="nutrition.scanner.result.card"
          >
            {/* Result card */}
            <Card className="border-primary/30 bg-primary/5 card-glow-violet overflow-hidden">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-xp-green flex-shrink-0" />
                    <CardTitle className="font-display text-base font-bold text-foreground leading-tight">
                      {result.mealName}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] flex-shrink-0 font-mono",
                      CONFIDENCE_COLORS[result.confidence],
                    )}
                  >
                    {CONFIDENCE_LABELS[result.confidence]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                {/* Calorie highlight */}
                <div className="flex items-center justify-center py-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="text-center">
                    <div className="font-display text-3xl font-black text-primary">
                      {result.calories}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      kcal estimated
                    </div>
                  </div>
                </div>

                {/* Macro breakdown */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                    <div className="text-base font-bold font-mono text-blue-400">
                      {result.protein}g
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Protein
                    </div>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                    <div className="text-base font-bold font-mono text-amber-400">
                      {result.carbs}g
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Carbs
                    </div>
                  </div>
                  <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-3 text-center">
                    <div className="text-base font-bold font-mono text-pink-400">
                      {result.fat}g
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Fat
                    </div>
                  </div>
                </div>

                {/* Notes / disclaimer */}
                {result.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
                    💡 {result.notes}
                  </p>
                )}

                <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                  AI estimates may vary ±20%. Use as a nutritional guide, not a
                  medical reference.
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/60"
                onClick={handleReset}
                data-ocid="nutrition.scanner.reset_button"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Scan Another
              </Button>
              <Button
                size="sm"
                className="gap-2 flex-1 font-bold"
                onClick={handleLogMeal}
                data-ocid="nutrition.scanner.log_meal.primary_button"
              >
                <Plus className="h-3.5 w-3.5" />
                Log This Meal
              </Button>
            </div>
          </motion.div>
        )}

        {scannerState === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
            data-ocid="nutrition.scanner.error_state"
          >
            {imageSrc && (
              <div className="rounded-2xl overflow-hidden border border-destructive/30">
                <img
                  src={imageSrc}
                  alt="Food preview"
                  className="w-full max-h-40 object-cover opacity-50"
                />
              </div>
            )}

            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">
                      Scan Failed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {errorMsg ||
                        "Could not identify food in this image. Try a clearer photo with good lighting."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-border/60"
                onClick={handleReset}
                data-ocid="nutrition.scanner.reset_button"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Try Different Photo
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleScan}
                data-ocid="nutrition.scanner.scan_button"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================
// Main Page
// =====================
export function NutritionPage() {
  const { state, addXp, addCoins, completeQuest } = useGame();
  const { actor, isFetching } = useActor();

  const [meals, setMeals] = useState<MealEntry[]>(loadMeals);
  const [waterGlasses, setWaterGlasses] = useState<number>(loadWater);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);
  const [activeTab, setActiveTab] = useState("manual-log");

  // Form state
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");
  const [mealType, setMealType] = useState<
    "Breakfast" | "Lunch" | "Dinner" | "Snack"
  >("Breakfast");

  // Fetch user profile for macro targets
  const { data: profile } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const fitnessGoal = (profile?.fitnessGoal as string) ?? "general";
  const targets =
    MACRO_TARGETS[fitnessGoal as keyof typeof MACRO_TARGETS] ??
    MACRO_TARGETS.general;

  // Persist meals
  useEffect(() => {
    saveMeals(meals);

    // Auto-complete logMeals quest if 3+ meals logged
    if (meals.length >= 3) {
      const logMealsQuest = state.dailyQuests.find(
        (q) => q.id === "logMeals" && !q.completed,
      );
      if (logMealsQuest) {
        completeQuest("logMeals");
        const result = addXp(120);
        addCoins(10);
        if (result.leveledUp) {
          setLevelUpLevel(result.newLevel);
          setLevelUpOpen(true);
        }
        toast.success("Quest complete! Fuel Master — +120 XP, +10 🪙");
      }
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: stable game callbacks
  }, [meals, state.dailyQuests, addXp, addCoins, completeQuest]);

  // Persist water
  useEffect(() => {
    saveWater(waterGlasses);
  }, [waterGlasses]);

  // Totals
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const handleAddMeal = () => {
    if (!mealName || !mealCalories) return;
    const entry: MealEntry = {
      id: `${Date.now()}-${Math.random()}`,
      name: mealName,
      calories: Number(mealCalories) || 0,
      protein: Number(mealProtein) || 0,
      carbs: Number(mealCarbs) || 0,
      fat: Number(mealFat) || 0,
      mealType,
      loggedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMeals((prev) => [...prev, entry]);
    toast.success(`${mealType} logged! ${entry.calories} kcal added.`);
    setMealName("");
    setMealCalories("");
    setMealProtein("");
    setMealCarbs("");
    setMealFat("");
    setMealType("Breakfast");
    setDialogOpen(false);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleWater = (idx: number) => {
    setWaterGlasses((prev) => {
      // Toggle: if clicking filled glass, unfill from that point; if clicking empty, fill up to that point
      const newCount = idx < prev ? idx : idx + 1;
      return newCount;
    });
  };

  // Handle AI scan result → log as meal
  const handleLogAiMeal = useCallback((aiResult: AiScanResult) => {
    // Determine meal type from time of day
    const hour = new Date().getHours();
    let autoMealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" = "Snack";
    if (hour >= 5 && hour < 11) autoMealType = "Breakfast";
    else if (hour >= 11 && hour < 15) autoMealType = "Lunch";
    else if (hour >= 17 && hour < 22) autoMealType = "Dinner";

    const entry: MealEntry = {
      id: `ai-${Date.now()}-${Math.random()}`,
      name: aiResult.mealName,
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
      mealType: autoMealType,
      loggedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMeals((prev) => [...prev, entry]);
    toast.success(
      `📸 AI scanned: ${entry.name} — ${entry.calories} kcal logged!`,
    );
    // Switch to manual log tab so user sees the newly added meal
    setActiveTab("manual-log");
  }, []);

  return (
    <div className="space-y-6">
      <LevelUpModal
        open={levelUpOpen}
        level={levelUpLevel}
        onClose={() => setLevelUpOpen(false)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
            <Salad className="h-6 w-6 text-primary" />
            Nutrition HUD
          </h1>
          <p className="text-muted-foreground text-sm">
            Fuel your adventure — track macros and hydration
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 font-bold"
              data-ocid="nutrition.add_meal.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Log Meal
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-card border-border/60 max-w-sm"
            data-ocid="nutrition.meal.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold flex items-center gap-2">
                <Utensils className="h-4 w-4 text-primary" />
                Log a Meal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-sm text-foreground/80">Meal Name</Label>
                <Input
                  placeholder="e.g. Grilled chicken & rice"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="mt-1.5 bg-input/50 border-border/60"
                  data-ocid="nutrition.meal.name.input"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground/80">Meal Type</Label>
                <Select
                  value={mealType}
                  onValueChange={(v) =>
                    setMealType(v as "Breakfast" | "Lunch" | "Dinner" | "Snack")
                  }
                >
                  <SelectTrigger
                    className="mt-1.5 bg-input/50 border-border/60"
                    data-ocid="nutrition.meal.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="Lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="Dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="Snack">🍎 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-foreground/80">
                  Calories (kcal)
                </Label>
                <Input
                  type="number"
                  placeholder="400"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  className="mt-1.5 bg-input/50 border-border/60"
                  data-ocid="nutrition.meal.calories.input"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-foreground/80">
                    Protein (g)
                  </Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="mt-1.5 bg-input/50 border-border/60 text-sm"
                    data-ocid="nutrition.meal.protein.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-foreground/80">
                    Carbs (g)
                  </Label>
                  <Input
                    type="number"
                    placeholder="45"
                    value={mealCarbs}
                    onChange={(e) => setMealCarbs(e.target.value)}
                    className="mt-1.5 bg-input/50 border-border/60 text-sm"
                    data-ocid="nutrition.meal.carbs.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-foreground/80">Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={mealFat}
                    onChange={(e) => setMealFat(e.target.value)}
                    className="mt-1.5 bg-input/50 border-border/60 text-sm"
                    data-ocid="nutrition.meal.fat.input"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddMeal}
                disabled={!mealName || !mealCalories}
                className="w-full font-bold"
                data-ocid="nutrition.meal.submit_button"
              >
                <Zap className="h-4 w-4 mr-2" />
                Add to Today's Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Macro Summary — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-border/60 bg-card/80 card-glow-violet">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Today's Macro HUD
              <Badge
                variant="outline"
                className="text-xs border-primary/40 text-primary ml-auto font-mono"
              >
                Goal:{" "}
                {fitnessGoal === "loseWeight"
                  ? "Lose Weight"
                  : fitnessGoal === "gainMuscle"
                    ? "Gain Muscle"
                    : fitnessGoal === "endurance"
                      ? "Endurance"
                      : "General"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroBar
              label="Calories"
              current={totals.calories}
              target={targets.calories}
              unit="kcal"
              color="bg-primary"
              icon={Flame}
            />
            <MacroBar
              label="Protein"
              current={totals.protein}
              target={targets.protein}
              unit="g"
              color="bg-blue-500"
              icon={Zap}
            />
            <MacroBar
              label="Carbs"
              current={totals.carbs}
              target={targets.carbs}
              unit="g"
              color="bg-amber-500"
              icon={Apple}
            />
            <MacroBar
              label="Fat"
              current={totals.fat}
              target={targets.fat}
              unit="g"
              color="bg-pink-500"
              icon={Droplets}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Water Tracker — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              Hydration Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Daily goal: 8 glasses
              </p>
              <span
                className={cn(
                  "text-sm font-bold font-mono",
                  waterGlasses >= 8 ? "text-blue-400" : "text-muted-foreground",
                )}
              >
                {waterGlasses} / 8 glasses
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((glassNum) => (
                <button
                  key={glassNum}
                  type="button"
                  data-ocid={`nutrition.water.toggle.${glassNum}`}
                  onClick={() => toggleWater(glassNum - 1)}
                  className={cn(
                    "relative h-10 w-8 rounded-lg border-2 transition-all duration-200 overflow-hidden",
                    glassNum - 1 < waterGlasses
                      ? "border-blue-400 bg-blue-400/20"
                      : "border-border/60 bg-muted/20 hover:border-blue-400/50 hover:bg-blue-400/10",
                  )}
                  aria-label={`Glass ${glassNum} of water`}
                >
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 transition-all duration-300",
                      glassNum - 1 < waterGlasses
                        ? "h-3/4 bg-blue-400/40"
                        : "h-0",
                    )}
                  />
                  <span className="relative text-xs">
                    {glassNum - 1 < waterGlasses ? "💧" : "🥛"}
                  </span>
                </button>
              ))}
            </div>
            {waterGlasses >= 8 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs text-blue-400 font-semibold flex items-center gap-1.5"
              >
                <Droplets className="h-3.5 w-3.5" />
                Hydration goal complete! You're a true water warrior 🏆
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabbed section: Manual Log + AI Scanner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 bg-card/60 border border-border/60 p-1 h-auto rounded-xl mb-4">
            <TabsTrigger
              value="manual-log"
              data-ocid="nutrition.tab.manual_log"
              className="rounded-lg gap-2 text-sm font-semibold py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Utensils className="h-3.5 w-3.5" />
              Manual Log
            </TabsTrigger>
            <TabsTrigger
              value="ai-scanner"
              data-ocid="nutrition.tab.ai_scanner"
              className="rounded-lg gap-2 text-sm font-semibold py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Camera className="h-3.5 w-3.5" />
              AI Scanner
              <Badge className="ml-1 px-1.5 py-0 text-[9px] font-bold bg-primary/30 text-primary border-0 h-4">
                NEW
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Manual Log Tab */}
          <TabsContent value="manual-log" className="mt-0">
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Today's Meals
                  <Badge
                    variant="outline"
                    className="text-xs border-border/60 text-muted-foreground ml-auto"
                  >
                    {meals.length} logged
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <div
                    className="text-center py-10 space-y-3"
                    data-ocid="nutrition.meals.empty_state"
                  >
                    <div className="text-4xl">🥗</div>
                    <p className="text-muted-foreground text-sm">
                      No meals logged today. Start fueling your quest!
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Log 3 meals to complete the Fuel Master daily quest
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {meals.map((meal, idx) => (
                        <motion.div
                          key={meal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          data-ocid={`nutrition.meal.item.${idx + 1}`}
                          className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="text-2xl flex-shrink-0 mt-0.5">
                            {MEAL_TYPE_EMOJI[meal.mealType]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-semibold text-foreground truncate">
                                {meal.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs flex-shrink-0",
                                  MEAL_TYPE_COLORS[meal.mealType],
                                )}
                              >
                                {meal.mealType}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                                {meal.loggedAt}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span className="font-bold text-foreground/80">
                                {meal.calories} kcal
                              </span>
                              {meal.protein > 0 && (
                                <span className="text-blue-400">
                                  P: {meal.protein}g
                                </span>
                              )}
                              {meal.carbs > 0 && (
                                <span className="text-amber-400">
                                  C: {meal.carbs}g
                                </span>
                              )}
                              {meal.fat > 0 && (
                                <span className="text-pink-400">
                                  F: {meal.fat}g
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            data-ocid={`nutrition.meal.delete_button.${idx + 1}`}
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                            aria-label={`Delete ${meal.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Scanner Tab */}
          <TabsContent value="ai-scanner" className="mt-0">
            <Card className="border-border/60 bg-card/80">
              <CardContent className="pt-5 pb-5">
                <AiCalorieScanner onLogMeal={handleLogAiMeal} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* XP from quests nudge */}
      {meals.length < 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <Zap className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm text-primary/90">
            Log{" "}
            <span className="font-bold">
              {3 - meals.length} more meal{3 - meals.length !== 1 ? "s" : ""}
            </span>{" "}
            to complete the <span className="font-bold">Fuel Master</span> quest
            and earn +120 XP!
          </p>
        </motion.div>
      )}
    </div>
  );
}
