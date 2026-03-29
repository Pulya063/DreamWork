import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Compass, BookOpen, Target, ArrowRight, Search } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [dreamJob, setDreamJob] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (dreamJob.trim()) {
      navigate(`/setup?job=${encodeURIComponent(dreamJob)}`);
    }
  };
  const features = [
    {
      icon: Compass,
      title: "Career Navigation",
      description: "Discover the exact skills you need to reach your dream role, tailored to your unique background.",
      color: "text-[#C8A96E]",
      bg: "bg-[#C8A96E]/10"
    },
    {
      icon: Target,
      title: "Salary Forecasting",
      description: "Calculate expected ROI and future earnings based on your dedicated study hours and current job market.",
      color: "text-[#A3B18A]",
      bg: "bg-[#A3B18A]/10"
    },
    {
      icon: BookOpen,
      title: "Curated Roadmaps",
      description: "Follow a step-by-step learning plan complete with high-quality resources and achievable deadlines.",
      color: "text-[#C9ADA7]",
      bg: "bg-[#C9ADA7]/10"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#E8DFD0] rounded-full opacity-40 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-[#A3B18A] rounded-full opacity-20 blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center z-10">
        <div className="text-3xl font-serif font-bold text-[#C8A96E] tracking-tight">DreamWork</div>
        <nav className="flex gap-6 items-center">
          <Link to="/login" className="text-[#2C2C2C] font-medium hover:text-[#C8A96E] transition-colors hidden sm:block">Log In</Link>
          <Link to="/register" className="px-6 py-2.5 bg-[#2C2C2C] text-white rounded-full font-medium hover:bg-black transition-all shadow-md hover:shadow-xl">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <span className="px-4 py-1.5 rounded-full bg-[#E8DFD0]/80 text-[#C8A96E] text-sm font-semibold tracking-widest uppercase border border-[#C8A96E]/20 inline-block mb-4">
            The Future of Work
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#2C2C2C] leading-tight">
            Design the Career <br className="hidden md:block" />
            <span className="italic text-[#C8A96E]">You Deserve.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-8">
            DreamWork analyzes your skills and the market to construct a personalized, actionable roadmap to your ideal profession.
          </p>
          
          <form onSubmit={handleStart} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 bg-white/60 p-3 rounded-3xl backdrop-blur-md border border-[#E8DFD0]/50 shadow-xl">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="Write your dream job..." 
                value={dreamJob}
                onChange={(e) => setDreamJob(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-transparent outline-none text-xl text-[#2C2C2C] placeholder-gray-400 font-serif"
                required
              />
            </div>
            <button type="submit" className="px-10 py-4 bg-[#C8A96E] text-white rounded-2xl font-medium text-lg hover:bg-[#b59863] transition-all shadow-lg shadow-[#C8A96E]/30 flex items-center justify-center gap-2 group whitespace-nowrap">
              Continue
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="pt-6">
            <Link to="/login" className="text-sm text-gray-500 hover:text-[#C8A96E] underline underline-offset-4 transition-colors">
              Already have an account? Log in
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="p-8 bg-white/60 backdrop-blur-md rounded-3xl border border-[#E8DFD0]/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group">
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} className={feature.color} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </main>
      
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-[#E8DFD0]/30 z-10 relative">
        <p>&copy; 2026 DreamWork Inc. Demo Frontend Build.</p>
      </footer>
    </div>
  );
}
