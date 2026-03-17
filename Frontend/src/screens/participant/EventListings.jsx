import React, { useEffect, useMemo, useState } from "react";
import { Search, XCircle, AlertCircle, RotateCcw } from "lucide-react";
import EventCard from "../../components/participant/EventCard";
import { useAuthContext } from "../../../hooks/useAuthContext";

const BRAND = {
  grad:    "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradBr:  "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:   "#D4607A",
  purple:  "#534AB7",
};

const EventListings = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseURL}/events`, {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        const data = await res.json();
        setEvents(data?.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchEvents();
  }, [auth]);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase().trim();
    return events.filter(e =>
      (e.name  || "").toLowerCase().includes(q) ||
      (e.value || "").toLowerCase().includes(q) ||
      (e.title || "").toLowerCase().includes(q)
    );
  }, [events, search]);

  const clearFilters = () => setSearch("");

  return (
    <div className="min-h-screen bg-[#faf8fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 mb-10">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
            style={{
              background: BRAND.grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Explore Events
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Discover workshops, hackathons, seminars and competitions tailored for your career growth.
          </p>
          {/* Accent underline */}
          <div className="flex justify-center pt-1">
            <div className="h-1 w-20 rounded-full" style={{ background: BRAND.grad }} />
          </div>
        </div>

        {/* ── Search Card ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#EDD9F0] rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Input */}
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={17}
                style={{ color: BRAND.coral }}
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events by name..."
                className="w-full pl-11 pr-11 py-3 rounded-xl border-2 bg-[#faf8fc] text-sm outline-none transition-all duration-200"
                style={{
                  borderColor: search.trim() ? BRAND.coral : "#EDD9F0",
                }}
                onFocus={e  => { e.target.style.borderColor = BRAND.coral; e.target.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; }}
                onBlur={e   => { e.target.style.borderColor = search.trim() ? BRAND.coral : "#EDD9F0"; e.target.style.boxShadow = "none"; }}
              />
              {search.trim() && (
                <button
                  onClick={clearFilters}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <XCircle size={17}/>
                </button>
              )}
            </div>

            {/* Reset button */}
            <button
              onClick={clearFilters}
              className="w-full lg:w-auto px-6 py-3 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{ background: BRAND.gradBr, boxShadow: "0 4px 16px rgba(212,96,122,0.3)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,96,122,0.3)"; }}
            >
              <RotateCcw size={16}/> Reset
            </button>
          </div>

          {/* Result count */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <p className="text-gray-500">
              Showing{" "}
              <span className="font-black text-gray-900">{filteredEvents.length}</span>{" "}
              events
            </p>
            {search.trim() ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-xs" style={{ color: BRAND.coral }}>
                <Search size={13}/> Search applied
              </span>
            ) : (
              <span className="text-gray-400 text-xs font-medium">Browse all available events</span>
            )}
          </div>
        </div>

        {/* ── Events Grid ─────────────────────────────────────────────────── */}
        <div className="mt-10 sm:mt-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-[#EDD9F0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-36 bg-[#F3F0FD]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-[#F3F0FD] rounded" />
                    <div className="h-4 w-1/2 bg-[#F3F0FD] rounded" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-8 w-20 bg-[#F3F0FD] rounded-xl" />
                      <div className="h-8 w-20 bg-[#F3F0FD] rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-sm border border-[#EDD9F0]">
              <div
                className="mx-auto size-14 rounded-2xl flex items-center justify-center border mb-5"
                style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
              >
                <AlertCircle size={24} style={{ color: BRAND.purple }}/>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">No events found</h3>
              <p className="text-gray-500 mt-2 text-sm">Try searching with a different keyword.</p>
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-3 rounded-xl text-white font-black text-sm inline-flex items-center gap-2 transition-all duration-200 active:scale-95"
                style={{ background: BRAND.gradBr, boxShadow: "0 4px 16px rgba(212,96,122,0.3)" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,96,122,0.3)"; }}
              >
                <RotateCcw size={16}/> Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventListings;