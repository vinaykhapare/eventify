import React from "react";
import { CalendarDays, MapPin, ScanLine, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const startDate = new Date(event.startTime);
  const status = event.status || "UPCOMING";

  const isLive = status === "LIVE";
  const isUpcoming = status === "UPCOMING";

  const checkedIn = event.totalCheckedIn || 0;
  const max = event.maxParticipants || 100;
  const progress = Math.min((checkedIn / max) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Cover Media */}
      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
        {event.bannerImageUrl ? (
          <img
            src={event.bannerImageUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-xs">
            No Cover Banner
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
            isLive
              ? "bg-emerald-500/90 text-white"
              : isUpcoming
              ? "bg-indigo-600/90 text-white"
              : "bg-slate-800/80 text-slate-300"
          }`}
        >
          {isLive && <span className="size-1.5 rounded-full bg-white animate-ping" />}
          {isLive ? "Live Shift" : status}
        </span>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {event.name}
          </h3>

          <div className="mt-2.5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-2">
              <CalendarDays size={14} className="text-indigo-500 shrink-0" />
              <span>
                {startDate.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {" • "}
                {startDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>
        </div>

        {/* Capacity / Check-in progress */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Users size={12} /> Checked In
            </span>
            <span>
              <strong className="text-slate-900 dark:text-white">{checkedIn}</strong> / {max}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLive ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Launch QR Scanner */}
        <button
          onClick={() => navigate(`/scan/${event._id}`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <ScanLine size={16} /> Open QR Check-in Station
        </button>
      </div>
    </motion.div>
  );
}
