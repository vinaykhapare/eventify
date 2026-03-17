import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const BRAND = {
  grad:   "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:  "linear-gradient(90deg,  #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:  "#D4607A",
  purple: "#534AB7",
  border: "#EDD9F0",
  purpleSurface: "#F3F0FD",
};

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        {/* Big 404 number */}
        <div
          className="text-[120px] sm:text-[160px] font-black leading-none select-none"
          style={{
            background: BRAND.gradH,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.15,
          }}
        >
          404
        </div>

        {/* Hex logo mark */}
        <div className="flex justify-center -mt-8 mb-6">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#D4607A" />
                <stop offset="50%"  stopColor="#8B5CB7" />
                <stop offset="100%" stopColor="#534AB7" />
              </linearGradient>
            </defs>
            <path d="M32 4 L58 18 L58 46 L32 60 L6 46 L6 18 Z" fill="url(#pg)" opacity="0.15" />
            <path d="M32 4 L58 18 L58 46 L32 60 L6 46 L6 18 Z" fill="none" stroke="url(#pg)" strokeWidth="2"/>
            <text x="32" y="42" textAnchor="middle" fill="url(#pg)"
              fontSize="28" fontWeight="700" fontFamily="Georgia, serif">?</text>
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Accent line */}
        <div className="flex justify-center mb-8">
          <div className="h-1 w-16 rounded-full" style={{ background: BRAND.gradH }} />
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
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
            style={{ background: BRAND.grad, boxShadow: "0 4px 14px rgba(212,96,122,0.35)" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,96,122,0.35)"; }}
          >
            <Home size={16} /> Go Home
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-xs text-gray-300 tracking-widest uppercase">
          Eventify · College Event Management
        </p>
      </div>
    </div>
  );
}