import { useState } from "react";
import { motion } from "motion/react";
import { Briefcase, TrendingUp, CheckCircle, Clock, Compass, AlertTriangle, Send, Check } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const [taskResponse, setTaskResponse] = useState("");
  const [taskSubmitted, setTaskSubmitted] = useState(false);

  const stats = [
    { name: "Overall Progress", value: "34%", icon: Briefcase, color: "text-[#C8A96E]", bg: "bg-[#C8A96E]/10" },
    { name: "Salary Growth", value: "+145%", icon: TrendingUp, color: "text-[#A3B18A]", bg: "bg-[#A3B18A]/10" },
    { name: "Tasks Due Soon", value: "2", icon: Clock, color: "text-[#C9ADA7]", bg: "bg-[#C9ADA7]/10" },
    { name: "Phases Done", value: "1/4", icon: CheckCircle, color: "text-[#2C2C2C]", bg: "bg-[#2C2C2C]/5" },
  ];

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskResponse.trim()) {
      setTaskSubmitted(true);
      setTimeout(() => {
        setTaskResponse("");
        setTaskSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2C] mb-2 font-serif">Your Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and complete your tasks.</p>
        </div>
        
        {/* Deadline Notifications */}
        <div className="bg-[#C9ADA7]/10 border border-[#C9ADA7]/30 p-4 rounded-xl flex items-start gap-3 max-w-sm">
          <AlertTriangle className="text-[#C9ADA7] shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-[#2C2C2C]">Approaching Deadlines</p>
            <p className="text-xs text-gray-600 mt-1">"Advanced Python Structs" task is due in 12 hours. Please submit your response below.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-[#C8A96E]/20 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-[#2C2C2C]">{stat.value}</p>
              </div>
            </div>
            
            {/* Progress Bar for Overall Progress */}
            {stat.name === "Overall Progress" && (
              <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#C8A96E] h-full rounded-full" style={{ width: "34%" }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Active Task & Response */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-[#E8DFD0]/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3B18A] mb-1 block">Current Task</span>
                <h2 className="text-xl font-serif font-semibold text-[#2C2C2C]">Advanced Python Structs</h2>
              </div>
              <span className="px-3 py-1 bg-[#C9ADA7]/10 text-[#C9ADA7] rounded-full text-xs font-semibold">Due Soon</span>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Review the provided learning materials on classes and inheritance in Python. Create a simple program that demonstrates a base class and two derived classes, then submit your GitHub link or code snippet below.
            </p>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Submit your work</label>
              <div className="relative">
                <textarea
                  value={taskResponse}
                  onChange={(e) => setTaskResponse(e.target.value)}
                  placeholder="Paste your code or link here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 outline-none transition-all resize-none text-sm"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={taskSubmitted}
                className={`w-full py-3 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 ${
                  taskSubmitted 
                    ? "bg-[#A3B18A] text-white" 
                    : "bg-[#2C2C2C] text-white hover:bg-black"
                }`}
              >
                {taskSubmitted ? (
                  <>
                    <Check size={18} />
                    Task Submitted Successfully
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Task Response
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 bg-[#C8A96E]/10 rounded-2xl border border-[#C8A96E]/20">
            <h2 className="mb-4 text-xl font-serif font-semibold text-[#2C2C2C]">Navigation</h2>
            <div className="space-y-3">
              <Link to="/roadmap" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group">
                <span className="font-medium text-gray-700 group-hover:text-[#C8A96E]">View Study Plan</span>
                <Compass size={18} className="text-[#C8A96E]" />
              </Link>
              <Link to="/simulation" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group">
                <span className="font-medium text-gray-700 group-hover:text-[#A3B18A]">Simulate New Job</span>
                <TrendingUp size={18} className="text-[#A3B18A]" />
              </Link>
              <Link to="/profile" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group">
                <span className="font-medium text-gray-700 group-hover:text-[#2C2C2C]">User Profile</span>
                <Briefcase size={18} className="text-[#2C2C2C]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
