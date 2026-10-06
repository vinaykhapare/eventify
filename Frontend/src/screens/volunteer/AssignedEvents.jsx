import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, CalendarCheck2, Layers, Sparkles } from "lucide-react";
import EventCard from "../../components/volunteer/EventCard";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function AssignedEvents() {
  const { auth } = useAuthContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}/volunteering/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAssignedEvents(res.data?.assignedEvents || []);
      } catch (error) {
        console.error("Error fetching assigned events:", error);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchEvents();
  }, [auth]);

  const filteredEvents = useMemo(() => {
    return assignedEvents.filter((event) => {
      const matchesSearch =
        (event.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (event.venue || "").toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "live") return event.status === "LIVE";
      if (filter === "upcoming") return event.status === "UPCOMING";
      if (filter === "completed") return event.status === "COMPLETED";
      return true;
    });
  }, [assignedEvents, search, filter]);

  return (
    <DashboardLayout
      searchPlaceholder="Search assigned shifts by name or venue..."
      onSearch={(q) => setSearch(q)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <CalendarCheck2 size={14} />
            <span>Volunteer Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            My Assigned Shifts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select an event station to launch the gate QR scanner and manage real-time attendee admissions.
          </p>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Shifts" },
            { id: "live", label: "Live Now" },
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filter === item.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shifts..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Shifts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse space-y-4"
            >
              <div className="h-44 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {search ? "No shifts match your search" : "No shifts allocated yet"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {search
              ? "Try adjusting your search query or clear the filter."
              : "You do not have any active volunteer shifts assigned right now. Please check back later or contact your college event administrator."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}