import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Briefcase, ChevronRight, Loader2, Target, Clock, TrendingUp, AlertCircle } from "lucide-react";

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    current_salary: "",
    age: "",
    gender: "",
    marital_status: "",
    current_skills: ""
  });

  const [results, setResults] = useState<{
    salary_growth: string;
    hours_to_learn: string;
    probability: string;
  } | null>(null);

  const handleAnalyze = () => {
    setLoading(true);
    // Mock AI request
    setTimeout(() => {
      setLoading(false);
      setResults({
        salary_growth: "145%",
        hours_to_learn: "320",
        probability: "87%"
      });
      setStep(2);
    }, 2500);
  };

  const handleContinue = () => {
    // Generate plan and go to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#E8DFD0] rounded-full opacity-40 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-[#A3B18A] rounded-full opacity-20 blur-[120px] -z-10 pointer-events-none" />

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#E8DFD0]"
            >
              <h1 className="text-3xl font-serif font-bold text-[#2C2C2C] mb-2">Tell us more about yourself</h1>
              <p className="text-gray-600 mb-8">We'll use this to calculate your personalized career roadmap.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Salary (Annual)</label>
                  <input
                    type="text"
                    placeholder="e.g. $60,000"
                    value={formData.current_salary}
                    onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 outline-none transition-all bg-white/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 outline-none transition-all bg-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 outline-none transition-all bg-white/50 appearance-none"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 outline-none transition-all bg-white/50 appearance-none"
                  >
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Skills (comma separated)</label>
                  <textarea
                    placeholder="e.g. HTML, CSS, Basic Python, Customer Service..."
                    rows={3}
                    value={formData.current_skills}
                    onChange={(e) => setFormData({ ...formData, current_skills: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 outline-none transition-all bg-white/50 resize-none"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !formData.current_salary || !formData.current_skills}
                  className="w-full mt-6 py-4 bg-[#2C2C2C] text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          )}

          {step === 2 && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#E8DFD0]"
            >
              <div className="w-16 h-16 bg-[#A3B18A]/20 text-[#A3B18A] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target size={32} />
              </div>
              
              <h1 className="text-3xl font-serif font-bold text-center text-[#2C2C2C] mb-2">AI Analysis Complete</h1>
              <p className="text-center text-gray-600 mb-8">Based on your profile and market data, here is your projection.</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-5 bg-[#C8A96E]/10 rounded-2xl border border-[#C8A96E]/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <TrendingUp size={24} className="text-[#C8A96E]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Projected Salary Growth</p>
                      <p className="text-2xl font-bold text-[#2C2C2C]">+{results.salary_growth}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-[#C9ADA7]/10 rounded-2xl border border-[#C9ADA7]/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Clock size={24} className="text-[#C9ADA7]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estimated Study Time</p>
                      <p className="text-2xl font-bold text-[#2C2C2C]">{results.hours_to_learn} Hours</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-[#A3B18A]/10 rounded-2xl border border-[#A3B18A]/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Briefcase size={24} className="text-[#A3B18A]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Probability of Landing Job</p>
                      <p className="text-2xl font-bold text-[#2C2C2C]">{results.probability}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl flex gap-3 text-sm text-gray-600 mb-8 border border-gray-100">
                <AlertCircle size={20} className="text-gray-400 shrink-0" />
                <p>We've drafted a comprehensive study plan with specific phases and tasks to help you reach this goal.</p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-4 bg-[#C8A96E] text-white rounded-xl font-medium hover:bg-[#b59863] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Create Study Plan & Continue
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
