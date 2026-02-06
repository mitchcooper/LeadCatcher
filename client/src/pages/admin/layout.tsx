import { Link, useLocation } from "wouter";
import { type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

// =============================================================================
// NAVIGATION ITEMS
// =============================================================================

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Landing Pages", icon: FileText },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-semibold">LeadConverter</span>
          </Link>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">LeadConverter v1.0</p>
        </div>
      </aside>
    </>
  );
}

// =============================================================================
// HEADER COMPONENT
// =============================================================================

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-16 bg-white border-b px-4 flex items-center justify-between">
      <button className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank">
            View Site
          </Link>
        </Button>
      </div>
    </header>
  );
}

// =============================================================================
// ADMIN LAYOUT
// =============================================================================

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminLayout({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {(title || actions) && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  )}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
