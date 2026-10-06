import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
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
  Ticket,
  X,
  UserCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../../api/authApi";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useTheme } from "../../hooks/useTheme";
import BrandLogo from "../../components/common/BrandLogo";

export default function Signup() {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");
  const confirmPasswordValue = watch("confirmPassword", "");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setServerError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setServerError("");
      const res = await signupUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: "STUDENT",
      });
      login(res);
      navigate("/events");
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300 relative overflow-hidden">
      {/* ──────────────────────────────────────────────────────────
          LEFT PANEL: Showcase & Visual Experience (Desktop / Tablet)
          Identical Architecture to Login for Brand Consistency
      ──────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] relative bg-[#0B0F19] text-white flex-col justify-between p-10 xl:p-14 border-r border-slate-800/80 overflow-hidden">
        {/* Subtle Architectural Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B18_1px,transparent_1px),linear-gradient(to_bottom,#1E293B18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

        {/* Ambient Gradient Highlights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

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

        {/* Centerpiece: Platform Capability Highlights */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
          {/* Main Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Student & Participant Network</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl xl:text-4xl tracking-tight leading-tight text-white">
              Join your campus event community.
            </h1>
            <p className="text-sm xl:text-base text-slate-400 leading-relaxed max-w-lg">
              Register once with your student email to reserve verified tickets, attend college hackathons, and collaborate on campus festivals.
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
          RIGHT PANEL: Focused Registration Form
      ──────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 overflow-y-auto">
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

          {/* Right Controls: Theme Toggle & Sign in link */}
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
              to="/login"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
            >
              <span>Sign in</span>
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
                <UserCheck size={11} className="text-indigo-500" />
                <span>Student & Participant Portal</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
                Create an account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Register to explore upcoming campus events, reserve seats, and generate digital tickets.
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
                  />
                  <input
                    type="text"
                    autoComplete="name"
                    {...register("name", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                    })}
                    placeholder="Jane Doe"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-150 ${
                      errors.name
                        ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 shadow-2xs"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Institutional Email
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters required" },
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                    })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all duration-150 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPasswordValue && confirmPasswordValue === passwordValue && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={13} /> Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="size-4 mt-0.5 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 cursor-pointer"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                    Campus Event Guidelines
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-lg shadow-slate-950/10 dark:shadow-white/5 active:scale-[0.99] disabled:opacity-50 transition-all duration-150 mt-3 group cursor-pointer"
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-150 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer Sign in Prompt */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in here
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
    </div>
  );
}