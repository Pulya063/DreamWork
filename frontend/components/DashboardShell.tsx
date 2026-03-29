"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Compass, Map as MapIcon, LogOut, Menu, User } from "lucide-react";
import { useMemo, useState } from "react";

import { clearAuthSession } from "@/lib/auth";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Simulation", href: "/simulation", icon: Compass },
  { name: "Roadmap", href: "/roadmap", icon: MapIcon },
  { name: "Profile", href: "/profile", icon: User },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const activePath = useMemo(() => pathname ?? "/dashboard", [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf6f1]">
      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#c8a96e]/20 bg-white/90 shadow-xl backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#c8a96e]/20 px-6">
          <Link href="/" className="text-2xl font-bold text-[#c8a96e]">
            DreamWork
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-[#e8dfd0]/30 lg:hidden"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-8">
          {navLinks.map((item) => {
            const isActive = activePath.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "bg-[#c8a96e] text-white shadow-md shadow-[#c8a96e]/20"
                    : "text-gray-600 hover:bg-[#e8dfd0]/50 hover:text-[#2c2c2c]"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#c8a96e]/20 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-600 transition-colors hover:bg-[#c9ada7]/20 hover:text-[#d4183d]"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-[#c8a96e]/20 bg-white/50 px-4 py-4 backdrop-blur-md lg:hidden">
          <Link href="/" className="text-xl font-bold text-[#c8a96e]">
            DreamWork
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg bg-[#e8dfd0]/30 p-2 text-gray-600 hover:bg-[#e8dfd0]"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
