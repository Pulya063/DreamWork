import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login -> redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF6F1] px-4 relative overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#C8A96E] rounded-full opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#A3B18A] rounded-full opacity-20 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8DFD0]/50 relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif font-bold text-[#C8A96E] inline-block mb-2">DreamWork</Link>
          <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] mt-4">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Log in to track your career progression.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C]"
                placeholder="alex@example.com"
                defaultValue="demo@dreamwork.com"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C]"
                placeholder="••••••••"
                defaultValue="password123"
              />
            </div>
            <div className="flex justify-end mt-1">
              <a href="#" className="text-sm text-[#C8A96E] hover:underline">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#2C2C2C] text-white rounded-2xl font-medium text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            Access Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#C8A96E] font-medium hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
