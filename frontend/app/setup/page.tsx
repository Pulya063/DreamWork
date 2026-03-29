"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Briefcase, ChevronRight, Clock, Loader2, Target, TrendingUp } from "lucide-react";

import PageTransition from "@/components/PageTransition";
import { ApiError, generatePlan, runSimulation } from "@/lib/api";
import { getAccessToken, storeLastPlan, storeLastSimulation, storeSetupContext } from "@/lib/auth";
import type { SimulationResponse } from "@/types/api";

export default function SetupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResponse | null>(null);
  const [queryString, setQueryString] = useState("");
  const [formData, setFormData] = useState({
    target_job: "",
    current_income: "",
    hours_per_week: "",
    age: "",
    gender: "",
    marital_status: "",
    current_skills: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const job = params.get("job");
    setQueryString(params.toString());

    if (job) {
      setFormData((current) => ({ ...current, target_job: job }));
    }

    const token = getAccessToken();
    if (!token) {
      const next = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setAuthChecked(true);
  }, [pathname, router]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const normalizedSkills = formData.current_skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await runSimulation({
        target_job: formData.target_job.trim(),
        skills: normalizedSkills,
        hours_per_week: Number(formData.hours_per_week),
        current_income: Number(formData.current_income),
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        marital_status: formData.marital_status || undefined,
      });

      storeLastSimulation(response);
      storeSetupContext({
        targetJob: formData.target_job.trim(),
        hoursPerWeek: Number(formData.hours_per_week),
        currentIncome: Number(formData.current_income),
        currentSkills: normalizedSkills,
      });

      setResults(response);
      setStep(2);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We could not analyze your profile right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setCreatingPlan(true);
    setError(null);

    try {
      const plan = await generatePlan({
        target_job: formData.target_job.trim(),
        hours_per_week: Number(formData.hours_per_week),
      });

      storeLastPlan(plan);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We could not generate your roadmap right now.");
      }
    } finally {
      setCreatingPlan(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] px-6">
        <div className="rounded-3xl border border-[#e8dfd0] bg-white/80 px-8 py-10 text-center shadow-xl backdrop-blur-xl">
          <p className="text-lg font-medium text-[#2c2c2c]">Preparing your setup...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfbf7] p-6">
      <div className="pointer-events-none absolute right-[-10%] top-[-20%] -z-10 h-[800px] w-[800px] rounded-full bg-[#e8dfd0] opacity-40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-20%] -z-10 h-[600px] w-[600px] rounded-full bg-[#a3b18a] opacity-20 blur-[120px]" />

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-[#e8dfd0] bg-white/80 p-8 shadow-xl backdrop-blur-xl"
            >
              <h1 className="mb-2 text-3xl font-bold text-[#2c2c2c]">Tell us more about yourself</h1>
              <p className="mb-8 text-gray-600">We&apos;ll use this to calculate your personalized career roadmap.</p>

              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Target Role</label>
                  <input
                    type="text"
                    value={formData.target_job}
                    onChange={(event) => updateField("target_job", event.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Current Salary (Annual)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60000"
                      value={formData.current_income}
                      onChange={(event) => updateField("current_income", event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Study Hours / Week</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 12"
                      value={formData.hours_per_week}
                      onChange={(event) => updateField("hours_per_week", event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={formData.age}
                      onChange={(event) => updateField("age", event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Gender <span className="font-normal text-gray-400">(Optional)</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(event) => updateField("gender", event.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Marital Status <span className="font-normal text-gray-400">(Optional)</span>
                  </label>
                  <select
                    value={formData.marital_status}
                    onChange={(event) => updateField("marital_status", event.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  >
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Current Skills (comma separated)</label>
                  <textarea
                    rows={4}
                    placeholder="e.g. HTML, CSS, JavaScript, communication..."
                    value={formData.current_skills}
                    onChange={(event) => updateField("current_skills", event.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white/50 px-4 py-3 outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={
                    loading ||
                    !formData.target_job.trim() ||
                    !formData.current_income ||
                    !formData.hours_per_week ||
                    normalizedSkills.length === 0
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c2c2c] py-4 font-medium text-white shadow-lg transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      Analyze Profile
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-[#e8dfd0] bg-white/80 p-8 shadow-xl backdrop-blur-xl"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a3b18a]/20 text-[#a3b18a]">
                <Target size={32} />
              </div>

              <h1 className="mb-2 text-center text-3xl font-bold text-[#2c2c2c]">AI Analysis Complete</h1>
              <p className="mb-8 text-center text-gray-600">
                Based on your profile and market data, here is your projection.
              </p>

              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-[#c8a96e]/20 bg-[#c8a96e]/10 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <TrendingUp size={24} className="text-[#c8a96e]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Projected Salary Growth</p>
                      <p className="text-2xl font-bold text-[#2c2c2c]">
                        {results ? `${results.salary_growth >= 0 ? "+" : ""}${results.salary_growth.toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#c9ada7]/20 bg-[#c9ada7]/10 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <Clock size={24} className="text-[#c9ada7]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estimated Study Time</p>
                      <p className="text-2xl font-bold text-[#2c2c2c]">
                        {results?.time_estimate.total_hours_needed} Hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <Briefcase size={24} className="text-[#a3b18a]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estimated Timeline</p>
                      <p className="text-2xl font-bold text-[#2c2c2c]">
                        {results?.time_estimate.total_weeks_needed} Weeks
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {results ? (
                <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="mt-0.5 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-[#2c2c2c]">{results.market_analysis.market_trend}</p>
                      <p className="mt-1">{results.market_analysis.description}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="mb-5 rounded-xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleContinue}
                disabled={creatingPlan}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8a96e] py-4 font-medium text-white shadow-lg transition-all hover:bg-[#b59863] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creatingPlan ? "Building Your Roadmap..." : "Create Study Plan & Continue"}
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
