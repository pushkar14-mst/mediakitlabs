import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

export const metadata = {
  title: "Create account — ColabRate",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <BarChart2 size={28} className="text-primary" />
          <h1 className="text-xl font-medium">
            Colab<span className="text-primary">Rate</span>
          </h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>
        <RegisterForm />
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
