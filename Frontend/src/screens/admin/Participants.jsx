import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Search, Users, Mail, Phone, Calendar,
  BadgeCheck, AlertTriangle, Download, Filter, XCircle, Loader2,
} from "lucide-react";

const BRAND = {
  coral:         "#D4607A",
  purple:        "#6B5EC7",
  indigo:        "#534AB7",
  amber:         "#F5A623",
  gradientText:  "linear-gradient(90deg, #D4607A 0%, #6B5EC7 100%)",
  gradientBg:    "linear-gradient(135deg, #D4607A 0%, #6B5EC7 100%)",
  coralSurface:  { bg: "#FDF0F3", border: "#F0BBCA", text: "#D4607A" },
  purpleSurface: { bg: "#F3F0FD", border: "#C4BBF0", text: "#534AB7" },
  amberSurface:  { bg: "#FEF6EC", border: "#F5D49A", text: "#C47A1A" },
};

const STATUS = {
  Confirmed: { bg: "#EDFBF3", border: "#A3E6C0", text: "#1A7A4A", dot: "#2ECC7A", icon: BadgeCheck },
  Pending:   { bg: BRAND.amberSurface.bg, border: BRAND.amberSurface.border, text: BRAND.amberSurface.text, dot: BRAND.amber, icon: AlertTriangle },
  Cancelled: { bg: "#F5F5F7", border: "#DDDBE8", text: "#7B7396", dot: "#B0AABF", icon: XCircle },
};

