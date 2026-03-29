import Link from "next/link";
import { Compass } from "lucide-react";

export default function AuthHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-4 py-5 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-full border border-[#e8dfd0]/60 bg-white/70 px-4 py-2 text-[#2c2c2c] shadow-sm backdrop-blur-md transition-all hover:border-[#c8a96e]/40 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8a96e] text-white shadow-sm">
            <Compass size={20} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#c8a96e]">DreamWork</span>
        </Link>
      </div>
    </header>
  );
}
