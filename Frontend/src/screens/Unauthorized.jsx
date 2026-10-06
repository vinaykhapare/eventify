import { useNavigate, Link } from "react-router-dom";
import { ShieldOff, ArrowLeft, LogIn, Lock } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-200 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Watermark 403 */}
      <div className="text-[140px] sm:text-[180px] font-black leading-none text-slate-200/80 dark:text-slate-800/80 select-none -mb-16">
        403
      </div>

      <div className="z-10 max-w-md space-y-4">
        <div className="size-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
          <ShieldOff size={28} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Access Restricted
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          You don't have administrative clearance to access this station. Please sign in with an account having appropriate role permissions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <LogIn size={14} /> Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}