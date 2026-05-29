import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

export const metadata = {
  title: "Log in — ColabRate",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <BarChart2 size={28} className="text-primary" />
          <h1 className="text-xl font-medium">
            Colab<span className="text-primary">Rate</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Log in to your account
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
