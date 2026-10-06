import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  XCircle,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  CalendarDays,
  Ticket,
  Zap,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EventCard from "../../components/participant/EventCard";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function EventListings() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("upcoming");
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseURL}/events`, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch events: ${res.statusText}`);
        }
        const data = await res.json();
        setEvents(data?.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchEvents();
  }, [auth?.token]);

  const categories = [
    "All",
    "Hackathon",
    "Workshop",
    "Tech Talk",
    "Robotics",
    "Cultural",
  ];

  const filteredEvents = useMemo(() => {
    let result = events;

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.venue || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      const cat = selectedCategory.toLowerCase();
      result = result.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(cat) ||
          (e.description || "").toLowerCase().includes(cat)
      );
    }

    // Sorting
    if (sortBy === "free") {
      result = [...result].sort((a, b) => (a.entryFee || 0) - (b.entryFee || 0));
    } else if (sortBy === "popular") {
      result = [...result].sort(
        (a, b) => (b.registrationsCount || 0) - (a.registrationsCount || 0)
      );
    } else {
      // Upcoming (default)
      result = [...result].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
    }

    return result;
  }, [events, search, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSortBy("upcoming");
  };

  return (
    <DashboardLayout
      searchPlaceholder="Search campus events..."
      onSearch={(val) => setSearch(val)}
    >
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            <Compass size={14} />
            <span>Discover Events</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
            Explore Campus Gatherings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            RSVP for hackathons, engineering summits, tech workshops, and competitions.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none shadow-2xs cursor-pointer focus:border-indigo-500"
          >
            <option value="upcoming">Sort by: Date (Soonest)</option>
            <option value="popular">Sort by: Most Popular</option>
            <option value="free">Sort by: Free First</option>
          </select>
        </div>
      </div>

      {/* ── Visual Statistics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Gatherings</p>
            <p className="text-lg font-heading font-extrabold text-slate-900 dark:text-white leading-tight">
              {events.length} Events
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Ticket size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Free Access</p>
            <p className="text-lg font-heading font-extrabold text-slate-900 dark:text-white leading-tight">
              {events.filter((e) => !e.entryFee || e.entryFee === 0).length} Passes
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-2xs hidden sm:flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gate Verification</p>
            <p className="text-lg font-heading font-extrabold text-slate-900 dark:text-white leading-tight">
              Sub-second QR
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Bar & Category Pills ── */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search status & reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredEvents.length}</span> events
          </p>
          {(search || selectedCategory !== "All" || sortBy !== "upcoming") && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <RotateCcw size={12} />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Events Grid ── */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs animate-pulse"
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-lg mx-auto space-y-4">
            <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                No events found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                We couldn't find any events matching "{search || selectedCategory}". Try searching for another term.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <RotateCcw size={14} />
              <span>Show All Events</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}