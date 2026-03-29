"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import DashboardShell from "@/components/DashboardShell";
import SiteFooter from "@/components/SiteFooter";
import { getAccessToken } from "@/lib/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col bg-[#faf6f1]">
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="rounded-3xl border border-[#e8dfd0] bg-white/80 px-8 py-10 text-center shadow-xl backdrop-blur-md">
            <p className="text-lg font-medium text-[#2c2c2c]">Checking your session...</p>
          </div>
        </div>
        <SiteFooter className="border-t border-[#e8dfd0]/40 bg-white/40 backdrop-blur-md" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
