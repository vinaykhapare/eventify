import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Ticket,
  Users,
  Compass,
  QrCode,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useTheme } from "../hooks/useTheme";
import BrandLogo from "../components/common/BrandLogo";

export default function Landing() {
  const { isAuthenticated, auth } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();

  const role = auth?.user?.role;
  const dashboardPath =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "VOLUNTEER"
      ? "/assigned-events"
      : "/events";

  const stats = [
    { label: "Campus Participants", value: "48,000+", change: "+24% YoY" },
    { label: "Events & Hackathons", value: "120+", change: "All Verified" },
    { label: "Scanner Gate Ingress", value: "< 0.4s", change: "Sub-Second" },
    { label: "Collegiate Organizations", value: "50+", change: "Active Clubs" },
  ];

  const features = [
    {
      icon: <Compass size={22} className="text-indigo-600 dark:text-indigo-400" />,
      title: "Campus Event Discovery",
      description:
        "Filter and RSVP across engineering hackathons, design workshops, and guest lectures with real-time seat tracking.",
      tag: "Discovery Engine",
    },
    {
      icon: <Ticket size={22} className="text-purple-600 dark:text-purple-400" />,
      title: "Dynamic QR Passes",
      description:
        "Instant digital passes generated upon registration, stored in your student hub and ready for offline gate presentation.",
      tag: "Tamper Proof",
    },
    {
      icon: <QrCode size={22} className="text-emerald-600 dark:text-emerald-400" />,
      title: "High-Throughput Ingress",
      description:
        "Camera-based volunteer scanner verifying student passes in under 400ms, eliminating entry lines at campus arenas.",
      tag: "Live Gate Sync",
    },
    {
      icon: <BarChart3 size={22} className="text-blue-600 dark:text-blue-400" />,
      title: "Real-Time Telemetry",
      description:
        "Live attendance capacity meters, revenue tracking, and automated check-in timestamps for organizing committees.",
      tag: "Coordinator Tools",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300 relative overflow-hidden">
      {/* ── Background Subtle Geometry ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1E293B18_1px,transparent_1px),linear-gradient(to_bottom,#1E293B18_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40 dark:opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[42rem] h-[24rem] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── Sticky Navigation Header ── */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-[#0B0F19]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="focus:outline-none">
            <BrandLogo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs transition-all active:scale-[0.99]"
              >
                <span>Dashboard</span>
                <ChevronRight size={14} />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.99]"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Release / Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6 backdrop-blur-sm"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Campus Operating System v2.4</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">Live for Fall 2026</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.15]"
        >
          Where campus events <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            come alive with precision.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-5 max-w-2xl mx-auto leading-relaxed"
        >
          Eventify connects students, campus clubs, and university boards onto a unified platform for effortless RSVPs, digital passes, and zero-latency check-ins.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8"
        >
          <Link
            to={isAuthenticated ? "/events" : "/signup"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-lg shadow-slate-950/10 dark:shadow-white/5 active:scale-[0.99] transition-all group"
          >
            <span>Explore Campus Events</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-semibold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-xs transition-all"
          >
            <span>Institutional Sign In</span>
          </Link>
        </motion.div>
      </section>

      {/* ── Statistics Bar ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-slate-800/80 shadow-md">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`space-y-1 ${
                i !== 0 ? "sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-6" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </span>
              </div>
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upgraded Feature Cards Section ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
            <Zap size={12} className="text-amber-500" />
            <span>Core Architecture</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
            Engineered for high-density campus life.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From classroom seminars to stadium hackathons, every tool is designed for clarity and velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group p-6 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Learn more</span>
                <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bottom Call To Action ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-[#151D2E] text-white p-8 sm:p-12 border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
              Ready to attend your next campus event?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Create an account with your university email or sign in to view your tickets.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/signup"
              className="px-5 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo showText={true} size="sm" />
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Collegiate Event Management</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Campus SSO Ready</span>
            <span>•</span>
            <span>256-bit TLS</span>
            <span>•</span>
            <span>Privacy Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
