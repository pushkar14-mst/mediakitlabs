import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSSR } from "@/lib/session";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserSSR(await cookies());
  if (!user) redirect("/login");

  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </Providers>
  );
}
