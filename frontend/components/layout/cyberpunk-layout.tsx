"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Activity,
  Brain,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Interfaces
interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface CyberpunkLayoutProps {
  children: React.ReactNode;
}

// Constants
const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Personnel", href: "/personnel" },
  { icon: Activity, label: "Analytics", href: "/analytics" },
  { icon: Brain, label: "AI Insights", href: "/insights" },
  { icon: Zap, label: "Performance", href: "/performance" },
  { icon: Settings, label: "Settings", href: "/settings" },
] as const;

// Subcomponents
function Logo({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="px-4 mb-8">
      <motion.div
        className={cn(
          "flex items-center gap-3",
          "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400",
          "font-bold text-xl"
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          className="whitespace-nowrap"
        >
          Luminus.ai
        </motion.span>
      </motion.div>
    </div>
  );
}

function NavButton({
  item,
  isActive,
  isExpanded,
  onSelect,
}: {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
        "transition-all duration-300",
        "hover:bg-white/10",
        isActive
          ? "bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30"
          : "border border-transparent"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <item.icon
        className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive ? "text-purple-400" : "text-gray-400"
        )}
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0 }}
        className={cn(
          "whitespace-nowrap text-sm",
          isActive ? "text-white" : "text-gray-400"
        )}
      >
        {item.label}
      </motion.span>
      {isActive && isExpanded && (
        <ChevronRight className="w-4 h-4 text-purple-400 ml-auto" />
      )}
    </motion.button>
  );
}

function StatusIndicator({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="px-4 mt-auto">
      <div
        className={cn(
          "p-3 rounded-xl",
          "bg-gradient-to-r from-purple-500/10 to-teal-500/10",
          "border border-purple-500/20"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            className="text-xs text-gray-400"
          >
            AI Engine Online
          </motion.span>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function CyberpunkLayout({ children }: CyberpunkLayoutProps) {
  const [activeItem, setActiveItem] = useState("/");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);
  const handleNavSelect = (href: string) => setActiveItem(href);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Glassmorphism Sidebar */}
      <motion.aside
        initial={{ width: 80 }}
        animate={{ width: isExpanded ? 240 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed left-0 top-0 h-full z-50",
          "bg-white/5 backdrop-blur-xl",
          "border-r border-white/10",
          "flex flex-col py-6"
        )}
      >
        <Logo isExpanded={isExpanded} />

        <nav className="flex-1 px-3">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavButton
                  item={item}
                  isActive={activeItem === item.href}
                  isExpanded={isExpanded}
                  onSelect={() => handleNavSelect(item.href)}
                />
              </li>
            ))}
          </ul>
        </nav>

        <StatusIndicator isExpanded={isExpanded} />
      </motion.aside>

      {/* Main Content Area */}
      <main
        className={cn(
          "relative z-10 transition-all duration-300",
          isExpanded ? "ml-[240px]" : "ml-[80px]",
          "p-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default CyberpunkLayout;
