import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, CalendarCheck2, AlertTriangle } from "lucide-react";
import EventCard from "../../components/volunteer/EventCard";
import { useAuthContext } from "../../../hooks/useAuthContext";

const BRAND = {
  grad:    "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:   "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:   "#D4607A",
  purple:  "#534AB7",
  coralSurface:  "#FDF0F3",
  purpleSurface: "#F3F0FD",
};

const FILTERS = ["all", "live", "upcoming", "completed"];

// Filter chip accent colors
const FILTER_COLORS = {
  live:      { active: "#D4607A", glow: "rgba(212,96,122,0.25)" },
  upcoming:  { active: "#534AB7", glow: "rgba(83,74,183,0.25)"  },
  completed: { active: "#1D9E75", glow: "rgba(29,158,117,0.25)" },
  all:       { active: "#8B5CB7", glow: "rgba(139,92,183,0.25)" },
};

const AssignedEvents = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const { auth } = useAuthContext();

  const [search, setSearch]               = useState("");
  const [filter, setFilter]               = useState("all");
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}/volunteering/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAssignedEvents(res.data.assignedEvents);
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
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "live")      return event.status === "LIVE";
      if (filter === "upcoming")  return event.status === "UPCOMING";
      if (filter === "completed") return event.status === "COMPLETED";
      return true;
    });
  }, [assignedEvents, search, filter]);

  // ── Skeleton ─────────────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white border border-[#EDD9F0] rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-36" style={{ background: "#F3F0FD" }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded w-3/4" style={{ background: "#F3F0FD" }} />
        <div className="h-3 rounded w-2/4" style={{ background: "#F3F0FD" }} />
        <div className="flex gap-2 mt-3">
          <div className="h-7 rounded-lg w-20" style={{ background: "#EDD9F0" }} />
          <div className="h-7 rounded-lg w-16" style={{ background: "#EDD9F0" }} />
        </div>
        <div className="h-9 rounded-xl w-full mt-2" style={{ background: "#EDD9F0" }} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#faf8fc] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-6">
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl" style={{ background: "#EDD9F0" }} />
              <div className="space-y-2">
                <div className="h-6 rounded w-44" style={{ background: "#EDD9F0" }} />
                <div className="h-3 rounded w-56" style={{ background: "#F3F0FD" }} />
              </div>
            </div>
            <div className="mt-4 bg-white border border-[#EDD9F0] rounded-2xl px-4 py-4 flex flex-col lg:flex-row gap-4 shadow-sm">
              <div className="h-12 rounded-xl w-full lg:max-w-md" style={{ background: "#F3F0FD" }} />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-xl w-full sm:w-24" style={{ background: "#F3F0FD" }} />)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 my-8">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8fc] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="size-11 rounded-2xl flex items-center justify-center border shrink-0"
              style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
            >
              <CalendarCheck2 size={20} style={{ color: BRAND.purple }} />
            </div>
            <div>
              <h2
                className="font-black text-2xl sm:text-3xl"
                style={{
                  background: BRAND.gradH,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Assigned Events
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Manage your volunteering assignments
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-1 ml-0.5">
            You have{" "}
            <span className="font-black" style={{ color: BRAND.coral }}>
              {filteredEvents.length}
            </span>{" "}
            assigned event{filteredEvents.length !== 1 ? "s" : ""}.
          </p>

          <div className="mt-1 h-1 w-14 rounded-full" style={{ background: BRAND.gradH }} />
        </div>

        {/* ── Search + Filters ──────────────────────────────────────────── */}
        <div className="bg-white border border-[#EDD9F0] rounded-2xl px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-sm mb-8">
          {/* Search */}
          <div
            className="flex items-center gap-3 w-full lg:max-w-md px-4 py-3 rounded-xl border-2 bg-[#faf8fc] transition-all duration-200"
            style={{ borderColor: search ? BRAND.coral : "#EDD9F0" }}
            onFocusCapture={e  => { e.currentTarget.style.borderColor = BRAND.coral; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; }}
            onBlurCapture={e   => { e.currentTarget.style.borderColor = search ? BRAND.coral : "#EDD9F0"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Search size={17} style={{ color: BRAND.coral, flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Search by event name or venue..."
              className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
            />
          </div>

          {/* Filter chips */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            {FILTERS.map((type) => {
              const isActive = filter === type;
              const fc = FILTER_COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className="px-4 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 capitalize whitespace-nowrap border active:scale-95"
                  style={
                    isActive
                      ? {
                          background: fc.active,
                          color: "white",
                          borderColor: fc.active,
                          boxShadow: `0 4px 12px ${fc.glow}`,
                        }
                      : {
                          background: "#faf8fc",
                          color: "#6B7280",
                          borderColor: "#EDD9F0",
                        }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = BRAND.purpleSurface;
                      e.currentTarget.style.borderColor = "#C4BBF0";
                      e.currentTarget.style.color = BRAND.purple;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#faf8fc";
                      e.currentTarget.style.borderColor = "#EDD9F0";
                      e.currentTarget.style.color = "#6B7280";
                    }
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cards grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => <EventCard key={event._id} event={event} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-16 bg-white border border-[#EDD9F0] rounded-2xl shadow-sm">
              <div
                className="size-14 rounded-2xl flex items-center justify-center border mb-4"
                style={{ background: BRAND.coralSurface, borderColor: "#F0BBCA" }}
              >
                <AlertTriangle size={24} style={{ color: BRAND.coral }} />
              </div>
              <h3 className="text-gray-900 font-black text-lg">No events found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                Try changing the filter or searching with a different keyword.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedEvents;