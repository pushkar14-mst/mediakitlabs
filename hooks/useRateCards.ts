import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { RateCard } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Fetches the authenticated user's saved rate cards.
 * Exposes save and delete mutations with automatic cache invalidation.
 */
export function useRateCards() {
  const { mutate } = useSWRConfig();

  const { data, error, isLoading } = useSWR<{ data: RateCard[] }>(
    "/api/rate-cards",
    fetcher,
  );

  const { trigger: triggerSave, isMutating: isSaving } = useSWRMutation(
    "/api/rate-cards/save",
    async (
      url,
      {
        arg,
      }: { arg: Omit<RateCard, "id" | "userId" | "createdAt" | "updatedAt"> },
    ) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      if (!res.ok) throw new Error("Failed to save rate card");
      await mutate("/api/rate-cards");
      return res.json();
    },
  );

  const { trigger: triggerDelete, isMutating: isDeleting } = useSWRMutation(
    "/api/rate-cards/delete",
    async (url, { arg }: { arg: { id: string } }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      if (!res.ok) throw new Error("Failed to delete rate card");
      await mutate("/api/rate-cards");
      return res.json();
    },
  );

  return {
    rateCards: data?.data ?? [],
    isLoading,
    isError: !!error,
    saveCard: triggerSave,
    isSaving,
    deleteCard: triggerDelete,
    isDeleting,
  };
}
