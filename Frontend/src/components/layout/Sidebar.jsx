import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ticket,
  BarChart3,
  MessageSquare,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  PlusCircle,
  CalendarCheck2,
  X,
} from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useTheme } from "../../hooks/useTheme";
import BrandLogo from "../common/BrandLogo";

export default function Sidebar({ isOpen, setIsOpen, isMobile, closeMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();

  const role = auth?.user?.role || "STUDENT";
  const user = auth?.user || { name: "User", email: "user@eventify.com", role: "STUDENT" };

  const handleLogout = () => {
    logout();
    if (isMobile && closeMobile) closeMobile();
    navigate("/login");
  };

  // Structured navigation items as strictly requested:
  // Dashboard, Events, Attendees, Tickets, Analytics, Messages, Settings, Profile
  const getNavItems = () => {
    const items = [
      {
        to: role === "ADMIN" ? "/admin/dashboard" : role === "VOLUNTEER" ? "/assigned-events" : "/events",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "STUDENT", "VOLUNTEER"],
      },
      {
        to: "/events",
        label: "Events",
        icon: CalendarDays,
        roles: ["ADMIN", "STUDENT", "VOLUNTEER"],
      },
      {
        to: "/admin/participants",
        label: "Attendees",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        to: "/my-ticket",
        label: "Tickets",
        icon: Ticket,
        roles: ["ADMIN", "STUDENT"],
      },
      {
        to: "/admin/analytics",
        label: "Analytics",
        icon: BarChart3,
        badge: "Live",
        roles: ["ADMIN"],
      },
      {
        to: "/messages",
        label: "Messages",
        icon: MessageSquare,
        roles: ["ADMIN", "STUDENT", "VOLUNTEER"],
      },
      {
        to: "/settings",
        label: "Settings",
        icon: Settings,
        roles: ["ADMIN", "STUDENT", "VOLUNTEER"],
      },
      {
        to: role === "ADMIN" ? "/admin/profile" : "/profile",
        label: "Profile",
        icon: User,
        roles: ["ADMIN", "STUDENT", "VOLUNTEER"],
      },
    ];

    return items.filter((item) => item.roles.includes(role));
  };

  const navItems = getNavItems();

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-white dark:bg-[#1E293B] border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 z-30 select-none ${
        isOpen ? "w-64" : "w-18"
      }`}
    >
      {/* ── Top Header Section (Clean spacing in both open and collapsed states) ── */}
      <div
        className={`flex items-center h-16 border-b border-slate-200/80 dark:border-slate-800 px-3 ${
          isOpen ? "justify-between" : "justify-center"
        }`}
      >
        <Link
          to="/"
          onClick={isMobile ? closeMobile : undefined}
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
        >
          <BrandLogo showText={isOpen} />
        </Link>

        {/* Desktop Collapse / Expand Toggle Button */}
        {!isMobile && isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* When collapsed on desktop, show a clean expand toggle button underneath header */}
      {!isMobile && !isOpen && (
        <div className="flex justify-center py-2 border-b border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => setIsOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Main Navigation Links ── */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {isOpen && (
          <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
            Main Menu
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={isMobile ? closeMobile : undefined}
              title={!isOpen ? item.label : undefined}
              className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                isOpen
                  ? "gap-3 px-3 py-2.5"
                  : "justify-center p-2.5 w-11 mx-auto"
              } ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform duration-150 ${
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:scale-110"
                }`}
              />

              {isOpen && (
                <span className="truncate flex-1 font-medium">{item.label}</span>
              )}

              {isOpen && item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Bottom Section: Theme Switcher & Profile Card ── */}
      <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className={`flex items-center rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isOpen ? "w-full gap-3 px-3 py-2" : "justify-center w-11 h-9 mx-auto"
          }`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400 shrink-0" />
          ) : (
            <Moon size={18} className="text-indigo-600 shrink-0" />
          )}
          {isOpen && (
            <span className="flex-1 text-left font-medium">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* Profile Card */}
        <div
          className={`flex items-center rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 ${
            isOpen ? "p-2 gap-2.5" : "justify-center p-1.5 w-11 mx-auto"
          }`}
        >
          <Link
            to={role === "ADMIN" ? "/admin/profile" : "/profile"}
            onClick={isMobile ? closeMobile : undefined}
            title={!isOpen ? `${user.name} (View Profile)` : undefined}
            className="flex items-center gap-2.5 flex-1 min-w-0 group"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="size-8 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="size-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(user.name)}
              </div>
            )}

            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </Link>

          {isOpen && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
