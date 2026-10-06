import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  BadgeCheck,
  PlusCircle,
  CheckCircle2,
  MapPin,
  X,
  UserCog,
  CalendarCheck,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function AssignVolunteer() {
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
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (now > end) return "COMPLETED";
    if (now >= start && now <= end) return "LIVE";
    return "UPCOMING";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [volRes, eventRes] = await Promise.all([
          axios.get(`${baseURL}/volunteering`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get(`${baseURL}/events`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);

        const allAssignments = Array.isArray(volRes.data) ? volRes.data : [];
        const seen = new Set();
        const unique = allAssignments.reduce((acc, item) => {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            acc.push(item);
          }
          return acc;
        }, []);
        setVolunteers(unique);

        const eventsData = eventRes.data?.events ?? eventRes.data;
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (err) {
        console.error("Fetch data error:", err);
        toast.error("Failed to load volunteers and events");
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchData();
  }, [auth?.token]);

  useEffect(() => {
    const fetchAssigned = async () => {
      if (!selectedVolunteer) {
        setAssignedEventIds([]);
        return;
      }
      try {
        setFetchingAssigned(true);
        const res = await axios.get(`${baseURL}/volunteering/${selectedVolunteer}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const ids = res.data?.assignedEventIds || [];
        setAssignedEventIds(ids.map((id) => id.toString()));
      } catch (error) {
        console.error("Fetch assigned error:", error);
      } finally {
        setFetchingAssigned(false);
      }
    };
    if (auth?.token) fetchAssigned();
  }, [selectedVolunteer, auth?.token]);

  const assignedEvents = useMemo(
    () => events.filter((e) => assignedEventIds.includes(e._id)),
    [events, assignedEventIds]
  );

  const availableEvents = useMemo(
    () => events.filter((e) => !assignedEventIds.includes(e._id)),
    [events, assignedEventIds]
  );

  const filteredAvailableEvents = useMemo(() => {
    if (!searchEvent.trim()) return availableEvents;
    const q = searchEvent.toLowerCase();
    return availableEvents.filter(
      (e) => e.name?.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q)
    );
  }, [availableEvents, searchEvent]);

  const handleToggleEvent = (id) =>
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleAssign = async () => {
    if (!selectedVolunteer) {
      toast.error("Please select a volunteer first");
      return;
    }
    if (!selectedEvents.length) {
      toast.error("Select at least 1 event shift");
      return;
    }
    try {
      setAssigning(true);
      const res = await axios.post(
        `${baseURL}/volunteering/assign`,
        { userId: selectedVolunteer, events: selectedEvents },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success(res.data?.message || "Shifts assigned successfully!");
      setAssignedEventIds((prev) => Array.from(new Set([...prev, ...selectedEvents])));
      setSelectedEvents([]);
      setSearchEvent("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign shifts");
    } finally {
      setAssigning(false);
    }
  };

  const selectedVolunteerObj = volunteers.find((v) => v.id === selectedVolunteer);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/volunteers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Crew Roster
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shift Allocation Console
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Assign active volunteers to specific campus event stations and check-in desks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Volunteer Selection & Current Shifts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Volunteer Select Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Select Volunteer
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Active Volunteers
              </label>
              <div className="relative">
                <select
                  value={selectedVolunteer}
                  onChange={(e) => {
                    setSelectedVolunteer(e.target.value);
                    setSelectedEvents([]);
                  }}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none font-medium"
                >
                  <option value="">{loading ? "-- Loading volunteers... --" : "-- Choose a volunteer --"}</option>
                  {volunteers.map((vol) => (
                    <option key={vol.id} value={vol.id}>
                      {vol.name} ({vol.email})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {selectedVolunteerObj && (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {selectedVolunteerObj.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {selectedVolunteerObj.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {selectedVolunteerObj.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current Shifts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <CalendarCheck size={18} />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Currently Assigned Shifts
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {assignedEvents.length} Shifts
              </span>
            </div>

            {fetchingAssigned ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Fetching current shifts...
              </div>
            ) : !selectedVolunteer ? (
              <p className="text-xs text-slate-400 text-center py-6 italic">
                Select a volunteer to view their assigned shifts
              </p>
            ) : assignedEvents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No active shifts assigned yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {assignedEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <div
                      key={event._id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {event.name}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {event.venue}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add Shifts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Allocate New Shifts
                  </h2>
                  <p className="text-xs text-slate-400">
                    Selected for assignment: <strong>{selectedEvents.length}</strong>
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                  placeholder="Filter available..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-2.5 mt-4 pr-1">
              {!selectedVolunteer ? (
                <div className="text-center py-16 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                    Select a volunteer on the left first
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Available shifts will populate once a volunteer is chosen.
                  </p>
                </div>
              ) : filteredAvailableEvents.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Layers size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                    No unassigned events available
                  </p>
                  <p className="text-[11px] text-slate-400">
                    This volunteer is already assigned to all matching events.
                  </p>
                </div>
              ) : (
                filteredAvailableEvents.map((event) => {
                  const isChecked = selectedEvents.includes(event._id);
                  const status = getEventStatus(event);

                  return (
                    <div
                      key={event._id}
                      onClick={() => handleToggleEvent(event._id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs"
                          : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="size-4 accent-indigo-600 mt-0.5 pointer-events-none"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {event.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                              status === "LIVE"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" />
                            {new Date(event.startTime).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" /> {event.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ready to assign: <strong>{selectedEvents.length}</strong> shifts
              </span>
              <button
                onClick={handleAssign}
                disabled={assigning || !selectedEvents.length}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <PlusCircle size={15} />
                {assigning ? "Assigning Shifts..." : "Confirm & Assign Shifts"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
