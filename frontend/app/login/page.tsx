"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Lock, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import PageTransition from "@/components/PageTransition";
import { ApiError, loginUser } from "@/lib/api";
import { getAccessToken, setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    setNextPath(next);

    const initialUsername = params.get("username");
    if (initialUsername) {
      setUsername(initialUsername);
    }

    if (params.get("registered") === "1") {
      setInfoMessage("Account created successfully. Log in to continue.");
    }

    if (getAccessToken()) {
      router.replace(next);
    }
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const tokens = await loginUser(username, password);
      setAuthSession(tokens);
      router.replace(nextPath);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf6f1] px-4">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#c8a96e] opacity-20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[#a3b18a] opacity-20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[#e8dfd0]/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-bold text-[#c8a96e]">
            DreamWork
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-[#2c2c2c]">Welcome Back</h2>
          <p className="mt-2 text-gray-500">Log in to track your career progression.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {infoMessage ? (
            <div className="rounded-2xl border border-[#a3b18a]/30 bg-[#a3b18a]/10 px-4 py-3 text-sm text-[#35513c]">
              {infoMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="ml-1 text-sm font-medium text-gray-700">Username</label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                placeholder="alex_carter"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#e8dfd0] bg-white/50 py-3 pl-12 pr-4 text-[#2c2c2c] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                placeholder="••••••••"
              />
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2c2c2c] py-4 text-lg font-medium text-white shadow-lg transition-all hover:bg-black hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing In..." : "Access Dashboard"}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(nextPath)}`}
            className="font-medium text-[#c8a96e] hover:underline"
          >
            Create one here
          </Link>
        </div>
      </motion.div>
    </PageTransition>
  );
}
