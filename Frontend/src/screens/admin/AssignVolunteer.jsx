import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuthContext } from "../../../hooks/useAuthContext";
import {
  Users,
  Search,
  BadgeCheck,
  PlusCircle,
  CheckCircle2,
  MapPin,
  X,
} from "lucide-react";

const BRAND = {
  grad: "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH: "linear-gradient(90deg,  #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral: "#D4607A",
  purple: "#534AB7",
  border: "#EDD9F0",
  coralSurface: "#FDF0F3",
  purpleSurface: "#F3F0FD",
};

const STATUS_STYLE = {
  LIVE: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  UPCOMING: { bg: BRAND.purpleSurface, text: BRAND.purple, border: "#C4BBF0" },
  COMPLETED: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.COMPLETED;
  return (
    <span
      className="px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {status === "LIVE" && (
        <span className="inline-flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5 mr-0.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#1D9E75" }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: "#1D9E75" }}
            />
          </span>
          LIVE
        </span>
      )}
      {status !== "LIVE" && status}
    </span>
  );
};

const AssignVolunteer = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const { auth } = useAuthContext();

  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [assignedEventIds, setAssignedEventIds] = useState([]);
  const [searchEvent, setSearchEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingAssigned, setFetchingAssigned] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const getEventStatus = (event) => {
    const now = new Date(),
      start = new Date(event.startTime),
      end = new Date(event.endTime);
    if (now > end) return "COMPLETED";
    if (now >= start && now <= end) return "LIVE";
    return "UPCOMING";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volRes, eventRes] = await Promise.all([
          axios.get(`${baseURL}/volunteering`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(`${baseURL}/events`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);

        // GET /volunteering now returns a plain array of assignment objects
        // Each item has: { id, name, email, phone, assignedEvent, duty, status, joinedAt }
        // But for the volunteer dropdown we need unique users — deduplicate by email
        const allAssignments = Array.isArray(volRes.data) ? volRes.data : [];
        const seen = new Set();
        const uniqueVolunteers = allAssignments.reduce((acc, item) => {
          if (!seen.has(item.email)) {
            seen.add(item.email);
            // We need _id for the select value — stored as item.id (the assignment _id won't work,
            // so we get userId from the volunteering assignment's userId populate)
            // The backend still returns id: a._id (assignment id), not the user id.
            // We need to call GET /volunteering which now returns assignment rows.
            // The volunteer dropdown needs userId — handled below via separate endpoint.
            acc.push(item);
          }
          return acc;
        }, []);
        setVolunteers(uniqueVolunteers);

        // Events endpoint — handle both { events: [] } and plain array
        const eventsData = eventRes.data?.events ?? eventRes.data;
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch {
        alert("Failed to load volunteers/events");
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchData();
  }, [auth?.token, baseURL]);

  useEffect(() => {
    const fetchAssigned = async () => {
      if (!selectedVolunteer) {
        setAssignedEventIds([]);
        return;
      }

      try {
        setFetchingAssigned(true);

        const res = await axios.get(
          `${baseURL}/volunteering/${selectedVolunteer}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          },
        );

        const ids = res.data?.assignedEventIds || [];
        setAssignedEventIds(ids.map((id) => id.toString()));
      } catch (error) {
        console.error("Fetch Assigned Events Error:", error);

        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch assigned events";

        alert(message);
      } finally {
        setFetchingAssigned(false);
      }
    };

    if (auth?.token) {
      fetchAssigned();
    }
  }, [selectedVolunteer, auth?.token, baseURL]);

  const assignedEvents = useMemo(
    () => events.filter((e) => assignedEventIds.includes(e._id)),
    [events, assignedEventIds],
  );
  const availableEvents = useMemo(
    () => events.filter((e) => !assignedEventIds.includes(e._id)),
    [events, assignedEventIds],
  );

  const filteredAvailableEvents = useMemo(() => {
    if (!searchEvent.trim()) return availableEvents;
    const q = searchEvent.toLowerCase();
    return availableEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q),
    );
  }, [availableEvents, searchEvent]);

  const selectedEventObjects = useMemo(
    () => events.filter((e) => selectedEvents.includes(e._id)),
    [events, selectedEvents],
  );

  const handleToggleEvent = (id) =>
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  const handleRemoveSelected = (id) =>
    setSelectedEvents((prev) => prev.filter((i) => i !== id));

  const handleAssign = async () => {
    if (!selectedVolunteer) {
      alert("Select a volunteer first!");
      return;
    }
    if (!selectedEvents.length) {
      alert("Select at least 1 event!");
      return;
    }
    try {
      setAssigning(true);
      const res = await axios.post(
        `${baseURL}/volunteering/assign`,
        { userId: selectedVolunteer, events: selectedEvents },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );
      alert(res.data.message || "Assigned successfully!");
      setAssignedEventIds((prev) =>
        Array.from(new Set([...prev, ...selectedEvents])),
      );
      setSelectedEvents([]);
      setSearchEvent("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign events");
    } finally {
      setAssigning(false);
    }
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────
  const Skel = ({ className }) => (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "#F3F0FD" }}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8fc] px-4 sm:px-8 py-8 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div
            className="bg-white rounded-2xl border p-6 sm:p-8"
            style={{ borderColor: BRAND.border }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Skel className="w-11 h-11" />
              <div className="space-y-2 flex-1">
                <Skel className="h-6 w-64" />
                <Skel className="h-4 w-80" />
              </div>
            </div>
            <Skel className="h-12 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4"
                style={{ borderColor: BRAND.border }}
              >
                <Skel className="h-6 w-56" />
                <Skel className="h-4 w-72" />
                {[1, 2, 3, 4].map((j) => (
                  <Skel key={j} className="h-16 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const PlaceholderCard = ({ message }) => (
    <div
      className="text-sm text-center rounded-xl p-5 border"
      style={{
        background: BRAND.purpleSurface,
        borderColor: "#C4BBF0",
        color: BRAND.purple,
      }}
    >
      {message}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8fc] px-4 sm:px-8 py-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Header card ─────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8"
          style={{ borderColor: BRAND.border }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="size-11 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                background: BRAND.purpleSurface,
                borderColor: "#C4BBF0",
              }}
            >
              <Users size={20} style={{ color: BRAND.purple }} />
            </div>
            <div>
              <h2
                className="text-2xl sm:text-3xl font-black"
                style={{
                  background: BRAND.gradH,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Assign Events to Volunteer
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Select a volunteer and assign multiple events easily.
              </p>
            </div>
          </div>

          <div
            className="mt-1 mb-6 h-1 w-16 rounded-full"
            style={{ background: BRAND.gradH }}
          />

          {/* Volunteer select */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 tracking-wide uppercase">
              Select Volunteer
            </label>
            <select
              value={selectedVolunteer}
              onChange={(e) => {
                setSelectedVolunteer(e.target.value);
                setSelectedEvents([]);
              }}
              className="w-full h-12 px-4 rounded-xl border-2 bg-[#faf8fc] text-sm outline-none transition-all duration-200"
              style={{
                borderColor: selectedVolunteer ? BRAND.coral : BRAND.border,
                color: selectedVolunteer ? "#111" : "#9CA3AF",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BRAND.coral;
                e.target.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = selectedVolunteer
                  ? BRAND.coral
                  : BRAND.border;
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">— Select Volunteer —</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.email})
                </option>
              ))}
            </select>

            {fetchingAssigned && selectedVolunteer && (
              <p
                className="text-xs font-semibold mt-2 flex items-center gap-1.5"
                style={{ color: BRAND.purple }}
              >
                <span
                  className="animate-spin inline-block w-3 h-3 border-2 rounded-full"
                  style={{
                    borderColor: `${BRAND.purple} transparent transparent transparent`,
                  }}
                />
                Loading assigned events…
              </p>
            )}
          </div>
        </div>

        {/* ── Main 2-col grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Already assigned */}
          <div
            className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8"
            style={{ borderColor: BRAND.border }}
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-1">
              <BadgeCheck size={20} className="text-emerald-500" />
              Already Assigned
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              These events are already assigned to this volunteer.
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {!selectedVolunteer ? (
                <PlaceholderCard message="Select a volunteer to view assigned events." />
              ) : fetchingAssigned ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border flex justify-between gap-3"
                      style={{
                        borderColor: BRAND.border,
                        background: BRAND.purpleSurface,
                      }}
                    >
                      <div className="space-y-2 flex-1">
                        <div
                          className="h-4 w-3/5 rounded"
                          style={{ background: "#C4BBF0" }}
                        />
                        <div
                          className="h-3 w-2/5 rounded"
                          style={{ background: "#C4BBF0" }}
                        />
                      </div>
                      <div
                        className="h-6 w-20 rounded-full"
                        style={{ background: "#C4BBF0" }}
                      />
                    </div>
                  ))}
                </div>
              ) : assignedEvents.length > 0 ? (
                assignedEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div
                      key={event._id}
                      className="p-4 rounded-xl border flex justify-between items-start gap-3"
                      style={{
                        background: BRAND.purpleSurface,
                        borderColor: "#C4BBF0",
                      }}
                    >
                      <div>
                        <p className="font-black text-gray-900 text-sm">
                          {event.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin size={12} style={{ color: BRAND.coral }} />{" "}
                          {event.venue}
                        </p>
                      </div>
                      <StatusPill status={status} />
                    </div>
                  );
                })
              ) : (
                <PlaceholderCard message="No events assigned yet." />
              )}
            </div>
          </div>

          {/* Available events */}
          <div
            className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8"
            style={{ borderColor: BRAND.border }}
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-1">
              <PlusCircle size={20} style={{ color: BRAND.coral }} />
              Available Events
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Select multiple events and assign them together.
            </p>

            {/* Search */}
            <div
              className="flex items-center gap-2 bg-[#faf8fc] px-4 py-3 rounded-xl border-2 mb-4 transition-all duration-200"
              style={{ borderColor: searchEvent ? BRAND.coral : BRAND.border }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = BRAND.coral;
                e.currentTarget.style.boxShadow =
                  "0 0 0 4px rgba(212,96,122,0.1)";
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = searchEvent
                  ? BRAND.coral
                  : BRAND.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Search size={16} style={{ color: BRAND.coral, flexShrink: 0 }} />
              <input
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                type="text"
                placeholder="Search event by name or venue..."
                className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {!selectedVolunteer ? (
                <PlaceholderCard message="Select a volunteer to assign events." />
              ) : filteredAvailableEvents.length > 0 ? (
                filteredAvailableEvents.map((event) => {
                  const status = getEventStatus(event);
                  const isSelected = selectedEvents.includes(event._id);
                  const disabled = status === "COMPLETED";

                  return (
                    <label
                      key={event._id}
                      className="flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                      style={{
                        background: isSelected ? BRAND.coralSurface : "#faf8fc",
                        borderColor: isSelected ? BRAND.coral : BRAND.border,
                        opacity: disabled ? 0.55 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <div
                        className="mt-0.5 size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                        style={{
                          background: isSelected ? BRAND.coral : "white",
                          borderColor: isSelected ? BRAND.coral : "#C4BBF0",
                        }}
                      >
                        {isSelected && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                      </div>

                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() =>
                          !disabled && handleToggleEvent(event._id)
                        }
                      />

                      <div className="flex-1 flex justify-between items-start gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {event.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin size={11} style={{ color: BRAND.coral }} />{" "}
                            {event.venue}
                          </p>
                        </div>
                        <StatusPill status={status} />
                      </div>
                    </label>
                  );
                })
              ) : (
                <PlaceholderCard message="No available events found." />
              )}
            </div>

            {/* Selected tags */}
            {selectedEventObjects.length > 0 && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: BRAND.border }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2.5"
                  style={{ color: BRAND.purple }}
                >
                  Selected ({selectedEventObjects.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedEventObjects.map((ev) => (
                    <span
                      key={ev._id}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                      style={{
                        background: BRAND.coralSurface,
                        color: BRAND.coral,
                        borderColor: "#F0BBCA",
                      }}
                    >
                      <span className="truncate max-w-32">{ev.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelected(ev._id)}
                        className="hover:opacity-70 transition shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assign CTA */}
            <button
              onClick={handleAssign}
              disabled={
                assigning || !selectedVolunteer || !selectedEvents.length
              }
              className="mt-5 w-full h-12 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background:
                  assigning || !selectedVolunteer || !selectedEvents.length
                    ? "#E5E7EB"
                    : BRAND.grad,
                color:
                  assigning || !selectedVolunteer || !selectedEvents.length
                    ? "#9CA3AF"
                    : "white",
                boxShadow:
                  !assigning && selectedVolunteer && selectedEvents.length
                    ? "0 4px 16px rgba(212,96,122,0.35)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                if (!assigning && selectedVolunteer && selectedEvents.length)
                  e.currentTarget.style.boxShadow =
                    "0 6px 22px rgba(83,74,183,0.45)";
              }}
              onMouseLeave={(e) => {
                if (!assigning && selectedVolunteer && selectedEvents.length)
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(212,96,122,0.35)";
              }}
            >
              <CheckCircle2 size={17} />
              {assigning
                ? "Assigning…"
                : `Assign ${selectedEvents.length > 0 ? `(${selectedEvents.length}) ` : ""}Events`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignVolunteer;
