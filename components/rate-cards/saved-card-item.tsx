"use client";

import { RateCard } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Trash2 } from "lucide-react";

interface SavedCardItemProps {
  card: RateCard;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
  ig_reel: "Instagram reel",
  ig_post: "Instagram post",
  ig_story: "Instagram story",
  yt_long: "YouTube long",
  yt_short: "YouTube shorts",
};

const NICHE_LABELS: Record<string, string> = {
  finance: "Finance",
  tech: "Tech",
  lifestyle: "Lifestyle",
  food: "Food",
  fashion: "Fashion",
  fitness: "Fitness",
  gaming: "Gaming",
  travel: "Travel",
  education: "Education",
  beauty: "Beauty",
};

/**
 * Formats a number into INR locale string.
 * @param n - Raw number value
 */
function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Formats a follower count into Indian number shorthand.
 * @param n - Raw follower count
 */
function formatFollowers(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

/**
 * Formats an ISO date string into a readable short date.
 * @param iso - ISO 8601 date string
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Renders a single saved rate card with inputs summary,
 * rate tiers, and delete action.
 * @param card - Saved rate card data
 * @param onDelete - Callback fired with card id on delete
 * @param isDeleting - Whether a delete is currently in flight
 */
export function SavedCardItem({
  card,
  onDelete,
  isDeleting,
}: SavedCardItemProps) {
  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {card.label ?? PLATFORM_LABELS[card.platform]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {NICHE_LABELS[card.niche]}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {formatFollowers(card.followers)} followers
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {card.engagementRate.toFixed(1)}% ER
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {card.city}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground shrink-0">
          {formatDate(card.createdAt)}
        </p>
      </div>

      <Separator />

      {/* Rate tiers */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Floor</p>
          <p className="text-sm font-medium">{formatINR(card.floorRate)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Recommended</p>
          <p className="text-sm font-medium text-primary">
            {formatINR(card.midRate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Premium</p>
          <p className="text-sm font-medium">{formatINR(card.premiumRate)}</p>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="text-xs">
          <Download data-icon="inline-start" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-destructive hover:text-destructive ml-auto"
          onClick={() => onDelete(card.id)}
          disabled={isDeleting}
        >
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </div>
    </div>
  );
}
