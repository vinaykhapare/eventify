import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  Ticket,
  ShieldCheck,
  Sparkles,
  Building,
  User,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function EventDetails() {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const { auth } = useAuthContext();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!auth?.token) return;
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseURL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) {
          navigate("/events");
          return;
        }
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error("Fetch Event Details Error:", err);
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId, auth?.token, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Event link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegistration = async () => {
    if (isClosed) {
      toast.error("Registration is closed!");
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`${baseURL}/participations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Successfully registered! Check your tickets.");
        setEvent((prev) => ({ ...prev, hasRegistered: true }));
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch {
      toast.error("Network error while registering!");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
          <div className="h-80 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-850 rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-4">
          <div className="size-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
            Event Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This event may have been removed or the URL is incorrect.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs"
          >
            <ArrowLeft size={14} /> Back to Events
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const deadline = new Date(event.registrationDeadline);

  const isExpired = now > endDate;
  const isRegistrationClosed = now > deadline;
  const isClosed = isExpired || isRegistrationClosed;

  const totalPrize = event.prizes?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;
  const isFree = !event.entryFee || event.entryFee === 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ── Breadcrumb / Back ── */}
        <div className="flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Explorer</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
          >
            <Share2 size={14} />
            <span>{copied ? "Copied Link!" : "Share Event"}</span>
          </button>
        </div>

        {/* ── Hero Banner ── */}
        <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-md bg-slate-950">
          <img
            src={
              event.bannerImageUrl ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
            }
            alt={event.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Pill on top of hero */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white border border-white/20 shadow-xs">
              {isClosed ? "Registration Closed" : now >= startDate && now <= endDate ? "Live Now" : "Upcoming Event"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/90 text-white backdrop-blur-md shadow-xs">
              {isFree ? "Free Admission" : `Pass: ₹${event.entryFee}`}
            </span>
          </div>

          {/* Hero Bottom Meta */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 text-white space-y-2">
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight drop-shadow-xs">
              {event.name}
            </h1>
            {event.tagline && (
              <p className="text-sm sm:text-base text-slate-200 line-clamp-1 font-medium drop-shadow-xs">
                {event.tagline}
              </p>
            )}
          </div>
        </div>

        {/* ── Main Content & Sticky Ticket Card Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Event Details (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Meta Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3 p-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Time</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {event.venue || "Campus Venue"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Users size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Team Size</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {event.teamSize?.min || 1}–{event.teamSize?.max || 1} Person
                  </p>
                </div>
              </div>
            </div>

            {/* About / Description */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>About the Event</span>
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Event Timeline / Schedule */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Event Schedule & Milestones</span>
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                <div className="relative">
                  <span className="absolute -left-6 top-1 size-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-[#1E293B]" />
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    Registration Deadline
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {deadline.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} at {deadline.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 size-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#1E293B]" />
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Event Kickoff & Check-in
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })} at {startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 size-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-[#1E293B]" />
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                    Closing & Winner Ceremony
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })} at {endDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Prizes Section */}
            {event.prizes && event.prizes.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    <span>Prizes & Accolades</span>
                  </h2>
                  {totalPrize > 0 && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                      Total Prize Pool: ₹{totalPrize.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {event.prizes.map((prize, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1 text-center"
                    >
                      <span className="text-xl">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {prize.position || `Rank ${idx + 1}`}
                      </p>
                      {prize.amount > 0 && (
                        <p className="text-base font-heading font-black text-indigo-600 dark:text-indigo-400">
                          ₹{Number(prize.amount).toLocaleString("en-IN")}
                        </p>
                      )}
                      {prize.perks && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {prize.perks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules & Guidelines */}
            {event.rules && event.rules.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Rules & Code of Conduct</span>
                </h2>
                <ul className="space-y-2.5">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Ticket Pass & Registration Panel (1/3) */}
          <div className="space-y-6">
            <div className="sticky top-20 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-6">
              {/* Ticket Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Registration Pass
                  </span>
                  <p className="text-2xl font-heading font-black text-slate-900 dark:text-white mt-0.5">
                    {isFree ? "Free Ticket" : `₹${event.entryFee}`}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Ticket size={24} />
                </div>
              </div>

              {/* What's included */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
                  This pass grants:
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Full event admission & workshop access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Digital QR pass on mobile wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Official certificate of participation</span>
                </div>
              </div>

              {/* Action Button */}
              {event.hasRegistered ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>You have registered for this event!</span>
                  </div>
                  <Link
                    to="/my-ticket"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                  >
                    <span>View Ticket Pass</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              ) : isClosed ? (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center font-bold text-xs">
                  Registration Window Closed
                </div>
              ) : (
                <button
                  onClick={handleRegistration}
                  disabled={isRegistering}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-98 transition-all disabled:opacity-75"
                >
                  {isRegistering ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    <span>Register Now</span>
                  )}
                </button>
              )}

              {/* Organizer contact strip */}
              {event.createdBy && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {event.createdBy.name ? event.createdBy.name[0].toUpperCase() : "O"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-400">Organized by</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {event.createdBy.name || "Campus Organizer"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}