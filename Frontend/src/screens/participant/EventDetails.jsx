import { useEffect, useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays, Users, Ticket, Trophy, ClipboardList,
  AlertTriangle, CheckCircle2, XCircle, MapPin,
  UserCircle2, Mail, ArrowRight, Gavel,
} from "lucide-react";

// ── Brand ─────────────────────────────────────────────────────────────────────
const BRAND = {
  grad:        "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradBr:      "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:       "#D4607A",
  purple:      "#534AB7",
  coralSurface:"#FDF0F3",
  purpleSurface:"#F3F0FD",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-[#faf8fc] min-h-screen pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 animate-pulse">
        <div className="relative w-full rounded-3xl overflow-hidden min-h-65 sm:min-h-80 border border-[#EDD9F0] shadow-xl bg-[#F3F0FD]">
          <div className="absolute inset-0 bg-linear-to-t from-[#8B5CB7]/30 via-[#D4607A]/10 to-transparent" />
          <div className="relative z-10 p-4 sm:p-8 lg:p-12 flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
            <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl w-full">
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-[#C4BBF0]" />
                <div className="h-6 w-28 rounded-full bg-[#F0BBCA]" />
              </div>
              <div className="h-8 sm:h-10 w-3/4 rounded-xl bg-[#C4BBF0]" />
              <div className="h-4 w-2/3 rounded-lg bg-[#C4BBF0]" />
              <div className="flex gap-3 mt-2">
                <div className="h-4 w-40 rounded-lg bg-[#C4BBF0]" />
                <div className="h-4 w-40 rounded-lg bg-[#C4BBF0]" />
              </div>
            </div>
            <div className="w-full sm:w-auto sm:max-w-sm bg-white/40 backdrop-blur-xl p-5 sm:p-8 rounded-2xl shadow-2xl border border-white/30 flex flex-col items-center">
              <div className="h-3 w-32 rounded bg-[#C4BBF0] mb-3" />
              <div className="h-8 sm:h-10 w-44 rounded-xl bg-[#C4BBF0]" />
              <div className="w-full h-px bg-[#C4BBF0] my-4" />
              <div className="h-4 w-56 rounded bg-[#C4BBF0]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 mt-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#EDD9F0]">
                <div className="h-6 w-52 rounded-lg bg-[#F3F0FD] mb-4" />
                <div className="space-y-3">
                  {[1,2,3].map(j => <div key={j} className="h-4 w-full rounded bg-[#F3F0FD]" />)}
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#EDD9F0]">
              <div className="h-6 w-32 rounded bg-[#F3F0FD] mb-5" />
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex justify-between gap-4">
                    <div className="h-4 w-20 rounded bg-[#F3F0FD]" />
                    <div className="h-4 w-24 rounded bg-[#F3F0FD]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#EDD9F0] py-4 px-4 sm:px-8 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-52 rounded bg-[#F3F0FD]" />
              <div className="h-5 w-40 rounded bg-[#F3F0FD]" />
            </div>
            <div className="h-12 w-40 rounded-xl bg-[#F3F0FD]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetails() {
  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { auth } = useAuthContext();
  const { id: eventId } = useParams();

  useEffect(() => {
    if (!auth?.token) return;
    const fetchEventDetails = async () => {
      try {
        const res = await fetch(`${baseURL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) { navigate("/404"); return; }
        const data = await res.json();
        setEvent(data);
      } catch { navigate("/404"); }
      finally { setLoading(false); }
    };
    fetchEventDetails();
  }, [eventId, auth?.token, navigate]);

  if (loading) return <Skeleton />;

  if (!event) {
    return (
      <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center px-4">
        <div className="bg-white shadow-lg border border-[#EDD9F0] rounded-2xl p-7 w-full max-w-md text-center">
          <p className="font-black text-lg" style={{ color: BRAND.coral }}>Event Not Found</p>
          <p className="text-gray-500 text-sm mt-2">This event does not exist.</p>
        </div>
      </div>
    );
  }

  const totalPrize = event.prizes?.reduce((acc, p) => acc + p.amount, 0);
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const now = new Date();
  const deadline = new Date(event.registrationDeadline);
  const diffInDays = (deadline - now) / (1000 * 60 * 60 * 24);
  const isClosingSoon = diffInDays <= 2 && diffInDays > 0;
  const isExpired = event.isExpired || new Date(event.endTime) < now;
  const isRegistrationClosed = event.isRegistrationClosed || new Date(event.registrationDeadline) < now;
  const isClosed = isExpired || isRegistrationClosed;

  async function handleRegistration() {
    if (isClosed) { toast.error("Registration is closed!"); return; }
    setIsRegistering(true);
    try {
      const res = await fetch(`${baseURL}/participations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Successfully registered!");
        setEvent(prev => ({ ...prev, hasRegistered: true }));
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch { toast.error("Couldn't register to event!"); }
    finally { setIsRegistering(false); }
  }

  // ── Section card wrapper ───────────────────────────────────────────────────
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EDD9F0] ${className}`}>
      {children}
    </div>
  );

  const SectionTitle = ({ icon, children }) => (
    <h2 className="text-lg sm:text-2xl font-black text-gray-900 mb-5 flex items-center gap-2">
      {icon}
      {children}
    </h2>
  );

  return (
    <div className="bg-[#faf8fc] min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div className="relative w-full rounded-3xl overflow-hidden min-h-65 sm:min-h-80 flex flex-col justify-end group border border-[#EDD9F0] shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${event.bannerImageUrl})` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-transparent" />

          <div className="relative z-10 p-4 sm:p-8 lg:p-12 flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
            {/* LEFT */}
            <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl text-white">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                {isClosingSoon && !isClosed && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm border border-red-300/30 bg-red-500/25 text-red-100">
                    <AlertTriangle size={13}/> Closing Soon
                  </span>
                )}
                {isClosed && !event.hasRegistered && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm border border-gray-300/20 bg-gray-500/25 text-gray-100">
                    <XCircle size={13}/> Closed
                  </span>
                )}
                {event.hasRegistered && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm border border-emerald-300/20 bg-emerald-600 text-emerald-100">
                    <CheckCircle2 size={13}/> Registered
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
                {event.name}
              </h1>
              <p className="text-gray-200 text-xs sm:text-base font-medium leading-relaxed max-w-xl">
                {event.tagline}
              </p>

              {/* Meta */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-5 mt-2 text-gray-200 text-xs sm:text-sm font-semibold">
                {[
                  { icon: <CalendarDays size={15}/>, label: formatDate(event.startTime) },
                  { icon: <Users size={15}/>, label: `Team: ${event.teamSize?.min}–${event.teamSize?.max}` },
                  { icon: <Ticket size={15}/>, label: `₹${event.entryFee}` },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ color: "#F5A623" }}>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prize card */}
            <div className="w-full sm:w-auto sm:max-w-sm bg-white/10 backdrop-blur-xl p-5 sm:p-8 rounded-2xl text-white text-center shadow-2xl border border-white/10 flex flex-col items-center justify-center">
              <span className="text-gray-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">
                Total Prize Pool
              </span>
              <span
                className="text-2xl sm:text-4xl font-black drop-shadow-md mt-2"
                style={{
                  background: BRAND.grad,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "brightness(1.4)",
                }}
              >
                ₹{totalPrize?.toLocaleString() || 0}
              </span>
              <div className="w-full h-px bg-white/20 my-3" />
              {event.prizes?.[0]?.amount && (
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-emerald-300">
                  <Trophy size={15} className="text-amber-300"/>
                  1st Prize: ₹{event.prizes[0].amount.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 mt-10 items-start">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <Card>
              <SectionTitle icon={<ClipboardList size={20} style={{ color: BRAND.coral }}/>}>
                About the Event
              </SectionTitle>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{event.description}</p>
            </Card>

            {/* Prizes */}
            <Card>
              <SectionTitle icon={<Trophy size={20} className="text-amber-500"/>}>
                Prizes & Rewards
              </SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.prizes?.map((prize, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5 border border-[#EDD9F0] text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, #FDF0F3 0%, #F3F0FD 100%)" }}
                  >
                    <div
                      className="mx-auto size-12 rounded-2xl flex items-center justify-center mb-3 border"
                      style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
                    >
                      <Trophy size={20} style={{ color: BRAND.purple }}/>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{prize.position}</h3>
                    <p
                      className="text-xl sm:text-2xl font-black"
                      style={{
                        background: BRAND.grad,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ₹{prize.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">+ {prize.perks}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rules */}
            <Card>
              <SectionTitle icon={<Gavel size={20} style={{ color: BRAND.purple }}/>}>
                Rules & Requirements
              </SectionTitle>
              <ul className="space-y-3">
                {event.rules?.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-gray-700 text-sm sm:text-base">
                    <CheckCircle2 size={17} className="text-emerald-500 mt-0.5 shrink-0"/>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="lg:sticky lg:top-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Quick Info</h3>

              <div className="space-y-3 text-sm">
                {[
                  { label: "Start Date", value: formatDate(event.startTime) },
                  { label: "End Date",   value: formatDate(event.endTime) },
                  { label: "Reg. End",   value: event.registrationDeadline ? formatDate(event.registrationDeadline) : "N/A" },
                  { label: "Entry Fee",  value: `₹${event.entryFee}` },
                  { label: "Team Size",  value: `${event.teamSize?.min}–${event.teamSize?.max}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1 border-b border-[#F3F0FD] last:border-0">
                    <span className="text-gray-500 font-semibold">{label}</span>
                    <span className="font-bold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              {/* Venue */}
              <div
                className="mt-6 rounded-2xl p-4 border"
                style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
              >
                <h3 className="text-sm font-black text-gray-900 mb-1.5 flex items-center gap-2">
                  <MapPin size={16} style={{ color: BRAND.purple }}/> Venue
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{event.venue}</p>
              </div>

              {/* Coordinator */}
              <div
                className="mt-4 rounded-2xl p-4 border"
                style={{ background: BRAND.coralSurface, borderColor: "#F0BBCA" }}
              >
                <h3 className="text-sm font-black text-gray-900 mb-1.5 flex items-center gap-2">
                  <UserCircle2 size={16} style={{ color: BRAND.coral }}/> Coordinator
                </h3>
                <p className="text-gray-800 font-bold text-sm">{event.createdBy?.name || "Admin"}</p>
                {event.createdBy?.email && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <Mail size={12}/> {event.createdBy.email}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── FIXED BOTTOM ACTION BAR ───────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t py-4 px-4 sm:px-8 z-40"
        style={{
          borderColor: "#EDD9F0",
          boxShadow: "0 -10px 40px -10px rgba(212,96,122,0.15)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex flex-col">
            {isClosingSoon && !isClosed && (
              <span className="text-xs font-black text-red-600 uppercase tracking-wide flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                Closing soon
              </span>
            )}
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Entry Fee:{" "}
              <span className="font-black" style={{ color: BRAND.coral }}>
                ₹{event.entryFee}
              </span>
            </p>
          </div>

          {/* CTA */}
          <button
            disabled={event.hasRegistered || isRegistering || isClosed}
            onClick={handleRegistration}
            className="min-w-40 sm:min-w-44 px-6 py-3 rounded-xl font-black text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:active:scale-100"
            style={
              event.hasRegistered
                ? { background: "#ECFDF5", color: "#065F46", cursor: "not-allowed", boxShadow: "none" }
                : isClosed
                ? { background: "#F3F4F6", color: "#9CA3AF", cursor: "not-allowed", boxShadow: "none" }
                : {
                    background: BRAND.gradBr,
                    color: "white",
                    boxShadow: "0 4px 20px rgba(212,96,122,0.4)",
                  }
            }
            onMouseEnter={e => {
              if (!event.hasRegistered && !isClosed && !isRegistering)
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(83,74,183,0.45)";
            }}
            onMouseLeave={e => {
              if (!event.hasRegistered && !isClosed)
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,96,122,0.4)";
            }}
          >
            {event.hasRegistered ? (
              <><CheckCircle2 size={17}/> Registered</>
            ) : isClosed ? (
              <><XCircle size={17}/> Closed</>
            ) : isRegistering ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Registering...
              </span>
            ) : (
              <>Register Now <ArrowRight size={17}/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}