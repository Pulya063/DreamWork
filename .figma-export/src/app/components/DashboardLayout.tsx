import { Link, useLocation } from "react-router";
import { LayoutDashboard, Compass, Map as MapIcon, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export default function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Simulation", href: "/simulation", icon: Compass },
    { name: "Roadmap", href: "/roadmap", icon: MapIcon },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF6F1]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 shadow-xl backdrop-blur-md transition-transform duration-300 ease-in-out border-r border-[#C8A96E]/20 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#C8A96E]/20">
          <Link to="/" className="text-2xl font-serif font-bold text-[#C8A96E]">DreamWork</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-[#E8DFD0]/30 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navLinks.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#C8A96E] text-white shadow-md shadow-[#C8A96E]/20"
                    : "text-gray-600 hover:bg-[#E8DFD0]/50 hover:text-[#2C2C2C]"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#C8A96E]/20">
          <Link
            to="/login"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 transition-colors rounded-xl hover:bg-[#C9ADA7]/20 hover:text-[#d4183d]"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-white/50 backdrop-blur-md lg:hidden border-b border-[#C8A96E]/20">
          <Link to="/" className="text-xl font-serif font-bold text-[#C8A96E]">DreamWork</Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 rounded-lg bg-[#E8DFD0]/30 hover:bg-[#E8DFD0]"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
