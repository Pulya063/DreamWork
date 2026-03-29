"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Compass, Search, Target } from "lucide-react";
import { useState } from "react";

import PageTransition from "@/components/PageTransition";
import { getAccessToken } from "@/lib/auth";
import SiteFooter from "@/components/SiteFooter";

const features = [
  {
    icon: Compass,
    title: "Career Navigation",
    description:
      "Discover the exact skills you need to reach your dream role, tailored to your unique background.",
    color: "text-[#c8a96e]",
    bg: "bg-[#c8a96e]/10",
  },
  {
    icon: Target,
    title: "Salary Forecasting",
    description:
      "Calculate expected ROI and future earnings based on your dedicated study hours and current job market.",
    color: "text-[#a3b18a]",
    bg: "bg-[#a3b18a]/10",
  },
  {
    icon: BookOpen,
    title: "Curated Roadmaps",
    description:
      "Follow a step-by-step learning plan complete with high-quality resources and achievable deadlines.",
    color: "text-[#c9ada7]",
    bg: "bg-[#c9ada7]/10",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [dreamJob, setDreamJob] = useState("");

  const handleStart = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dreamJob.trim()) {
      return;
    }

    const simulationPath = `/simulation?job=${encodeURIComponent(dreamJob.trim())}&autostart=1`;

    if (getAccessToken()) {
      router.push(simulationPath);
      return;
    }

    router.push(`/login?next=${encodeURIComponent(simulationPath)}`);
  };

  return (
    <PageTransition className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute right-[-10%] top-[-20%] -z-10 h-[800px] w-[800px] rounded-full bg-[#e8dfd0] opacity-40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-20%] -z-10 h-[600px] w-[600px] rounded-full bg-[#a3b18a] opacity-20 blur-[120px]" />

      <header className="z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="text-3xl font-bold tracking-tight text-[#c8a96e]">DreamWork</div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="hidden font-medium text-[#2c2c2c] hover:text-[#c8a96e] sm:block">
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#2c2c2c] px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-black hover:shadow-xl"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="z-10 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <span className="mb-4 inline-block rounded-full border border-[#c8a96e]/20 bg-[#e8dfd0]/80 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-[#c8a96e]">
            The Future of Work
          </span>
          <h1 className="text-5xl font-bold leading-tight text-[#2c2c2c] md:text-7xl">
            Design the Career <br className="hidden md:block" />
            <span className="italic text-[#c8a96e]">You Deserve.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl">
            DreamWork analyzes your skills and the market to construct a personalized, actionable roadmap
            to your ideal profession.
          </p>

          <form
            onSubmit={handleStart}
            className="mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl border border-[#e8dfd0]/50 bg-white/60 p-3 shadow-xl backdrop-blur-md sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Write your dream job..."
                value={dreamJob}
                onChange={(event) => setDreamJob(event.target.value)}
                className="w-full bg-transparent py-4 pl-16 pr-6 text-xl text-[#2c2c2c] outline-none placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#c8a96e] px-10 py-4 text-lg font-medium text-white shadow-lg shadow-[#c8a96e]/30 transition-all hover:bg-[#b59863]"
            >
              Start Simulation
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-sm text-gray-500">
            Enter your target role to jump into the simulation flow and review the forecast before building a roadmap.
          </p>

          <div className="pt-2">
            <Link href="/login" className="text-sm text-gray-500 underline underline-offset-4 hover:text-[#c8a96e]">
              Already have an account? Log in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-32 grid w-full grid-cols-1 gap-8 md:grid-cols-3"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-[#e8dfd0]/50 bg-white/60 p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg}`}>
                <feature.icon size={28} className={feature.color} />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#2c2c2c]">{feature.title}</h3>
              <p className="leading-relaxed text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <SiteFooter className="relative z-10 border-t border-[#e8dfd0]/30" />
    </PageTransition>
  );
}
