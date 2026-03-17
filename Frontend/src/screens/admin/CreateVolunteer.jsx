import { useMemo, useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  UserPlus, Mail, Lock, Save, ClipboardList,
  Calendar, Search, MapPin, AlertCircle, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { useAuthContext } from "../../../hooks/useAuthContext";

const BRAND = {
  grad:          "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:         "linear-gradient(90deg,  #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:         "#D4607A",
  purple:        "#534AB7",
  border:        "#EDD9F0",
  coralSurface:  "#FDF0F3",
  purpleSurface: "#F3F0FD",
};

const STATUS_STYLE = {
  LIVE:      { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  UPCOMING:  { bg: BRAND.purpleSurface, text: BRAND.purple, border: "#C4BBF0" },
  COMPLETED: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
};

// ── Shared field input ────────────────────────────────────────────────────────
const FieldInput = ({ label, icon: Icon, error, inputRef, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-600 tracking-wide uppercase">{label}</label>
    <div className="relative">
      <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: error ? BRAND.coral : "#9CA3AF" }} />
      {children}
    </div>
    {error && (
      <p className="text-xs font-medium text-red-500 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const CreateVolunteer = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const { auth } = useAuthContext();

  const nameRef     = useRef(null);
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const eventsRef   = useRef(null);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", autoGenerate: false });
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");
  const [errors, setErrors]             = useState({ name: "", email: "", password: "", events: "" });
  const [events, setEvents]             = useState([]);

  const formatEventTime = (start, end) => {
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const fmtT = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${fmt(start)}, ${fmtT(start)} → ${fmt(end)}, ${fmtT(end)}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}/events`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const now = new Date();
        const formatted = res.data.events.map(event => {
          const start = new Date(event.startTime), end = new Date(event.endTime);
          let status = "UPCOMING";
          if (now > end)             status = "COMPLETED";
          else if (now >= start && now <= end) status = "LIVE";
          return {
            id: event._id, title: event.name,
            status, time: formatEventTime(start, end),
            venue: event.venue, selected: false,
            disabled: status === "COMPLETED",
          };
        });
        setEvents(formatted);
      } catch { console.error("Fetch events error"); }
    };
    if (auth?.token) fetchEvents();
  }, [auth?.token]);

  const generatePassword = (len = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const selectedCount    = useMemo(() => events.filter(e => e.selected).length, [events]);
  const filteredEvents   = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
  }, [events, searchTerm]);

  const handleToggleEvent = (id) => {
    setEvents(prev => prev.map(e => e.id === id && !e.disabled ? { ...e, selected: !e.selected } : e));
    setErrors(prev => ({ ...prev, events: "" }));
  };

  const handleAutoGenerateToggle = (checked) => {
    setFormData(prev => ({ ...prev, autoGenerate: checked, password: checked ? generatePassword() : "" }));
    setErrors(prev => ({ ...prev, password: "" }));
  };

  const validateForm = () => {
    if (!formData.name.trim())     { setErrors(p => ({ ...p, name: "Full name is required." }));      nameRef.current?.focus();     return false; }
    if (!formData.email.trim())    { setErrors(p => ({ ...p, email: "Email is required." }));         emailRef.current?.focus();    return false; }
    if (!formData.password.trim()) { setErrors(p => ({ ...p, password: "Password is required." }));   passwordRef.current?.focus(); return false; }
    if (selectedCount === 0)       { setErrors(p => ({ ...p, events: "Select at least 1 event." }));  eventsRef.current?.scrollIntoView({ behavior: "smooth" }); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    try {
      const selectedEvs = events.filter(e => e.selected);
      const res = await axios.post(`${baseURL}/volunteering`,
        { name: formData.name, email: formData.email, password: formData.password, events: selectedEvs.map(e => e.id) },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      alert(res.data.message || "Volunteer created successfully!");
      setFormData({ name: "", email: "", password: "", autoGenerate: false });
      setSearchTerm("");
      setErrors({ name: "", email: "", password: "", events: "" });
      setEvents(prev => prev.map(e => ({ ...e, selected: false })));
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  const inputBase = (hasError) =>
    `w-full h-12 rounded-xl border-2 bg-[#faf8fc] pl-11 pr-4 text-sm outline-none transition-all duration-200 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
        : `border-[#EDD9F0] focus:border-[${BRAND.coral}] focus:ring-4`
    }`;

  return (
    <div className="bg-[#faf8fc] min-h-screen flex flex-col pb-20 lg:pb-0">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 md:py-10">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{
              background: BRAND.gradH,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Create Volunteer & Assign Event
          </h1>
          <p className="text-gray-400 text-sm mt-1">Onboard new staff and allocate responsibilities immediately.</p>
          <div className="mt-3 h-1 w-16 rounded-full" style={{ background: BRAND.gradH }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ── LEFT: Volunteer form ──────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-7 flex flex-col h-full" style={{ borderColor: BRAND.border }}>

              {/* Card header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b" style={{ borderColor: BRAND.border }}>
                <div
                  className="size-10 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
                >
                  <UserPlus size={18} style={{ color: BRAND.purple }} />
                </div>
                <h2 className="text-lg font-black text-gray-900">Volunteer Details</h2>
              </div>

              <form className="flex flex-col gap-5 flex-1" onSubmit={handleSubmit}>

                {/* Name */}
                <FieldInput label="Full Name" icon={UserPlus} error={errors.name} inputRef={nameRef}>
                  <input
                    ref={nameRef}
                    value={formData.name}
                    onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
                    placeholder="e.g. Sarah Jenkins"
                    type="text"
                    className={inputBase(errors.name)}
                    style={{ borderColor: errors.name ? "#FCA5A5" : BRAND.border }}
                    onFocus={e => { if (!errors.name) { e.target.style.borderColor = BRAND.coral; e.target.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; } }}
                    onBlur={e  => { e.target.style.borderColor = errors.name ? "#FCA5A5" : BRAND.border; e.target.style.boxShadow = "none"; }}
                  />
                </FieldInput>

                {/* Email */}
                <FieldInput label="Email Address" icon={Mail} error={errors.email} inputRef={emailRef}>
                  <input
                    ref={emailRef}
                    value={formData.email}
                    onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }}
                    placeholder="sarah@university.edu"
                    type="email"
                    className={inputBase(errors.email)}
                    style={{ borderColor: errors.email ? "#FCA5A5" : BRAND.border }}
                    onFocus={e => { if (!errors.email) { e.target.style.borderColor = BRAND.coral; e.target.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; } }}
                    onBlur={e  => { e.target.style.borderColor = errors.email ? "#FCA5A5" : BRAND.border; e.target.style.boxShadow = "none"; }}
                  />
                </FieldInput>

                {/* Password */}
                <FieldInput label="Password" icon={Lock} error={errors.password} inputRef={passwordRef}>
                  <input
                    ref={passwordRef}
                    value={formData.password}
                    disabled={formData.autoGenerate}
                    onChange={e => { setFormData(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: "" })); }}
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    className={`${inputBase(errors.password)} pr-11 ${formData.autoGenerate ? "cursor-not-allowed" : ""}`}
                    style={{
                      borderColor: errors.password ? "#FCA5A5" : BRAND.border,
                      background: formData.autoGenerate ? BRAND.purpleSurface : "#faf8fc",
                    }}
                    onFocus={e => { if (!errors.password && !formData.autoGenerate) { e.target.style.borderColor = BRAND.coral; e.target.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; } }}
                    onBlur={e  => { e.target.style.borderColor = errors.password ? "#FCA5A5" : BRAND.border; e.target.style.boxShadow = "none"; }}
                  />
                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </FieldInput>

                {/* Auto generate toggle */}
                <div
                  className="rounded-xl p-4 border"
                  style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-gray-800">Auto Generate Password</span>
                    <label className="inline-flex items-center cursor-pointer shrink-0">
                      <input
                        checked={formData.autoGenerate}
                        onChange={e => handleAutoGenerateToggle(e.target.checked)}
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div
                        className="relative w-11 h-6 rounded-full transition-all peer
                          after:content-[''] after:absolute after:top-0.5 after:start-0.5
                          after:bg-white after:border after:border-gray-300 after:rounded-full
                          after:h-5 after:w-5 after:transition-all
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          peer-focus:ring-4"
                        style={{
                          background: formData.autoGenerate ? BRAND.coral : "#D1D5DB",
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Password will be auto-generated and cannot be edited manually.
                  </p>
                </div>

                {/* Desktop submit */}
                <button
                  type="submit"
                  className="hidden lg:flex w-full h-12 rounded-xl font-black text-sm text-white items-center justify-center gap-2 mt-2 transition-all duration-200 active:scale-95"
                  style={{ background: BRAND.grad, boxShadow: "0 4px 16px rgba(212,96,122,0.35)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(83,74,183,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,96,122,0.35)"; }}
                >
                  <Save size={17} /> Create & Assign
                </button>
              </form>
            </div>
          </div>

          {/* ── RIGHT: Event selector ─────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col h-[520px] sm:h-[600px] lg:h-[calc(100vh-200px)]">
            <div
              ref={eventsRef}
              className="bg-white rounded-2xl border shadow-sm flex flex-col h-full overflow-hidden"
              style={{ borderColor: BRAND.border }}
            >
              {/* Panel header */}
              <div className="p-5 sm:p-6 border-b z-10" style={{ borderColor: BRAND.border }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <ClipboardList size={20} style={{ color: BRAND.coral }} />
                      Assign Responsibilities
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Select events this volunteer will manage.</p>
                  </div>

                  {/* Selected count pill */}
                  <span
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border"
                    style={{ background: selectedCount > 0 ? BRAND.coralSurface : BRAND.purpleSurface, color: selectedCount > 0 ? BRAND.coral : BRAND.purple, borderColor: selectedCount > 0 ? "#F0BBCA" : "#C4BBF0" }}
                  >
                    <Calendar size={12} /> {selectedCount} Selected
                  </span>
                </div>

                {/* Search */}
                <div
                  className="flex items-center gap-2 bg-[#faf8fc] rounded-xl border-2 px-4 py-2.5 transition-all duration-200"
                  style={{ borderColor: searchTerm ? BRAND.coral : BRAND.border }}
                  onFocusCapture={e => { e.currentTarget.style.borderColor = BRAND.coral; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212,96,122,0.1)"; }}
                  onBlurCapture={e  => { e.currentTarget.style.borderColor = searchTerm ? BRAND.coral : BRAND.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Search size={15} style={{ color: BRAND.coral, flexShrink: 0 }} />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
                    placeholder="Search by event name or venue..."
                    type="text"
                  />
                </div>

                {errors.events && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-2.5">
                    <AlertCircle size={12} /> {errors.events}
                  </p>
                )}
              </div>

              {/* Scrollable event list */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3" style={{ background: "#faf8fc" }}>
                {filteredEvents.map(event => {
                  const s = STATUS_STYLE[event.status] || STATUS_STYLE.COMPLETED;
                  return (
                    <label
                      key={event.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200"
                      style={{
                        background:  event.selected ? BRAND.coralSurface : "white",
                        borderColor: event.selected ? BRAND.coral : BRAND.border,
                        opacity:     event.disabled ? 0.55 : 1,
                        cursor:      event.disabled ? "not-allowed" : "pointer",
                        boxShadow:   event.selected ? "0 2px 10px rgba(212,96,122,0.15)" : "none",
                      }}
                    >
                      {/* Top row mobile: checkbox + status */}
                      <div className="flex items-start justify-between w-full sm:w-auto gap-3">
                        {/* Custom checkbox */}
                        <div
                          className="mt-0.5 size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                          style={{ background: event.selected ? BRAND.coral : "white", borderColor: event.selected ? BRAND.coral : "#C4BBF0" }}
                        >
                          {event.selected && <CheckCircle2 size={11} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={event.selected}
                          disabled={event.disabled}
                          onChange={() => handleToggleEvent(event.id)}
                        />

                        {/* Status pill — mobile only */}
                        <span
                          className="sm:hidden px-2.5 py-0.5 text-[11px] font-bold rounded-full border"
                          style={{ background: s.bg, color: s.text, borderColor: s.border }}
                        >
                          {event.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug">{event.title}</h3>
                          {/* Status pill — desktop only */}
                          <span
                            className="hidden sm:inline-flex px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0"
                            style={{ background: s.bg, color: s.text, borderColor: s.border }}
                          >
                            {event.status}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-col gap-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: BRAND.purple }} /> {event.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} style={{ color: BRAND.coral }} /> {event.venue}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 border-t text-xs text-center font-medium"
                style={{ borderColor: BRAND.border, background: BRAND.purpleSurface, color: BRAND.purple }}
              >
                Showing {filteredEvents.length} of {events.length} events
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile sticky CTA ─────────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 w-full border-t p-4 z-50"
        style={{ background: "white", borderColor: BRAND.border, boxShadow: "0 -8px 30px rgba(212,96,122,0.1)" }}
      >
        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{ background: BRAND.grad, boxShadow: "0 4px 16px rgba(212,96,122,0.35)" }}
        >
          <Save size={17} /> Create & Assign
        </button>
      </div>
    </div>
  );
};

export default CreateVolunteer;