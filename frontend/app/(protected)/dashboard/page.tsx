"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, Briefcase, Check, CheckCircle, Clock, Compass, Send, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageTransition from "@/components/PageTransition";
import { ApiError, fetchDashboard, verifyTaskSubmission } from "@/lib/api";
import type { DashboardResponse, PlanResponse, SimulationResponse, TaskItem, VerifyTaskResult } from "@/types/api";

const emptyStats = {
  progress: 0,
  due_soon_count: 0,
  completed_tasks: 0,
  total_tasks: 0,
};

function isDueSoon(task: TaskItem) {
  if (!task.deadline || task.completed_at) {
    return false;
  }

  const deadline = new Date(task.deadline).getTime();
  const now = Date.now();
  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

  return hoursUntilDeadline >= 0 && hoursUntilDeadline <= 24;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskResponse, setTaskResponse] = useState("");
  const [feedback, setFeedback] = useState<VerifyTaskResult | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [stats, setStats] = useState(emptyStats);

  const applyDashboardData = useCallback((data: DashboardResponse) => {
    setPlan(data.current_plan);
    setSimulation(data.latest_simulation);
    setTasks(data.tasks);
    setActiveTask(data.active_task);
    setStats(data.stats);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboard();
      applyDashboardData(data);
    } catch (err) {
      applyDashboardData({
        current_plan: null,
        latest_simulation: null,
        tasks: [],
        active_task: null,
        stats: emptyStats,
      });

      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [applyDashboardData]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const completedTasks = useMemo(() => tasks.filter((task) => Boolean(task.completed_at)), [tasks]);
  const dueSoonTasks = useMemo(() => tasks.filter(isDueSoon), [tasks]);

  const phasesDone = useMemo(() => {
    if (!plan) {
      return 0;
    }

    return plan.phases.filter((phase) => phase.tasks.length > 0 && phase.tasks.every((task) => Boolean(task.completed_at))).length;
  }, [plan]);

  const hasRoadmap = Boolean(plan) || tasks.length > 0;
  const shouldShowSimulationCta = !loading && !hasRoadmap;

  const statCards = [
    { name: "Overall Progress", value: `${stats.progress}%`, icon: Briefcase, color: "text-[#c8a96e]", bg: "bg-[#c8a96e]/10" },
    {
      name: "Salary Growth",
      value: simulation ? `${simulation.salary_growth >= 0 ? "+" : ""}${simulation.salary_growth.toFixed(1)}%` : "-",
      icon: TrendingUp,
      color: "text-[#a3b18a]",
      bg: "bg-[#a3b18a]/10",
    },
    {
      name: "Tasks Due Soon",
      value: String(stats.due_soon_count),
      icon: Clock,
      color: "text-[#c9ada7]",
      bg: "bg-[#c9ada7]/10",
    },
    {
      name: "Phases Done",
      value: plan ? `${phasesDone}/${plan.phases.length}` : tasks.length > 0 ? "Started" : "0/0",
      icon: CheckCircle,
      color: "text-[#2c2c2c]",
      bg: "bg-[#2c2c2c]/5",
    },
  ];

  const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeTask || !taskResponse.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await verifyTaskSubmission(activeTask.id, taskResponse.trim());
      setFeedback(result.verification);
      setTaskResponse("");
      applyDashboardData(result.dashboard);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Task verification failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#2c2c2c]">Your Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and complete your tasks.</p>
        </div>

        <div className="flex max-w-sm items-start gap-3 rounded-xl border border-[#c9ada7]/30 bg-[#c9ada7]/10 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-[#c9ada7]" size={20} />
          <div>
            <p className="text-sm font-semibold text-[#2c2c2c]">Approaching Deadlines</p>
            <p className="mt-1 text-xs text-gray-600">
              {dueSoonTasks.length > 0
                ? `${dueSoonTasks[0]?.title} is due soon. Submit your response below.`
                : "No urgent deadlines right now. Keep moving through your roadmap."}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
          {error}
        </div>
      ) : null}

      {shouldShowSimulationCta ? (
        <div className="rounded-3xl border border-[#c8a96e]/20 bg-[#c8a96e]/10 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#c8a96e]">Next Step</p>
              <h2 className="mt-1 text-2xl font-bold text-[#2c2c2c]">
                {simulation ? "Your roadmap is not created yet" : "Your dashboard is ready for the first simulation"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                {simulation
                  ? "Open the Simulation tab to review the current result and create your roadmap from it."
                  : "Open the Simulation tab, fill in your data, and press the Simulate button. We will show the forecast first, and only after your approval we will build the roadmap."}
              </p>
            </div>

            <Link
              href="/simulation"
              className="inline-flex items-center justify-center rounded-2xl bg-[#2c2c2c] px-5 py-3 font-medium text-white transition-all hover:bg-black"
            >
              {simulation ? "Review Simulation" : "Open Simulation"}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-[#c8a96e]/20 bg-white/70 p-6 shadow-sm backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-[#2c2c2c]">{stat.value}</p>
              </div>
            </div>

            {stat.name === "Overall Progress" ? (
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#c8a96e]" style={{ width: `${stats.progress}%` }} />
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#a3b18a]">Current Task</span>
                <h2 className="text-xl font-semibold text-[#2c2c2c]">{activeTask ? activeTask.title : "No active task yet"}</h2>
              </div>
              {activeTask ? (
                <span className="rounded-full bg-[#c9ada7]/10 px-3 py-1 text-xs font-semibold text-[#c9ada7]">
                  {isDueSoon(activeTask) ? "Due Soon" : activeTask.priority}
                </span>
              ) : null}
            </div>

            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              {activeTask
                ? activeTask.description
                : "You do not have an active roadmap task yet. Run a simulation first, then approve the roadmap to start receiving guided tasks."}
            </p>

            {feedback ? (
              <div className="mb-5 rounded-xl border border-[#a3b18a]/30 bg-[#a3b18a]/10 px-4 py-3 text-sm text-[#35513c]">
                <p className="font-semibold">
                  {feedback.completed ? "Task accepted" : "Task still needs work"} ({feedback.confidence}%)
                </p>
                <p className="mt-1">{feedback.feedback}</p>
              </div>
            ) : null}

            {activeTask ? (
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Submit your work</label>
                <textarea
                  value={taskResponse}
                  onChange={(event) => setTaskResponse(event.target.value)}
                  placeholder="Paste your code, summary, or link here..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium shadow-sm transition-all ${
                    submitting ? "bg-[#a3b18a] text-white" : "bg-[#2c2c2c] text-white hover:bg-black"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Check size={18} />
                      Verifying Submission...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Task Response
                    </>
                  )}
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-[#c8a96e]/20 bg-[#c8a96e]/10 p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#2c2c2c]">Navigation</h2>
            <div className="space-y-3">
              <Link
                href="/roadmap"
                className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <span className="font-medium text-gray-700 group-hover:text-[#c8a96e]">View Study Plan</span>
                <Compass size={18} className="text-[#c8a96e]" />
              </Link>
              <Link
                href="/simulation"
                className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <span className="font-medium text-gray-700 group-hover:text-[#a3b18a]">Simulate New Job</span>
                <TrendingUp size={18} className="text-[#a3b18a]" />
              </Link>
              <Link
                href="/profile"
                className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <span className="font-medium text-gray-700 group-hover:text-[#2c2c2c]">User Profile</span>
                <Briefcase size={18} className="text-[#2c2c2c]" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-6 text-sm text-gray-500 shadow-sm">
              Loading your latest data...
            </div>
          ) : null}

          {!loading && hasRoadmap ? (
            <div className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-6 text-sm text-gray-500 shadow-sm">
              {completedTasks.length > 0
                ? `${completedTasks.length} tasks completed so far. Keep the momentum going.`
                : "Your roadmap is ready. Start with the current task and submit the result here."}
            </div>
          ) : null}
        </div>
      </div>
    </PageTransition>
  );
}
