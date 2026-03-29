import { motion } from "motion/react";
import { User, Mail, Briefcase, GraduationCap, MapPin, Award } from "lucide-react";

export default function Profile() {
  const user = {
    name: "Alex Doe",
    email: "alex@example.com",
    currentRole: "Customer Support Specialist",
    targetRole: "Data Analyst",
    location: "New York, NY",
    education: "B.A. Communications",
    skills: ["Customer Service", "Basic Excel", "Communication", "Problem Solving"]
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2C] mb-2 font-serif">User Profile</h1>
        <p className="text-gray-600">Manage your personal information and career goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-[#E8DFD0]/50 text-center"
          >
            <div className="w-24 h-24 bg-[#E8DFD0] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-sm">
              <User size={40} className="text-[#C8A96E]" />
            </div>
            <h2 className="text-xl font-bold text-[#2C2C2C]">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{user.currentRole}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A3B18A]/10 text-[#A3B18A] rounded-full text-xs font-semibold">
              <Award size={14} />
              Pro Plan
            </div>
          </motion.div>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-[#E8DFD0]/50"
          >
            <h3 className="text-lg font-serif font-semibold text-[#2C2C2C] mb-6 flex items-center gap-2">
              <User size={20} className="text-[#C8A96E]" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="text-[#2C2C2C] font-medium flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  {user.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <div className="text-[#2C2C2C] font-medium flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                <div className="text-[#2C2C2C] font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {user.location}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Education</label>
                <div className="text-[#2C2C2C] font-medium flex items-center gap-2">
                  <GraduationCap size={16} className="text-gray-400" />
                  {user.education}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-[#E8DFD0]/50"
          >
            <h3 className="text-lg font-serif font-semibold text-[#2C2C2C] mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-[#A3B18A]" />
              Career Journey
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-[#C9ADA7]/10 rounded-xl border border-[#C9ADA7]/20">
                <label className="block text-xs font-semibold text-[#C9ADA7] uppercase tracking-wider mb-1">Current Role</label>
                <div className="text-[#2C2C2C] font-semibold">
                  {user.currentRole}
                </div>
              </div>
              <div className="p-4 bg-[#C8A96E]/10 rounded-xl border border-[#C8A96E]/20">
                <label className="block text-xs font-semibold text-[#C8A96E] uppercase tracking-wider mb-1">Target Dream Job</label>
                <div className="text-[#2C2C2C] font-semibold">
                  {user.targetRole}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Skills</label>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}