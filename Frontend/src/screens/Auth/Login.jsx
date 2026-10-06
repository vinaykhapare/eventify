import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Users,
  KeyRound,
  X,
  Ticket,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useTheme } from "../../hooks/useTheme";
import BrandLogo from "../../components/common/BrandLogo";

export default function Login() {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");
      const res = await loginUser({
        email: data.email.trim(),
        password: data.password,
      });

      login(res);

      if (res.user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (res.user?.role === "STUDENT") {
        navigate("/events");
      } else {
        navigate("/assigned-events");
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300 relative overflow-hidden">
      {/* ──────────────────────────────────────────────────────────
          LEFT PANEL: Showcase & Visual Experience (Desktop / Tablet)
          Inspired by Linear & Stripe Studio Aesthetics
      ──────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] relative bg-[#0B0F19] text-white flex-col justify-between p-10 xl:p-14 border-r border-slate-800/80 overflow-hidden">
        {/* Subtle Architectural Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B18_1px,transparent_1px),linear-gradient(to_bottom,#1E293B18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

        {/* Ambient Gradient Highlights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="focus:outline-none">
            <BrandLogo size="lg" />
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 text-xs font-semibold text-slate-300 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Campus Network Active</span>
          </div>
        </div>

        {/* Centerpiece: Visual Composition & Live Mockup Cards */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
          {/* Main Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Unified Campus Platform</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl xl:text-4xl tracking-tight leading-tight text-white">
              The modern standard for college event management.
            </h1>
            <p className="text-sm xl:text-base text-slate-400 leading-relaxed max-w-lg">
              Manage registrations, coordinate student check-ins, and inspect live venue analytics with zero friction across campus.
            </p>
          </div>

          {/* Platform Capability Highlights */}
          <div className="relative pt-2 space-y-3.5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3.5 hover:border-slate-700/80 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                <Ticket size={18} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-heading font-bold text-white tracking-wide uppercase">
                  Digital Pass Architecture
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically signed dynamic QR passes linked directly to your student credentials.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3.5 hover:border-slate-700/80 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <Zap size={18} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-heading font-bold text-white tracking-wide uppercase">
                  Sub-Second Gate Ingress
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast camera scan verification ensuring zero queues during peak arena and auditorium entries.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3.5 hover:border-slate-700/80 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-heading font-bold text-white tracking-wide uppercase">
                  Institutional Security & SSO
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Role-segmented access control for participants, event volunteers, and administrative boards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Proof Quote */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <p className="truncate">
            Trusted by student affairs councils, club leads, and event coordinators.
          </p>
          <span className="font-mono text-[11px] text-slate-500 shrink-0">v2.4.0</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          RIGHT PANEL: Focused Authentication Form
      ──────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10">
        {/* Navigation & Controls Bar */}
        <div className="flex items-center justify-between w-full">
          {/* Mobile Brand Mark */}
          <div className="lg:hidden">
            <Link to="/" className="focus:outline-none">
              <BrandLogo size="md" />
            </Link>
          </div>

          {/* Desktop Back Link */}
          <div className="hidden lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to home</span>
            </Link>
          </div>

          {/* Right Controls: Theme Toggle & Sign up link */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            <Link
              to="/signup"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
            >
              <span>Create account</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Center Form Card */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header Titles */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Lock size={11} className="text-indigo-500" />
                <span>Institutional Portal</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Enter your university or administrative credentials to proceed.
              </p>
            </div>

            {/* Server Error Alert */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3 font-medium"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle size={16} className="shrink-0 text-rose-500" />
                    <span className="truncate">{serverError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServerError("")}
                    className="p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    placeholder="name@university.edu"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-150 ${
                      errors.email
                        ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 shadow-2xs"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-150 ${
                      errors.password
                        ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 shadow-2xs"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Device & Security indicator */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember this browser
                  </span>
                </label>

                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>256-bit TLS</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-lg shadow-slate-950/10 dark:shadow-white/5 active:scale-[0.99] disabled:opacity-60 transition-all duration-150 mt-3 group cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Eventify</span>
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-150 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Prompt */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have a campus account yet?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Security & System Info Footer */}
        <div className="w-full text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <p>Campus Single Sign-On & Identity Directory</p>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Privacy Notice
            </span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Security Compliance
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          FORGOT PASSWORD MODAL (Accessible, Institutional Recovery)
      ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                      Password Recovery
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Campus Directory Assistance
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {forgotSent ? (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Recovery Instructions Sent
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      If an account exists for <span className="font-mono font-bold">{forgotEmail}</span>, password reset instructions have been forwarded to that mailbox.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition-colors"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter your registered university email address. We will verify your campus identity and send you a secure password reset link.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Campus Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}