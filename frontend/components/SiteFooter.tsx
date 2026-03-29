import type { HTMLAttributes } from "react";

type SiteFooterProps = HTMLAttributes<HTMLElement>;

export default function SiteFooter({ className = "", ...props }: SiteFooterProps) {
  return (
    <footer
      className={`w-full px-6 py-6 text-center text-sm text-gray-500 ${className}`.trim()}
      {...props}
    >
      <p>&copy; 2026 DreamWork. Frontend build.</p>
    </footer>
  );
}
