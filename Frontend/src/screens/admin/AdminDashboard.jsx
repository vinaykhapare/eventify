import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Search, Ticket, Trash2, Users, HandHeart, IndianRupee,
  Code, Bot, Terminal, Gamepad2, Mic, AlertTriangle,
  CheckCircle2, Calendar, MapPin, Clock,
} from "lucide-react";

// ── Brand tokens ───────────────────────────────────────────────────────────────
const BRAND = {
  grad:    "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:   "linear-gradient(90deg,  #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:   "#D4607A",
  purple:  "#534AB7",
  amber:   "#F5A623",
  coralSurface:  "#FDF0F3",
  purpleSurface: "#F3F0FD",
  border:  "#EDD9F0",
};

// ── Status tag styles (replaces blue/gray defaults) ────────────────────────────
const TAG_STYLES = {
  "Live Now":  { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "Upcoming":  { bg: BRAND.purpleSurface, text: BRAND.purple, border: "#C4BBF0" },
  "Completed": { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
};

// ── Progress bar color ─────────────────────────────────────────────────────────
const progressColor = (pct) =>
  pct >= 100 ? "#1D9E75" : BRAND.coral;

const AdminDashboard = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const [searchQuery, setSearchQuery] = useState("");

  const [statsData, setStatsData] = useState({
    totalRegistrations: 0,
    liveAttendance:     0,
    volunteersActive:   0,
    revenueCollected:   0,
  });
  const [events, setEvents] = useState([]);

  // ── Delete handler ────────────────────────────────────────────────────────────
  const handleDeleteEvent = async (eventId) => {
    try {
      const auth  = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      if (!token) { alert("Login required!"); return; }
      if (!window.confirm("Are you sure you want to delete this event?")) return;

      await axios.delete(`${baseURL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(prev => prev.filter(e => e.id !== eventId));
      alert("Event deleted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete event!");
    }
  };

  // ── Fetch data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const auth  = JSON.parse(localStorage.getItem("auth"));
        const token = auth?.token;
        if (!token) return;

        const [statsRes, eventsRes] = await Promise.all([
          axios.get(`${baseURL}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${baseURL}/events`,           { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setStatsData(statsRes.data);

        const formattedEvents = eventsRes.data.events.map((event) => {
          const start = new Date(event.startTime);
          const end   = new Date(event.endTime);
          const now   = new Date();

          let tag = "Upcoming";
          if (now >= start && now <= end) tag = "Live Now";
          else if (now > end)             tag = "Completed";

          const registered = event.registrationsCount || 0;
          const target     = event.maxParticipants   || 0;
          const progress   = target > 0 ? Math.min((registered / target) * 100, 100) : 0;

          let note = "", noteIcon = null, noteColor = "";
          if (target > 0 && registered >= target) {
            note = "Full Capacity"; noteIcon = CheckCircle2; noteColor = "#1D9E75";
          } else if (target > 0 && target - registered <= 20) {
            note = `Only ${target - registered} spots left`; noteIcon = AlertTriangle; noteColor = "#D97706";
          }

          const name = (event.name || "").toLowerCase();
          let icon = Ticket, iconBg = BRAND.purpleSurface, iconColor = BRAND.purple;

          if (name.includes("hack") || name.includes("code")) { icon = Code;     iconBg = BRAND.purpleSurface; iconColor = BRAND.purple;  }
          else if (name.includes("robo"))                      { icon = Bot;      iconBg = "#FDF0F3";           iconColor = BRAND.coral;   }
          else if (name.includes("contest"))                   { icon = Terminal;  iconBg = "#FEF6EC";           iconColor = "#C47A1A";     }
          else if (name.includes("game"))                      { icon = Gamepad2; iconBg = "#FDF0F3";           iconColor = BRAND.coral;   }
          else if (name.includes("lecture"))                   { icon = Mic;      iconBg = "#E1F5EE";           iconColor = "#0F6E56";     }

          return {
            id: event._id, title: event.name, tag,
            date: start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            time: `${start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} – ${end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`,
            venue: event.venue, registered, target,
            progress: Math.round(progress),
            note, noteIcon, noteColor,
            icon, iconBg, iconColor,
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // ── Stats config ──────────────────────────────────────────────────────────────
  const stats = [
    {
      title: "Total Registrations",
      value: statsData.totalRegistrations.toLocaleString("en-IN"),
      icon: Ticket,
      bg: BRAND.purpleSurface, color: BRAND.purple,
      glow: "rgba(83,74,183,0.15)",
    },
    {
      title: "Live Attendance",
      value: statsData.liveAttendance.toLocaleString("en-IN"),
      icon: Users,
      bg: BRAND.coralSurface, color: BRAND.coral,
      glow: "rgba(212,96,122,0.15)",
    },
    {
      title: "Volunteers Active",
      value: statsData.volunteersActive.toLocaleString("en-IN"),
      icon: HandHeart,
      bg: "#FEF6EC", color: "#C47A1A",
      glow: "rgba(239,159,39,0.15)",
    },
    {
      title: "Revenue Collected",
      value: `₹${statsData.revenueCollected.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      bg: "#ECFDF5", color: "#065F46",
      glow: "rgba(29,158,117,0.15)",
    },
  ];

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.tag.toLowerCase().includes(q)   ||
      e.venue.toLowerCase().includes(q) ||
      e.date.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  // ── Tag pill ──────────────────────────────────────────────────────────────────
  const TagPill = ({ tag }) => {
    const s = TAG_STYLES[tag] || TAG_STYLES["Upcoming"];
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
        style={{ background: s.bg, color: s.text, borderColor: s.border }}
      >
        {tag === "Live Now" && (
          <span className="relative flex h-1.5 w-1.5 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#1D9E75" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#1D9E75" }} />
          </span>
        )}
        {tag}
      </span>
    );
  };

  return (
    <div className="bg-[#faf8fc] min-h-screen text-slate-900">

      {/* ── Sticky top bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sticky top-0 z-40" style={{ borderColor: BRAND.border }}>

        {/* Desktop */}
        <div className="hidden sm:flex items-center justify-between gap-5 px-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg lg:text-xl font-black text-gray-900">Overview</h2>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm text-gray-400 font-medium">Admin Dashboard</span>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 bg-[#faf8fc] border-2 rounded-xl px-3 py-2 w-64 lg:w-80 transition-all duration-200"
            style={{ borderColor: BRAND.border }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = BRAND.coral; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; }}
            onBlurCapture={e  => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Search size={16} style={{ color: BRAND.coral, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-gray-900">Overview</h2>
          </div>
          <div
            className="flex items-center gap-2 bg-[#faf8fc] border-2 rounded-xl px-3 py-2"
            style={{ borderColor: BRAND.border }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = BRAND.coral; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,96,122,0.1)"; }}
            onBlurCapture={e  => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Search size={15} style={{ color: BRAND.coral }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-xs text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* ── Dashboard content ────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-5 lg:p-8 pb-16">

        {/* ── Stat cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-7">
          {stats.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                style={{ borderColor: BRAND.border }}
              >
                {/* Icon */}
                <div
                  className="size-10 rounded-xl flex items-center justify-center mb-3 border"
                  style={{ background: item.bg, borderColor: item.bg, color: item.color }}
                >
                  <Icon size={18} />
                </div>

                <p className="text-gray-500 text-xs font-semibold mb-1 leading-tight">{item.title}</p>

                <p
                  className="text-xl sm:text-2xl font-black"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Events table card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: BRAND.border }}>

          {/* Card header */}
          <div className="p-4 sm:p-5 lg:p-6 border-b flex items-center justify-between gap-4" style={{ borderColor: BRAND.border }}>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900">Events Overview</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Manage capacity and check details for today's schedule.
              </p>
            </div>
            {/* Result count pill */}
            <span
              className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shrink-0"
              style={{ background: BRAND.purpleSurface, color: BRAND.purple, borderColor: "#C4BBF0" }}
            >
              {filteredEvents.length} / {events.length}
            </span>
          </div>

          {/* Empty state */}
          {filteredEvents.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div
                className="size-14 rounded-2xl flex items-center justify-center border mb-4"
                style={{ background: BRAND.coralSurface, borderColor: "#F0BBCA" }}
              >
                <Search size={22} style={{ color: BRAND.coral }} />
              </div>
              <p className="font-black text-gray-900">No results found</p>
              <p className="text-gray-400 text-sm mt-1">
                No events match <span className="font-bold" style={{ color: BRAND.coral }}>"{searchQuery}"</span>
              </p>
            </div>
          ) : (
            <>
              {/* ── Desktop table ────────────────────────────────────────────── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr
                      className="text-xs uppercase tracking-wider font-bold"
                      style={{ background: BRAND.purpleSurface, color: BRAND.purple, borderBottom: `1px solid ${BRAND.border}` }}
                    >
                      {["Event Name", "Date & Time", "Venue", "Capacity Status", "Action"].map(h => (
                        <th key={h} className="px-6 py-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEvents.map((event, idx) => {
                      const EventIcon = event.icon;
                      const NoteIcon  = event.noteIcon;
                      const pct       = event.progress;

                      return (
                        <tr
                          key={event.id}
                          className="group hover:bg-[#faf8fc] transition-colors"
                          style={{ borderBottom: `1px solid ${BRAND.border}` }}
                        >
                          {/* Event name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="size-10 rounded-xl flex items-center justify-center shrink-0 border"
                                style={{ background: event.iconBg, color: event.iconColor, borderColor: event.iconBg }}
                              >
                                <EventIcon size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{event.title}</p>
                                <div className="mt-1"><TagPill tag={event.tag} /></div>
                              </div>
                            </div>
                          </td>

                          {/* Date & time */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-700">{event.date}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>
                          </td>

                          {/* Venue */}
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <MapPin size={13} style={{ color: BRAND.coral }} />
                              {event.venue}
                            </p>
                          </td>

                          {/* Capacity */}
                          <td className="px-6 py-4 min-w-52">
                            <div className="flex justify-between text-xs font-semibold mb-1.5">
                              <span className="text-gray-700">{event.registered} registered</span>
                              <span className="text-gray-400">of {event.target}</span>
                            </div>
                            <div className="w-full h-2 rounded-full" style={{ background: "#EDD9F0" }}>
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: pct >= 100 ? "#1D9E75" : BRAND.grad }}
                              />
                            </div>
                            {event.note && (
                              <p className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: event.noteColor }}>
                                <NoteIcon size={12} /> {event.note}
                              </p>
                            )}
                          </td>

                          {/* Delete */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                              style={{ background: "#FDF0F3", color: BRAND.coral, border: `1px solid #F0BBCA` }}
                              onMouseEnter={e => { e.currentTarget.style.background = BRAND.coral; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = BRAND.coral; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#FDF0F3"; e.currentTarget.style.color = BRAND.coral; e.currentTarget.style.borderColor = "#F0BBCA"; }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile card view ─────────────────────────────────────────── */}
              <div className="lg:hidden">
                {filteredEvents.map((event) => {
                  const EventIcon = event.icon;
                  const NoteIcon  = event.noteIcon;

                  return (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-[#faf8fc] transition-colors"
                      style={{ borderBottom: `1px solid ${BRAND.border}` }}
                    >
                      {/* Top row */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{ background: event.iconBg, color: event.iconColor, borderColor: event.iconBg }}
                        >
                          <EventIcon size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{event.title}</h4>
                            <TagPill tag={event.tag} />
                          </div>

                          <div className="space-y-1 text-xs text-gray-500 mt-1">
                            <p className="flex items-center gap-1.5">
                              <Calendar size={12} style={{ color: BRAND.purple }} /> {event.date}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Clock size={12} style={{ color: BRAND.purple }} /> {event.time}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin size={12} style={{ color: BRAND.coral }} /> {event.venue}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-gray-700">{event.registered} / {event.target} registered</span>
                          <span style={{ color: BRAND.coral }}>{event.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: "#EDD9F0" }}>
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${event.progress}%`,
                              background: event.progress >= 100 ? "#1D9E75" : BRAND.grad,
                            }}
                          />
                        </div>
                        {event.note && (
                          <p className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: event.noteColor }}>
                            <NoteIcon size={12} /> {event.note}
                          </p>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 border"
                        style={{ background: "#FDF0F3", color: BRAND.coral, borderColor: "#F0BBCA" }}
                        onMouseEnter={e => { e.currentTarget.style.background = BRAND.coral; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#FDF0F3"; e.currentTarget.style.color = BRAND.coral; }}
                      >
                        <Trash2 size={15} /> Delete Event
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Table footer ─────────────────────────────────────────────────── */}
          <div
            className="p-3 sm:p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ borderColor: BRAND.border, background: BRAND.purpleSurface }}
          >
            <span className="text-xs sm:text-sm text-gray-500">
              Showing{" "}
              <span className="font-black" style={{ color: BRAND.purple }}>{filteredEvents.length}</span>
              {" "}of{" "}
              <span className="font-black text-gray-700">{events.length}</span>
              {" "}events
            </span>

            <div className="flex gap-2">
              {["Previous", "Next"].map((label, i) => (
                <button
                  key={label}
                  disabled={i === 0}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm rounded-xl font-bold border transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "white",
                    color: BRAND.purple,
                    borderColor: "#C4BBF0",
                  }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = BRAND.grad; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = BRAND.purple; e.currentTarget.style.borderColor = "#C4BBF0"; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;