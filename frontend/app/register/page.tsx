"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Lock, Mail, User, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import PageTransition from "@/components/PageTransition";
import { ApiError, registerUser } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    setNextPath(next);

    if (getAccessToken()) {
      router.replace(next);
    }
  }, [router]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      const loginParams = new URLSearchParams({
        registered: "1",
        username: formData.username,
        next: nextPath,
      });
      router.replace(`/login?${loginParams.toString()}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create your account right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf6f1] px-4 py-12">
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#c9ada7] opacity-20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-[#c8a96e] opacity-20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl rounded-3xl border border-[#e8dfd0]/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-bold text-[#c8a96e]">
            DreamWork
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-[#2c2c2c]">Join DreamWork</h2>
          <p className="mt-2 text-gray-500">Create your account and start your career journey.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-gray-700">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(event) => handleChange("first_name", event.target.value)}
                  className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                  placeholder="Alex"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-gray-700">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(event) => handleChange("last_name", event.target.value)}
                  className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                  placeholder="Carter"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(event) => handleChange("username", event.target.value)}
                  className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                  placeholder="alex_carter"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={(event) => handleChange("confirm_password", event.target.value)}
                  className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c8a96e] py-4 text-lg font-medium text-white shadow-lg shadow-[#c8a96e]/20 transition-all hover:bg-[#b59863] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="font-medium text-[#c8a96e] hover:underline"
          >
            Log in here
          </Link>
        </div>
      </motion.div>
    </PageTransition>
  );
}
