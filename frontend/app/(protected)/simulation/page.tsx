"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Calculator, Sparkles, TrendingUp, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import PageTransition from "@/components/PageTransition";
import { ApiError, generatePlan, runSimulation } from "@/lib/api";
import { getStoredSetupContext, getStoredSimulation, storeLastPlan, storeLastSimulation, storeSetupContext } from "@/lib/auth";
import type { SimulationResponse } from "@/types/api";

const setupDefaults = getStoredSetupContext();

export default function SimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autostartRequested = searchParams.get("autostart") === "1";
  const prefetchedJob = searchParams.get("job")?.trim() ?? "";
  const initialTargetJob = prefetchedJob || setupDefaults?.targetJob || "";
  const hasMatchingStoredResult = !prefetchedJob || prefetchedJob === setupDefaults?.targetJob;
  const [targetJob, setTargetJob] = useState(initialTargetJob);
  const [hoursPerWeek, setHoursPerWeek] = useState(setupDefaults?.hoursPerWeek ? String(setupDefaults.hoursPerWeek) : "");
  const [currentIncome, setCurrentIncome] = useState(setupDefaults?.currentIncome ? String(setupDefaults.currentIncome) : "");
  const [skillsText, setSkillsText] = useState(setupDefaults?.currentSkills.join(", ") ?? "");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResponse | null>(
    hasMatchingStoredResult ? getStoredSimulation() : null,
  );
  const autostartAttempted = useRef(false);

  const parsedSkills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  useEffect(() => {
    if (prefetchedJob) {
      setTargetJob(prefetchedJob);
    }
  }, [prefetchedJob]);

  useEffect(() => {
    if (!hasMatchingStoredResult) {
      setResults(null);
    }
  }, [hasMatchingStoredResult]);

  const runSimulationFlow = async () => {
    setError(null);
    setIsSimulating(true);

    try {
      const response = await runSimulation({
        target_job: targetJob.trim(),
        skills: parsedSkills,
        hours_per_week: Number(hoursPerWeek),
        current_income: Number(currentIncome),
      });

      storeLastSimulation(response);
      storeSetupContext({
        targetJob: targetJob.trim(),
        hoursPerWeek: Number(hoursPerWeek),
        currentIncome: Number(currentIncome),
        currentSkills: parsedSkills,
      });
      setResults(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to run the simulation right now.");
      }
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (!autostartRequested || autostartAttempted.current) {
      return;
    }

    if (!targetJob.trim() || !hoursPerWeek || !currentIncome || parsedSkills.length === 0) {
      return;
    }

    autostartAttempted.current = true;
    void runSimulationFlow();
  }, [autostartRequested, currentIncome, hoursPerWeek, parsedSkills.length, targetJob]);

  const handleSimulate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSimulationFlow();
  };

  const handleGenerateRoadmap = async () => {
    setError(null);
    setIsGeneratingPlan(true);

    try {
      const plan = await generatePlan({
        target_job: targetJob.trim(),
        hours_per_week: Number(hoursPerWeek),
      });

      storeLastPlan(plan);
      router.push("/roadmap");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to build a roadmap right now.");
      }
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleDeclineRoadmap = () => {
    setError(null);
    setResults(null);
  };

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#2c2c2c]">Career Simulation</h1>
        <p className="text-gray-600">Fill in your data and press Simulate to review the forecast before creating a roadmap.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-[#c8a96e]/20 bg-white/70 p-8 shadow-sm backdrop-blur-md"
        >
          <form onSubmit={handleSimulate} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="targetJob" className="block text-sm font-medium text-gray-700">
                Target Role
              </label>
              <input
                id="targetJob"
                type="text"
                required
                value={targetJob}
                onChange={(event) => setTargetJob(event.target.value)}
                className="w-full rounded-xl border border-[#e8dfd0] bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                placeholder="e.g., Senior Data Scientist"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                Dedicated Study Hours / Week
              </label>
              <input
                id="hours"
                type="number"
                min="1"
                required
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(event.target.value)}
                className="w-full rounded-xl border border-[#e8dfd0] bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                placeholder="e.g., 15"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="income" className="block text-sm font-medium text-gray-700">
                Current Annual Income
              </label>
              <input
                id="income"
                type="number"
                required
                value={currentIncome}
                onChange={(event) => setCurrentIncome(event.target.value)}
                className="w-full rounded-xl border border-[#e8dfd0] bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                placeholder="e.g., 60000"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Current Skills
              </label>
              <textarea
                id="skills"
                rows={4}
                required
                value={skillsText}
                onChange={(event) => setSkillsText(event.target.value)}
                className="w-full rounded-xl border border-[#e8dfd0] bg-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c8a96e]"
                placeholder="e.g., SQL, Excel, Python basics, communication"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulating || !targetJob.trim() || parsedSkills.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8a96e] px-6 py-3 font-medium text-white shadow-md shadow-[#c8a96e]/20 transition-all hover:bg-[#b59863] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSimulating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Calculator size={20} />
                  </motion.div>
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Simulate
                </>
              )}
            </button>
          </form>
        </motion.div>

        {results ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl bg-[#2c2c2c] p-8 text-white shadow-xl"
          >
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#c8a96e] opacity-10 blur-3xl" />

            <h2 className="relative z-10 mb-6 text-2xl font-bold text-[#e8dfd0]">Forecast Results</h2>

            <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-sm text-[#a3b18a]">Estimated Timeline</p>
                  <p className="text-2xl font-bold">{results.time_estimate.total_weeks_needed} Weeks</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-sm text-[#c8a96e]">Salary Growth</p>
                  <p className="text-2xl font-bold">
                    {results.salary_growth >= 0 ? "+" : ""}
                    {results.salary_growth.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-[#e8dfd0]">Recommended Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {results.recommended_skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex items-center gap-2 text-[#a3b18a]">
                  <Sparkles size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wider">Market Outlook</span>
                </div>
                <p className="text-sm leading-relaxed text-white/80">{results.market_analysis.description}</p>
                <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
                  <TrendingUp size={16} className="text-[#c8a96e]" />
                  <span>{results.market_analysis.market_trend}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm leading-relaxed text-white/80">
                  If this simulation looks right, agree and we&apos;ll generate a personalized roadmap for you. If not, decline,
                  adjust the inputs, and run the simulation again.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleGenerateRoadmap}
                    disabled={isGeneratingPlan}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8a96e] px-6 py-3 font-medium text-white transition-all hover:bg-[#b59863] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGeneratingPlan ? "Generating Roadmap..." : "Погодитись"}
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleDeclineRoadmap}
                    disabled={isGeneratingPlan}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Відмовитись
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#c8a96e]/40 bg-white/30 p-8 text-center backdrop-blur-md"
          >
            <div className="mb-4 rounded-full bg-[#e8dfd0]/50 p-4">
              <TrendingUp size={32} className="text-[#c8a96e]" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-[#2c2c2c]">Awaiting Parameters</h3>
            <p className="max-w-sm text-gray-500">
              Enter your goals on the left, press Simulate, and review the forecast before creating a roadmap.
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
