// ─── User ────────────────────────────────────────────────────────────────────

export type UserData = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

// ─── Rate Calculator ─────────────────────────────────────────────────────────

export type Platform =
  | "ig_reel"
  | "ig_post"
  | "ig_story"
  | "yt_long"
  | "yt_short";

export type Niche =
  | "finance"
  | "tech"
  | "lifestyle"
  | "food"
  | "fashion"
  | "fitness"
  | "gaming"
  | "travel"
  | "education"
  | "beauty";

export type CityTier = "metro" | "tier2" | "tier3";

export type Deliverable = "single" | "bundle" | "campaign";

export type RateInputs = {
  platform: Platform;
  niche: Niche;
  followers: number;
  engagementRate: number;
  city: CityTier;
  deliverable: Deliverable;
};

export type RateResult = {
  floorRate: number;
  midRate: number;
  premiumRate: number;
  breakdown: RateBreakdown;
};

export type RateBreakdown = {
  base: number;
  nicheMult: number;
  platformMult: number;
  cityMult: number;
  deliverableMult: number;
  erBoost: number;
};

// ─── Rate Card (saved) ───────────────────────────────────────────────────────

export type RateCard = {
  id: string;
  userId: string;
  platform: Platform;
  niche: Niche;
  followers: number;
  engagementRate: number;
  city: CityTier;
  deliverable: Deliverable;
  floorRate: number;
  midRate: number;
  premiumRate: number;
  label?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Benchmarks ──────────────────────────────────────────────────────────────

export type BenchmarkData = {
  version: string;
  nicheMults: Record<Niche, number>;
  platformMults: Record<Platform, number>;
  cityMults: Record<CityTier, number>;
  deliverableMults: Record<Deliverable, number>;
  baseCpm: number;
};

// ─── API responses ───────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
