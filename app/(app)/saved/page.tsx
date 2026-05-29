import { cookies } from "next/headers";
import { getUserSSR } from "@/lib/session";
import { SavedCardList } from "@/components/rate-cards/saved-card-list";

export const metadata = {
  title: "Saved rate cards — ColabRate",
};

export default async function SavedPage() {
  const user = await getUserSSR(await cookies());

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-medium">Saved rate cards</h1>
        <p className="text-sm text-muted-foreground">
          Your saved calculations — {user.name}
        </p>
      </div>
      <SavedCardList />
    </div>
  );
}
