"use client";

import { useRateCards } from "@/hooks/useRateCards";
import { SavedCardItem } from "./saved-card-item";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders the full list of saved rate cards for the authenticated user.
 * Handles loading, empty, and error states.
 */
export function SavedCardList() {
  const { rateCards, isLoading, isError, deleteCard, isDeleting } =
    useRateCards();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load saved cards. Please try again.
      </p>
    );
  }

  if (rateCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-20 text-center">
        <p className="text-sm font-medium">No saved rate cards yet</p>
        <p className="text-xs text-muted-foreground">
          Calculate a rate and save it to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rateCards.map((card) => (
        <SavedCardItem
          key={card.id}
          card={card}
          onDelete={(id) => deleteCard({ id })}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