const StatCard = ({ label, value, icon: Icon, gradient, surface }) => (
  <div
    style={{ background: "#fff", border: "1px solid #EEE9FA", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 10px rgba(107,94,199,0.06)", display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow 0.2s, transform 0.2s" }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(107,94,199,0.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(107,94,199,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7B6E9A" }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: surface.bg, border: `1px solid ${surface.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={surface.text} />
      </div>
    </div>
    <span style={{ fontSize: "2rem", fontFamily: "'Syne', sans-serif", fontWeight: 800, background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.Cancelled;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px 4px 8px", borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.02em" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
};

const Avatar = ({ name }) => {
  const ini = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hue = name.charCodeAt(0) % 2 === 0 ? BRAND.gradientBg : "linear-gradient(135deg,#6B5EC7,#534AB7)";
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: hue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.03em", boxShadow: "0 2px 8px rgba(107,94,199,0.22)" }}>
      {ini}
    </div>
  );
};

const GhostBtn = ({ children, onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #E8E3F5", background: "#fff", color: "#4B4568", fontSize: "0.82rem", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap" }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "#F3F0FD"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
  >
    {children}
  </button>
);

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: "16px 20px" }}>
        <div style={{ height: 12, width: [160, 120, 180, 90, 70][i] || 100, borderRadius: 6, background: "linear-gradient(90deg,#F0EBF8 25%,#E8E3F5 50%,#F0EBF8 75%)", backgroundSize: "200% 100%", animation: "pt-shimmer 1.4s infinite" }} />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Participants = () => {
  const baseURL = import.meta.env.VITE_API_URL;

  const [searchQuery,   setSearchQuery]   = useState("");
  const [participants,  setParticipants]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError("");
        const auth  = JSON.parse(localStorage.getItem("auth"));
        const token = auth?.token;
        const res   = await axios.get(`${baseURL}/participations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParticipants(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load participants.");
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const q = searchQuery.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.event.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    );
  }, [searchQuery, participants]);

  const counts = {
    total:     participants.length,
    confirmed: participants.filter((p) => p.status === "Confirmed").length,
    pending:   participants.filter((p) => p.status === "Pending").length,
    cancelled: participants.filter((p) => p.status === "Cancelled").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .pt-root * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .pt-row { transition: background 0.12s; }
        .pt-row:hover { background: #F8F5FF !important; }
        .pt-search-wrap:focus-within { border-color: ${BRAND.purple} !important; box-shadow: 0 0 0 3px rgba(107,94,199,0.12) !important; }
        @keyframes pt-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pt-spin    { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .pt-stats         { grid-template-columns: 1fr 1fr !important; }
          .pt-topbar-right  { flex-direction: column !important; align-items: stretch !important; }
          .pt-topbar        { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <div className="pt-root" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8F5FF 0%, #FDF0F3 40%, #F5F0FF 100%)" }}>

        {/* ── Sticky Top Bar ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EEE9FA", padding: "14px 24px" }}>
          <div className="pt-topbar" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.03em", background: BRAND.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0, lineHeight: 1.2 }}>
                Participants
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#9B8FC4", margin: "3px 0 0", fontWeight: 500 }}>
                View and manage event participants
              </p>
            </div>

            <div className="pt-topbar-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="pt-search-wrap" style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAFAFE", border: "1.5px solid #E8E3F5", borderRadius: 12, padding: "9px 14px", width: 260, transition: "border-color 0.2s, box-shadow 0.2s" }}>
                <Search size={15} color="#9B8FC4" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search participants…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "0.85rem", color: "#1a1033", fontFamily: "inherit" }}
                />
                {searchQuery && <XCircle size={15} color="#9B8FC4" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setSearchQuery("")} />}
              </div>
              <GhostBtn><Filter size={14} />Filter</GhostBtn>
              <button
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: BRAND.gradientBg, color: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(212,96,122,0.28)", transition: "all 0.15s", fontFamily: "inherit" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(212,96,122,0.38)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(212,96,122,0.28)"; }}
              >
                <Download size={14} />Export
              </button>
            </div>
          </div>
        </div>

        {/* ── Page Content ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>

          {/* Stats */}
          <div className="pt-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Participants" value={loading ? "—" : counts.total}     icon={Users}          gradient={BRAND.gradientText}                            surface={BRAND.purpleSurface} />
            <StatCard label="Confirmed"          value={loading ? "—" : counts.confirmed} icon={BadgeCheck}     gradient="linear-gradient(90deg,#1A7A4A,#2ECC7A)"         surface={{ bg: "#EDFBF3", border: "#A3E6C0", text: "#1A7A4A" }} />
            <StatCard label="Pending"            value={loading ? "—" : counts.pending}   icon={AlertTriangle}  gradient={`linear-gradient(90deg,${BRAND.amber},#C47A1A)`} surface={BRAND.amberSurface} />
            <StatCard label="Cancelled"          value={loading ? "—" : counts.cancelled} icon={XCircle}        gradient="linear-gradient(90deg,#9B8FC4,#534AB7)"          surface={{ bg: "#F5F5F7", border: "#DDDBE8", text: "#7B7396" }} />
          </div>

          {/* Table Card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #EEE9FA", boxShadow: "0 2px 14px rgba(107,94,199,0.07)", overflow: "hidden" }}>

            {/* Card Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0EBF8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1033", margin: "0 0 3px", letterSpacing: "-0.01em" }}>Participants List</h3>
                <p style={{ fontSize: "0.78rem", color: "#9B8FC4", margin: 0 }}>
                  {loading
                    ? "Loading…"
                    : <><span style={{ color: BRAND.purple, fontWeight: 700 }}>{filteredParticipants.length}</span> of <span style={{ color: "#1a1033", fontWeight: 700 }}>{participants.length}</span> participants{searchQuery && <span style={{ color: BRAND.purple, fontWeight: 700 }}> — filtered by "{searchQuery}"</span>}</>
                  }
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Confirmed", "Pending", "Cancelled"].map((s) => <StatusBadge key={s} status={s} />)}
              </div>
            </div>

            {/* Error state */}
            {error && !loading && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: BRAND.coralSurface.bg, border: `1px solid ${BRAND.coralSurface.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <AlertTriangle size={20} color={BRAND.coral} />
                </div>
                <p style={{ fontWeight: 700, color: "#1a1033", margin: "0 0 4px" }}>Failed to load</p>
                <p style={{ fontSize: "0.83rem", color: "#9B8FC4", margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Table */}
            {!error && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                  <thead>
                    <tr style={{ background: "#FAFAFE", borderBottom: "1px solid #F0EBF8" }}>
                      {["Participant", "Event", "Contact", "Registered", "Status"].map((h) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9B8FC4", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Skeleton while loading */}
                    {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}

                    {/* Empty */}
                    {!loading && filteredParticipants.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "56px 24px", textAlign: "center" }}>
                          <div style={{ width: 52, height: 52, borderRadius: 16, background: BRAND.purpleSurface.bg, border: `1px solid ${BRAND.purpleSurface.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                            <Search size={22} color={BRAND.purple} />
                          </div>
                          <p style={{ fontWeight: 700, color: "#1a1033", margin: "0 0 4px" }}>No results found</p>
                          <p style={{ fontSize: "0.83rem", color: "#9B8FC4", margin: 0 }}>
                            {searchQuery
                              ? <>Nothing matched <span style={{ color: BRAND.coral, fontWeight: 700 }}>"{searchQuery}"</span></>
                              : "No participants have registered yet."}
                          </p>
                        </td>
                      </tr>
                    )}

                    {/* Rows */}
                    {!loading && filteredParticipants.map((p, i) => (
                      <tr key={p.id} className="pt-row" style={{ borderBottom: i < filteredParticipants.length - 1 ? "1px solid #F5F2FC" : "none" }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <Avatar name={p.name} />
                            <div>
                              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1a1033", margin: "0 0 2px", letterSpacing: "-0.01em" }}>{p.name}</p>
                              <p style={{ fontSize: "0.75rem", color: "#9B8FC4", margin: 0 }}>#{p.id.toString().slice(-4).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 8, background: BRAND.purpleSurface.bg, border: `1px solid ${BRAND.purpleSurface.border}`, color: BRAND.indigo, fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {p.event}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#4B4568" }}><Mail size={13} color="#9B8FC4" />{p.email}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#4B4568" }}><Phone size={13} color="#9B8FC4" />{p.phone}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#7B6E9A", whiteSpace: "nowrap" }}><Calendar size={13} color="#9B8FC4" />{p.registeredAt}</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: "14px 22px", borderTop: "1px solid #F0EBF8", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: "0.78rem", color: "#9B8FC4", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                {loading
                  ? <><Loader2 size={13} color={BRAND.purple} style={{ animation: "pt-spin 1s linear infinite" }} />Loading participants…</>
                  : <>Showing <span style={{ color: BRAND.purple, fontWeight: 700, margin: "0 3px" }}>{filteredParticipants.length}</span> of <span style={{ color: "#1a1033", fontWeight: 700, margin: "0 3px" }}>{participants.length}</span> participants</>
                }
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <GhostBtn disabled>← Previous</GhostBtn>
                <GhostBtn>Next →</GhostBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Participants;