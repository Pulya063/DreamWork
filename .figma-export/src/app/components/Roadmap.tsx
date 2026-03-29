import { motion } from "motion/react";
import { Bell, CheckCircle, Circle, PlayCircle, ExternalLink, Calendar } from "lucide-react";

export default function Roadmap() {
  const milestones = [
    {
      id: 1,
      title: "Foundations of Data Analysis",
      status: "completed",
      date: "Oct 15, 2026",
      progress: 100,
      tasks: [
        { name: "Complete Intro to Statistics", time: "10 hrs" },
        { name: "Basic Excel Functions", time: "5 hrs" },
      ],
      resources: [{ name: "YouTube: Stats 101", url: "#" }],
    },
    {
      id: 2,
      title: "SQL Mastery for Business",
      status: "in-progress",
      date: "Nov 10, 2026",
      progress: 65,
      tasks: [
        { name: "Joins and Aggregations", time: "8 hrs" },
        { name: "Window Functions", time: "12 hrs" },
        { name: "Database Optimization", time: "5 hrs" },
      ],
      resources: [
        { name: "Mode Analytics SQL Tutorial", url: "#" },
        { name: "Kaggle SQL Challenges", url: "#" },
      ],
    },
    {
      id: 3,
      title: "Python Data Science Toolkit",
      status: "upcoming",
      date: "Dec 05, 2026",
      progress: 0,
      tasks: [
        { name: "Pandas Data Manipulation", time: "20 hrs" },
        { name: "Matplotlib & Seaborn", time: "15 hrs" },
      ],
      resources: [{ name: "Official Pandas Docs", url: "#" }],
    },
    {
      id: 4,
      title: "Machine Learning Fundamentals",
      status: "upcoming",
      date: "Jan 15, 2027",
      progress: 0,
      tasks: [
        { name: "Supervised Learning Models", time: "25 hrs" },
        { name: "Model Evaluation", time: "10 hrs" },
      ],
      resources: [{ name: "Scikit-Learn Guide", url: "#" }],
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2C] mb-2 font-serif">Learning Roadmap</h1>
          <p className="text-gray-600">Your personalized path to becoming a Data Analyst.</p>
        </div>
        <div className="relative p-3 bg-white/70 backdrop-blur-md rounded-full shadow-sm border border-[#C8A96E]/20 hover:bg-[#E8DFD0] transition-colors cursor-pointer">
          <Bell size={24} className="text-[#2C2C2C]" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-[#d4183d] rounded-full border-2 border-white"></span>
        </div>
      </div>

      <div className="relative mt-12">
        {/* Continuous vertical line */}
        <div className="absolute left-8 top-8 bottom-0 w-1 bg-gradient-to-b from-[#A3B18A] via-[#C8A96E] to-[#E8DFD0]/50 rounded-full hidden md:block" />

        <div className="space-y-12">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative flex flex-col md:flex-row gap-6"
            >
              {/* Timeline marker */}
              <div className="hidden md:flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-sm z-10 ${
                    milestone.status === "completed"
                      ? "bg-[#A3B18A] border-white text-white"
                      : milestone.status === "in-progress"
                      ? "bg-[#C8A96E] border-white text-white"
                      : "bg-[#FAF6F1] border-[#E8DFD0] text-gray-400"
                  }`}
                >
                  {milestone.status === "completed" ? (
                    <CheckCircle size={28} />
                  ) : milestone.status === "in-progress" ? (
                    <PlayCircle size={28} />
                  ) : (
                    <Circle size={28} />
                  )}
                </div>
              </div>

              {/* Content Card */}
              <div className="flex-1 p-6 md:p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-[#E8DFD0]/50 hover:shadow-md transition-shadow relative">
                {/* Mobile Status Indicator */}
                <div className="md:hidden absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 bg-[#C8A96E] text-white">
                  {milestone.status === "completed" ? (
                    <CheckCircle size={18} />
                  ) : milestone.status === "in-progress" ? (
                    <PlayCircle size={18} />
                  ) : (
                    <Circle size={18} />
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#2C2C2C]">{milestone.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
                      <Calendar size={16} />
                      Target Date: {milestone.date}
                    </div>
                  </div>
                  
                  {milestone.status === "in-progress" && (
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="flex justify-between text-xs font-semibold text-[#C8A96E]">
                        <span>PROGRESS</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#E8DFD0]/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${milestone.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#C8A96E] to-[#b59863]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">Tasks</h3>
                    <ul className="space-y-3">
                      {milestone.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-0.5 ${milestone.status === "completed" ? "text-[#A3B18A]" : "text-[#C9ADA7]"}`}>
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-[#2C2C2C]">{task.name}</p>
                            <p className="text-xs text-gray-500">{task.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">Resources</h3>
                    <div className="flex flex-wrap gap-2">
                      {milestone.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#C8A96E] bg-[#C8A96E]/10 rounded-xl hover:bg-[#C8A96E] hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                          {res.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {milestone.status === "in-progress" && (
                  <div className="mt-8 pt-6 border-t border-[#E8DFD0]/50 flex justify-end">
                    <button className="px-6 py-2.5 bg-[#2C2C2C] text-white rounded-xl font-medium hover:bg-black transition-colors shadow-md">
                      Update Progress
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
