import { useState } from "react";
import { motion } from "motion/react";
import { Calculator, ArrowRight, TrendingUp } from "lucide-react";

export default function Simulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2C] mb-2 font-serif">Career Simulation</h1>
        <p className="text-gray-600">Enter your target parameters to forecast your career trajectory.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-[#C8A96E]/20"
        >
          <form onSubmit={handleSimulate} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="targetJob" className="block text-sm font-medium text-gray-700">Target Role</label>
              <input
                id="targetJob"
                type="text"
                required
                className="w-full px-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] transition-all"
                placeholder="e.g., Senior Data Scientist"
                defaultValue="Data Analyst"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700">Dedicated Study Hours / Week</label>
              <input
                id="hours"
                type="number"
                min="1"
                max="100"
                required
                className="w-full px-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] transition-all"
                placeholder="e.g., 15"
                defaultValue="10"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="income" className="block text-sm font-medium text-gray-700">Target Annual Income ($)</label>
              <input
                id="income"
                type="number"
                required
                className="w-full px-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] transition-all"
                placeholder="e.g., 120000"
                defaultValue="85000"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#C8A96E] hover:bg-[#b59863] text-white rounded-xl font-medium transition-all shadow-md shadow-[#C8A96E]/20 disabled:opacity-70"
            >
              {isSimulating ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Calculator size={20} />
                  </motion.div>
                  Analyzing Data...
                </span>
              ) : (
                <>
                  <Calculator size={20} />
                  Run Simulation
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Panel */}
        {showResults ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-[#2C2C2C] text-white rounded-3xl shadow-xl relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96E] rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <h2 className="text-2xl font-serif font-bold mb-6 text-[#E8DFD0] relative z-10">Forecast Results</h2>
            
            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-[#A3B18A] mb-1">Estimated Time</p>
                  <p className="text-2xl font-bold">6 Months</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-[#C8A96E] mb-1">Expected ROI</p>
                  <p className="text-2xl font-bold">340%</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-[#E8DFD0]">Skill Gap Analysis</h3>
                <div className="space-y-4">
                  {[
                    { name: "SQL & Databases", current: 40, required: 90 },
                    { name: "Python Programming", current: 60, required: 85 },
                    { name: "Data Visualization", current: 30, required: 75 },
                  ].map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{skill.name}</span>
                        <span className="text-white/60">Target: {skill.required}%</span>
                      </div>
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.current}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-[#A3B18A]"
                        />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.required - skill.current}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-full bg-[#C8A96E]/50 border-l border-[#2C2C2C]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20">
                Generate Learning Roadmap
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-[#C8A96E]/40 text-center h-full min-h-[400px]"
          >
            <div className="p-4 bg-[#E8DFD0]/50 rounded-full mb-4">
              <TrendingUp size={32} className="text-[#C8A96E]" />
            </div>
            <h3 className="text-xl font-serif font-medium text-[#2C2C2C] mb-2">Awaiting Parameters</h3>
            <p className="text-gray-500 max-w-sm">Enter your goals on the left to generate a personalized career and salary forecast.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
