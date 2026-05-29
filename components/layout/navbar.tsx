"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserData } from "@/types";

interface NavbarProps {
  user: UserData;
}

/**
 * Returns the initials of a user's name for the avatar fallback.
 * @param name - Full name string
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  /**
   * Calls the logout API route and redirects to /login on success.
   */
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="h-14 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background z-10">
      <Link
        href="/"
        className="flex items-center gap-2 font-medium text-sm text-foreground"
      >
        <BarChart2 size={18} className="text-primary" />
        Colab<span className="text-primary">Rate</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Calculator
        </Link>
        <Link
          href="/saved"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Saved cards
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-8 cursor-pointer">
              <AvatarFallback className="text-xs font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
