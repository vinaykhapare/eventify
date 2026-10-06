import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Ticket,
  Clock,
} from "lucide-react";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const now = new Date();

  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;

  let statusBadge = {
    label: "Upcoming",
    class: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50",
  };

  if (now >= startDate && now <= endDate) {
    statusBadge = {
      label: "Live Now",
      class: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    };
  } else if (now > endDate) {
    statusBadge = {
      label: "Completed",
      class: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
  }

  const isFree = !event.entryFee || event.entryFee === 0;
  const registeredCount = event.registrationsCount || 0;
  const maxCapacity = event.maxParticipants || 100;
  const fillPercentage = Math.min(Math.round((registeredCount / maxCapacity) * 100), 100);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden"
    >
      {/* ── Event Cover Image & Badges ── */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={
            event.bannerImageUrl ||
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
          }
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border backdrop-blur-md shadow-2xs ${statusBadge.class}`}
          >
            {statusBadge.label === "Live Now" && (
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
            {statusBadge.label}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md border border-white/20 shadow-xs">
            {isFree ? (
              <span className="text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              <span>₹{event.entryFee}</span>
            )}
          </span>
        </div>

        {/* Bottom Banner Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
          <span className="flex items-center gap-1.5 font-medium backdrop-blur-xs bg-slate-900/40 px-2 py-0.5 rounded-md">
            <CalendarDays size={13} className="text-indigo-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 font-medium backdrop-blur-xs bg-slate-900/40 px-2 py-0.5 rounded-md">
            <Clock size={13} className="text-indigo-400" />
            {formattedTime}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Title */}
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {event.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Venue & Capacity */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.venue || "Campus Auditorium"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Users size={14} className="text-slate-400 shrink-0" />
            <span>
              Team Size: {event.teamSize?.min || 1} – {event.teamSize?.max || 1} members
            </span>
          </div>

          {/* Registration Progress */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>{registeredCount} registered</span>
              <span>{fillPercentage}% filled</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  fillPercentage >= 100
                    ? "bg-rose-500"
                    : fillPercentage >= 80
                    ? "bg-amber-500"
                    : "bg-indigo-600 dark:bg-indigo-500"
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Action Button ── */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => navigate(`/events/${event._id}`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all duration-200 group/btn"
          >
            <span>View Event & Register</span>
            <ArrowRight
              size={14}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}