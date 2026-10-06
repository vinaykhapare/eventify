import { useMemo, useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Lock,
  Save,
  Calendar,
  Search,
  MapPin,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  Sparkles,
  ArrowLeft,
  CalendarCheck2,
  Layers,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function CreateVolunteer() {
  const { auth } = useAuthContext();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    autoGenerate: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "", events: "" });
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const formatEventTime = (start, end) => {
    const fmt = (d) =>
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const fmtT = (d) =>
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${fmt(start)}, ${fmtT(start)} → ${fmtT(end)}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}/events`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const now = new Date();
        const formatted = (res.data?.events || []).map((event) => {
          const start = new Date(event.startTime);
          const end = new Date(event.endTime);
          let status = "UPCOMING";
          if (now > end) status = "COMPLETED";
          else if (now >= start && now <= end) status = "LIVE";

          return {
            id: event._id,
            title: event.name,
            status,
            time: formatEventTime(start, end),
            venue: event.venue,
            selected: false,
            disabled: status === "COMPLETED",
          };
        });
        setEvents(formatted);
      } catch (err) {
        console.error("Fetch events error:", err);
      }
    };
    if (auth?.token) fetchEvents();
  }, [auth?.token]);

  const generatePassword = (len = 10) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const selectedCount = useMemo(() => events.filter((e) => e.selected).length, [events]);

  const filteredEvents = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return events.filter(
      (e) => e.title.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  const handleToggleEvent = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id && !e.disabled ? { ...e, selected: !e.selected } : e))
    );
    setErrors((prev) => ({ ...prev, events: "" }));
  };

  const handleAutoGenerateToggle = (checked) => {
    const pwd = checked ? generatePassword() : "";
    setFormData((prev) => ({ ...prev, autoGenerate: checked, password: pwd }));
    setErrors((prev) => ({ ...prev, password: "" }));
    if (checked && pwd) {
      navigator.clipboard.writeText(pwd);
      toast.success("Generated & copied password to clipboard!");
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Full name is required";
      nameRef.current?.focus();
    }
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
      emailRef.current?.focus();
    }
    if (!formData.password.trim()) {
      errs.password = "Password is required";
      passwordRef.current?.focus();
    }
    if (selectedCount === 0) {
      errs.events = "Select at least 1 event shift";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const selectedEvs = events.filter((e) => e.selected);
      const res = await axios.post(
        `${baseURL}/volunteering`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          events: selectedEvs.map((e) => e.id),
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success(res.data?.message || "Volunteer account created successfully!");
      setFormData({ name: "", email: "", password: "", autoGenerate: false });
      setSearchTerm("");
      setEvents((prev) => prev.map((e) => ({ ...e, selected: false })));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create volunteer");
    } finally {
      setSubmitting(false);
    }
  };

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
            Create Volunteer Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Provision staff credentials and allocate them to campus event stations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Volunteer Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <UserPlus size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Staff Credentials
              </h2>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, name: e.target.value }));
                  setErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="e.g. Alex Morgan"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  errors.name
                    ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={emailRef}
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, email: e.target.value }));
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                  placeholder="alex@college.edu"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.email
                      ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  disabled={formData.autoGenerate}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, password: e.target.value }));
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="Create temporary password"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.password
                      ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                  } ${formData.autoGenerate ? "opacity-75 font-mono" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Auto Generate Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Auto-Generate Password
                  </p>
                  <p className="text-[11px] text-slate-400">Creates secure random string</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoGenerate}
                onChange={(e) => handleAutoGenerateToggle(e.target.checked)}
                className="size-4.5 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all"
            >
              <Save size={16} />
              {submitting ? "Creating Crew..." : "Create & Provision Volunteer"}
            </button>
          </div>
        </div>

        {/* Right Column: Shift Assignment */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <CalendarCheck2 size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Select Event Shifts
                  </h2>
                  <p className="text-xs text-slate-400">
                    Selected: <strong>{selectedCount}</strong> events
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter events..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {errors.events && (
              <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 font-semibold">
                <AlertCircle size={13} /> {errors.events}
              </p>
            )}

            {/* Event list */}
            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-2.5 mt-4 pr-1">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layers size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                    No active events found
                  </p>
                  <p className="text-[11px] text-slate-400">Create an event first to assign volunteers.</p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const isSelected = event.selected;
                  const isCompleted = event.disabled;

                  return (
                    <div
                      key={event.id}
                      onClick={() => !isCompleted && handleToggleEvent(event.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs"
                          : isCompleted
                          ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                          : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isCompleted}
                        onChange={() => {}}
                        className="size-4 accent-indigo-600 mt-0.5 pointer-events-none"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {event.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                              event.status === "LIVE"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : event.status === "UPCOMING"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" /> {event.time}
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
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}