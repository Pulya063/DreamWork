"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, Briefcase, Mail, User, UserRound, VenusAndMars } from "lucide-react";

import PageTransition from "@/components/PageTransition";
import { ApiError, fetchProfileSummary, updateCurrentUser } from "@/lib/api";
import type { SimulationResponse, UserProfile } from "@/types/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    marital_status: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState("Not set yet");
  const [latestSimulation, setLatestSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const summary = await fetchProfileSummary();
        const user = summary.user;

        setProfile(user);
        setFormState({
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email,
          age: user.age ? String(user.age) : "",
          gender: user.gender ?? "",
          marital_status: user.marital_status ?? "",
        });
        setSkills(summary.skills.map((item) => item.name));
        setTargetRole(summary.target_role ?? "Not set yet");
        setLatestSimulation(summary.latest_simulation);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load your profile right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateCurrentUser({
        first_name: formState.first_name,
        last_name: formState.last_name,
        username: formState.username,
        email: formState.email,
        age: formState.age ? Number(formState.age) : null,
        gender: formState.gender || null,
        marital_status: formState.marital_status || null,
      });

      setProfile(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to update your profile right now.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#2c2c2c]">User Profile</h1>
        <p className="text-gray-600">Manage your personal information and career goals.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#d4183d]/20 bg-[#d4183d]/10 px-4 py-3 text-sm text-[#b11230]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-[#a3b18a]/20 bg-[#a3b18a]/10 px-4 py-3 text-sm text-[#35513c]">
          {success}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-6 text-center shadow-sm backdrop-blur-md"
          >
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#e8dfd0] shadow-sm">
              <User size={40} className="text-[#c8a96e]" />
            </div>
            <h2 className="text-xl font-bold text-[#2c2c2c]">
              {profile ? `${profile.first_name} ${profile.last_name}` : "Loading..."}
            </h2>
            <p className="mb-4 text-sm text-gray-500">{profile?.username ?? "@"}</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#a3b18a]/10 px-3 py-1 text-xs font-semibold text-[#a3b18a]">
              <Award size={14} />
              Career Builder
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSave}
            className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-8 shadow-sm backdrop-blur-md"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#2c2c2c]">
              <User size={20} className="text-[#c8a96e]" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">First Name</label>
                <input
                  value={formState.first_name}
                  onChange={(event) => handleChange("first_name", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Last Name</label>
                <input
                  value={formState.last_name}
                  onChange={(event) => handleChange("last_name", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Username</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={formState.username}
                    onChange={(event) => handleChange("username", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Age</label>
                <input
                  type="number"
                  value={formState.age}
                  onChange={(event) => handleChange("age", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Gender</label>
                <div className="relative">
                  <VenusAndMars className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={formState.gender}
                    onChange={(event) => handleChange("gender", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Marital Status</label>
                <input
                  value={formState.marital_status}
                  onChange={(event) => handleChange("marital_status", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-xl bg-[#2c2c2c] px-5 py-3 font-medium text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#e8dfd0]/50 bg-white/70 p-8 shadow-sm backdrop-blur-md"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[#2c2c2c]">
              <Briefcase size={20} className="text-[#a3b18a]" />
              Career Journey
            </h3>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-[#c9ada7]/20 bg-[#c9ada7]/10 p-4">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c9ada7]">Current Direction</label>
                <div className="font-semibold text-[#2c2c2c]">{profile?.username ? `@${profile.username}` : "Getting started"}</div>
              </div>
              <div className="rounded-xl border border-[#c8a96e]/20 bg-[#c8a96e]/10 p-4">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#c8a96e]">Target Dream Job</label>
                <div className="font-semibold text-[#2c2c2c]">{targetRole}</div>
              </div>
            </div>

            <div className="mb-8 rounded-xl border border-[#a3b18a]/20 bg-[#a3b18a]/10 p-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#a3b18a]">Latest Forecast</label>
              <div className="font-semibold text-[#2c2c2c]">
                {latestSimulation
                  ? `${latestSimulation.salary_growth >= 0 ? "+" : ""}${latestSimulation.salary_growth.toFixed(1)}% salary growth`
                  : "Run a simulation to see your forecast"}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-gray-500">Current Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span key={skill} className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No skills recorded yet.</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
