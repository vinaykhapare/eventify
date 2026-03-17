import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginUser } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../../../hooks/useAuthContext";

// ── Shared input class builder ─────────────────────────────────────────────────
const inputClass = (hasError) =>
  `w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-xl outline-none transition-all duration-200 bg-white text-sm ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
      : "border-gray-200 focus:border-[#D4607A] focus:ring-4 focus:ring-[#D4607A]/10"
  }`;

export default function Login() {
  const [serverError, setServerError]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const navigate    = useNavigate();
  const { login }   = useAuthContext();

  const { register, watch, handleSubmit, formState: { errors } } = useForm();
  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");
      const res = await loginUser(data);
      login(res);
      if (res.user.role === "ADMIN")          navigate("/admin/dashboard");
      else if (res.user.role === "STUDENT")   navigate("/events");
      else                                    navigate("/assigned-events");
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#FDF0F3] via-[#F5F0FD] to-[#EEF0FD] px-3 sm:px-4 py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-md">

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)" }} />

          <div className="p-6 sm:p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Hex logo mark */}
              <div className="inline-flex items-center justify-center mb-4">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <defs>
                    <linearGradient id="lhg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                      <stop offset="0%"   stopColor="#D4607A"/>
                      <stop offset="50%"  stopColor="#8B5CB7"/>
                      <stop offset="100%" stopColor="#534AB7"/>
                    </linearGradient>
                  </defs>
                  <path d="M28 3 L51 16 L51 40 L28 53 L5 40 L5 16 Z" fill="url(#lhg)"/>
                  <path d="M28 7 L47 18 L47 38 L28 49 L9 38 L9 18 Z" fill="white" fillOpacity="0.07"/>
                  <text x="28" y="37" textAnchor="middle" fill="white" fontSize="26" fontWeight="700"
                    fontFamily="Georgia, 'Times New Roman', serif" opacity="0.95">E</text>
                  <circle cx="44" cy="11" r="4" fill="#F5A623"/>
                  <circle cx="44" cy="11" r="2" fill="white" fillOpacity="0.55"/>
                </svg>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-bold mb-1.5"
                style={{
                  background: "linear-gradient(90deg, #D4607A 0%, #6B5EC7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              >
                Welcome Back
              </h1>
              <p className="text-sm text-gray-500">Login to continue to Eventify</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 tracking-wide uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 ${errors.email ? "text-red-400" : "text-gray-400"}`} size={18}/>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass(errors.email)}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
                    })}
                  />
                  {errors.email && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-red-400" size={18}/>}
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
                    <AlertCircle size={13}/> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? "text-red-400" : "text-gray-400"}`} size={18}/>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputClass(errors.password)} pr-12`}
                    {...register("password", { required: "Password is required" })}
                  />
                  {passwordValue.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  )}
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
                    <AlertCircle size={13}/> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="shrink-0 mt-0.5" size={16}/>
                  <div>
                    <p className="text-xs font-bold">Login Failed</p>
                    <p className="text-xs mt-0.5">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{
                  background: "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
                  boxShadow: "0 4px 18px rgba(212,96,122,0.35)",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 6px 24px rgba(107,94,199,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(212,96,122,0.35)"; }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn size={16}/> Login
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold transition-colors"
                style={{ color: "#D4607A" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#6B5EC7"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#D4607A"; }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-gray-400 mt-5 tracking-widest uppercase">
          Eventify · College Event Management
        </p>
      </div>
    </div>
  );
}