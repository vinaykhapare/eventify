import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft, LogIn } from "lucide-react";

const BRAND = {
  grad:   "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:  "linear-gradient(90deg,  #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:  "#D4607A",
  purple: "#534AB7",
  border: "#EDD9F0",
  coralSurface:  "#FDF0F3",
  purpleSurface: "#F3F0FD",
};

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        {/* Big 403 */}
        <div
          className="text-[120px] sm:text-[160px] font-black leading-none select-none"
          style={{
            background: BRAND.gradH,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.12,
          }}
        >
          403
        </div>

        {/* Shield icon */}
        <div className="flex justify-center -mt-8 mb-6">
          <div
            className="size-16 rounded-2xl flex items-center justify-center border"
            style={{ background: BRAND.coralSurface, borderColor: "#F0BBCA" }}
          >
            <ShieldOff size={30} style={{ color: BRAND.coral }} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Access denied
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
          You don't have permission to view this page.
          Please log in with an authorised account.
        </p>

        {/* Accent line */}
        <div className="flex justify-center mb-8">
          <div className="h-1 w-16 rounded-full" style={{ background: BRAND.gradH }} />
        </div>

        {/* Role hint card */}
        <div
          className="rounded-2xl p-4 mb-8 border text-left"
          style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND.purple }}>
            Available roles
          </p>
          <div className="flex flex-wrap gap-2">
            {["Admin", "Student", "Volunteer"].map(role => (
              <span
                key={role}
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{ background: "white", color: BRAND.purple, borderColor: "#C4BBF0" }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95"
            style={{ background: BRAND.purpleSurface, color: BRAND.purple, borderColor: "#C4BBF0" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EAE5FB"; }}
            onMouseLeave={e => { e.currentTarget.style.background = BRAND.purpleSurface; }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
            style={{ background: BRAND.grad, boxShadow: "0 4px 14px rgba(212,96,122,0.35)" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,96,122,0.35)"; }}
          >
            <LogIn size={16} /> Login
          </button>
        </div>

        <p className="mt-10 text-xs text-gray-300 tracking-widest uppercase">
          Eventify · College Event Management
        </p>
      </div>
    </div>
  );
}