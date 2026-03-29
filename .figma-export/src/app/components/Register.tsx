import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Lock, Mail, User, Hash, HelpCircle } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock register -> redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF6F1] px-4 py-12 relative overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C9ADA7] rounded-full opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#C8A96E] rounded-full opacity-20 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8DFD0]/50 relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif font-bold text-[#C8A96E] inline-block mb-2">DreamWork</Link>
          <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] mt-4">Join DreamWork</h2>
          <p className="text-gray-500 mt-2">Create your account and start your career journey.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C]"
                  placeholder="Alex Carter"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C]"
                  placeholder="alex@example.com"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 ml-1">Age</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="16"
                  max="120"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C]"
                  placeholder="24"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 ml-1">Gender</label>
              <div className="relative">
                <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                <select
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C] appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
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
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#E8DFD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:bg-white transition-all text-[#2C2C2C]"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded border-[#E8DFD0] text-[#C8A96E] focus:ring-[#C8A96E]"
            />
            <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
              I agree to the <a href="#" className="text-[#C8A96E] hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-[#C8A96E] hover:underline">Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#C8A96E] text-white rounded-2xl font-medium text-lg hover:bg-[#b59863] transition-all shadow-lg shadow-[#C8A96E]/20 hover:shadow-xl flex items-center justify-center gap-2 group mt-8"
          >
            Create Account
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-[#C8A96E] font-medium hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
