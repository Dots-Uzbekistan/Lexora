import Link from "next/link";
import { cn } from "../lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Home as HomeIcon,
  PlusSquare,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Trash2,
  LogOut,
  Rocket,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "New project", href: "/projects/new", icon: PlusSquare },
  { label: "Search", href: "/search", icon: SearchIcon },
  { label: "Advanced Tools", href: "/tools", icon: Rocket },
];

const footerItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: SettingsIcon },
  { label: "Trash", href: "/trash", icon: Trash2 },
  { label: "Log out", href: "/logout", icon: LogOut },
];

export default function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "bg-neutral-900 text-neutral-100 w-60 shrink-0 flex flex-col gap-6 py-6 px-4",
        className
      )}
    >
      <header className="flex items-center gap-2 px-2 mb-4 select-none">
        <div className="w-6 h-6 rounded bg-neutral-700" />
        <span className="font-medium text-sm leading-none truncate">
          Name Surname
        </span>
      </header>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Recent projects */}
      <div className="mt-8 flex flex-col gap-1 text-sm text-neutral-400 flex-1 overflow-y-auto">
        <p className="uppercase text-xs font-semibold mb-2 text-neutral-500">
          Recent projects
        </p>

        {/* TODO: replace with real data fetched from API */}
        {(() => {
          const projects: { id: string; name: string }[] = [];
          if (projects.length === 0) {
            return (
              <span className="px-3 py-1.5 text-neutral-500">
                No projects yet
              </span>
            );
          }
          return projects.map((p) => (
            <button
              key={p.id}
              className="text-left px-3 py-1.5 rounded hover:bg-neutral-800"
            >
              {p.name}
            </button>
          ));
        })()}
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-1 text-sm text-neutral-400">
        {footerItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
