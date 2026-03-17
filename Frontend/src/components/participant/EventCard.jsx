import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Users, ArrowRight, Ticket } from "lucide-react";

const BRAND = {
  grad:   "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:  "linear-gradient(90deg,  #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:  "#D4607A",
  purple: "#534AB7",
  purpleSurface: "#F3F0FD",
  border: "#EDD9F0",
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(event.startTime).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const isFree = event.entryFee === 0;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: BRAND.border, boxShadow: "0 2px 12px rgba(212,96,122,0.07)" }}
    >
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.bannerImageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        {/* Entry fee badge — bottom left of banner */}
        <div className="absolute bottom-3 left-3">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black text-white"
            style={{ background: isFree ? "#1D9E75" : BRAND.grad }}
          >
            {isFree ? "Free Entry" : `₹${event.entryFee}`}
          </span>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Title */}
        <h3 className="text-base font-black text-gray-900 leading-snug line-clamp-2">
          {event.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5">
          {[
            { icon: <CalendarDays size={13} />, label: formattedDate },
            { icon: <MapPin size={13} />,       label: event.venue },
            { icon: <Users size={13} />,        label: `Team: ${event.teamSize?.min} – ${event.teamSize?.max}` },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
              <span style={{ color: BRAND.coral }}>{icon}</span>
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor: BRAND.border }}>
          <button
            onClick={() => navigate(`/events/${event._id}`)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-black text-white transition-all duration-200 active:scale-95"
            style={{ background: BRAND.grad, boxShadow: "0 4px 12px rgba(212,96,122,0.3)" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 18px rgba(83,74,183,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(212,96,122,0.3)"; }}
          >
            View & Register <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;