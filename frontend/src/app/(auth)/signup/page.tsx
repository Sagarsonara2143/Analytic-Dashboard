"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/api/v1/auth/signup", data);
      setTokens(res.data.access_token, res.data.refresh_token);
      document.cookie = `auth=${res.data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `refresh=${res.data.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push("/orgs");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError("root", { message: msg ?? "Registration failed" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md">
        <div className="card-elevated p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join the Analytics Platform today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {(["full_name", "email", "password"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  {...register(field)}
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  className="input-field"
                  placeholder={
                    field === "full_name"
                      ? "John Doe"
                      : field === "email"
                      ? "you@example.com"
                      : "••••••••"
                  }
                />
                {errors[field] && <p className="text-destructive text-xs mt-2">{errors[field]?.message}</p>}
              </div>
            ))}

            {errors.root && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive text-sm">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
