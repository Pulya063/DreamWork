"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bell, Calendar, CheckCircle, Circle, ExternalLink, PlayCircle } from "lucide-react";
import Link from "next/link";

import PageTransition from "@/components/PageTransition";
import { ApiError, fetchCurrentPlan, searchResources } from "@/lib/api";
import type { Phase, PlanResponse } from "@/types/api";

function isDueSoon(deadline?: string | null, completedAt?: string | null) {
  if (!deadline || completedAt) {
    return false;
  }

  const hours = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  return hours >= 0 && hours <= 24;
}

function getPhaseProgress(phase: Phase) {
  if (phase.tasks.length === 0) {
    return 0;
  }

  const completed = phase.tasks.filter((task) => Boolean(task.completed_at)).length;
  return Math.round((completed / phase.tasks.length) * 100);
}

export default function RoadmapPage() {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [resourceSuggestions, setResourceSuggestions] = useState<string[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlan() {
      setLoading(true);
      setError(null);

      try {
        const planData = await fetchCurrentPlan();
        setPlan(planData);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setPlan(null);
          } else {
            setError(err.message);
          }
        } else {
          setError("Unable to load roadmap tasks right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadPlan();
  }, []);

  const dueSoonCount = useMemo(() => {
    if (!plan) {
      return 0;
    }

    return plan.phases.flatMap((phase) => phase.tasks).filter((task) => isDueSoon(task.deadline, task.completed_at)).length;
  }, [plan]);

  useEffect(() => {
    const targetJob = plan?.target_job;

    if (!targetJob) {
      setResourceSuggestions([]);
      return;
    }

    const safeTargetJob = targetJob;

    let cancelled = false;

    async function loadResources() {
      setLoadingResources(true);

      try {
        const result = await searchResources(safeTargetJob);
        if (!cancelled) {
          setResourceSuggestions(result.resources ?? []);
        }
      } catch {
        if (!cancelled) {
          setResourceSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingResources(false);
        }
      }
    }

    void loadResources();

    return () => {
      cancelled = true;
    };
  }, [plan?.target_job]);

  if (loading) {
    return (
      <PageTransition className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#2c2c2c]">Learning Roadmap</h1>
          <p className="text-gray-600">Loading your latest roadmap...</p>
        </div>
      </PageTransition>
    );
  }

  if (!plan) {
    return (
      <PageTransition className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#2c2c2c]">Learning Roadmap</h1>
          <p className="text-gray-600">Your personalized path will appear here after you generate a plan.</p>
        </div>
        <div className="rounded-3xl border border-[#e8dfd0]/50 bg-white/70 p-8 text-center shadow-sm backdrop-blur-md">
          <p className="mb-4 text-gray-600">No roadmap is available yet. Run a simulation first, then approve roadmap creation.</p>
          <Link
            href="/simulation"
            className="inline-flex rounded-xl bg-[#c8a96e] px-5 py-3 font-medium text-white transition-all hover:bg-[#b59863]"
          >
            Open Simulation
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#2c2c2c]">Learning Roadmap</h1>
          <p className="text-gray-600">Your personalized path to becoming a {plan.target_job}.</p>
        </div>
        <div className="relative cursor-pointer rounded-full border border-[#c8a96e]/20 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-colors hover:bg-[#e8dfd0]">
          <Bell size={24} className="text-[#2c2c2c]" />
          {dueSoonCount > 0 ? <span className="absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-white bg-[#d4183d]" /> : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#2c2c2c]">Suggested Resources</h2>
            <p className="mt-1 text-sm text-gray-500">Loaded separately from the resources endpoint for your target role.</p>
          </div>
          {loadingResources ? <span className="text-sm text-gray-400">Searching...</span> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {resourceSuggestions.length > 0 ? (
            resourceSuggestions.map((resource) => (
              <span key={resource} className="rounded-lg border border-[#c8a96e]/20 bg-[#c8a96e]/10 px-3 py-2 text-sm text-[#7d6434]">
                {resource}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No extra resource suggestions returned yet.</span>
          )}
        </div>
      </div>

      <div className="relative mt-12">
        <div className="absolute bottom-0 left-8 top-8 hidden w-1 rounded-full bg-gradient-to-b from-[#a3b18a] via-[#c8a96e] to-[#e8dfd0]/50 md:block" />

        <div className="space-y-12">
          {plan.phases.map((phase, index) => {
            const progress = getPhaseProgress(phase);
            const isCompleted = progress === 100;
            const isInProgress = progress > 0 && progress < 100;
            const fallbackDate = `${phase.duration_weeks} weeks`;
            const firstDeadline = phase.tasks.find((task) => task.deadline)?.deadline;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative flex flex-col gap-6 md:flex-row"
              >
                <div className="hidden flex-col items-center md:flex">
                  <div
                    className={`z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-sm ${
                      isCompleted
                        ? "border-white bg-[#a3b18a] text-white"
                        : isInProgress
                          ? "border-white bg-[#c8a96e] text-white"
                          : "border-[#e8dfd0] bg-[#faf6f1] text-gray-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={28} /> : isInProgress ? <PlayCircle size={28} /> : <Circle size={28} />}
                  </div>
                </div>

                <div className="relative flex-1 rounded-3xl border border-[#e8dfd0]/50 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md md:p-8">
                  <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#c8a96e] text-white shadow-sm md:hidden">
                    {isCompleted ? <CheckCircle size={18} /> : isInProgress ? <PlayCircle size={18} /> : <Circle size={18} />}
                  </div>

                  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-[#2c2c2c]">{phase.name}</h2>
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Calendar size={16} />
                        Target Date: {firstDeadline ? new Date(firstDeadline).toLocaleDateString() : fallbackDate}
                      </div>
                    </div>

                    {isInProgress ? (
                      <div className="min-w-[120px]">
                        <div className="mb-2 flex justify-between text-xs font-semibold text-[#c8a96e]">
                          <span>PROGRESS</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8dfd0]/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#c8a96e] to-[#b59863]"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Tasks</h3>
                      <ul className="space-y-3">
                        {phase.tasks.map((task) => (
                          <li key={task.id} className="flex items-start gap-3">
                            <div className={`mt-0.5 rounded-full p-0.5 ${task.completed_at ? "text-[#a3b18a]" : "text-[#c9ada7]"}`}>
                              <CheckCircle size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-[#2c2c2c]">{task.title}</p>
                              <p className="text-xs text-gray-500">{task.priority}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Resources</h3>
                      <div className="flex flex-wrap gap-2">
                        {phase.resources.map((resource) => (
                          <span
                            key={resource}
                            className="flex items-center gap-2 rounded-xl bg-[#c8a96e]/10 px-4 py-2 text-sm font-medium text-[#c8a96e]"
                          >
                            <ExternalLink size={14} />
                            {resource}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2">
                        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.topics.map((topic) => (
                            <span key={topic} className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
