import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, LogOut, LayoutDashboard, CalendarPlus, UserPlus,
  Users, CalendarDays, TicketCheck, ClipboardList, Home,
  LogIn, UserRound, UserCog, UsersRound,
} from "lucide-react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";

// ── Brand tokens (coral → purple) ─────────────────────────────────────────────
const BRAND = {
  coral:        "#D4607A",
  purple:       "#6B5EC7",
  indigo:       "#534AB7",
  amber:        "#F5A623",
  gradientText: "linear-gradient(90deg, #D4607A 0%, #6B5EC7 100%)",
  gradientBg:   "linear-gradient(135deg, #D4607A 0%, #6B5EC7 100%)",
  gradientHex:  "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
};

// ── Nav links per role ─────────────────────────────────────────────────────────
const NAV_LINKS = {
  guest: [
    { to: "/",       label: "Home",    icon: <Home size={15} /> },
    { to: "/login",  label: "Login",   icon: <LogIn size={15} /> },
    { to: "/signup", label: "Sign Up", icon: <UserRound size={15} /> },
  ],

  ADMIN: [
    { to: "/admin/dashboard",        label: "Dashboard",        icon: <LayoutDashboard size={15} /> },
    { to: "/admin/create-event",     label: "Create Event",     icon: <CalendarPlus size={15} /> },
    { to: "/admin/create-volunteer", label: "Create Volunteer", icon: <UserPlus size={15} /> },
    { to: "/admin/assign-volunteer", label: "Assign Volunteer", icon: <UserCog size={15} /> },
    { to: "/admin/participants",     label: "Participants",     icon: <Users size={15} /> },      // ← added
    { to: "/admin/volunteers",       label: "Volunteers",       icon: <UsersRound size={15} /> }, // ← added
  ],

  STUDENT: [
    { to: "/events",    label: "Events",     icon: <CalendarDays size={15} /> },
    { to: "/my-ticket", label: "My Tickets", icon: <TicketCheck size={15} /> },
    // /events/:id is a detail page accessed from the list — not shown in nav
  ],

  VOLUNTEER: [
    { to: "/assigned-events", label: "Assigned Events", icon: <ClipboardList size={15} /> },
    // /scan/:eventId is a dynamic QR scanner launched from within AssignedEvents — not shown in nav
  ],
};

// ── Role badge colors ──────────────────────────────────────────────────────────
const ROLE_STYLE = {
  ADMIN:     { bg: "#F3F0FD", text: "#534AB7", border: "#C4BBF0" },
  STUDENT:   { bg: "#FDF0F3", text: "#D4607A", border: "#F0BBCA" },
  VOLUNTEER: { bg: "#FEF6EC", text: "#C47A1A", border: "#F5D49A" },
};

// ── Eventify Logo ──────────────────────────────────────────────────────────────
// `compact` = md/lg when ADMIN is logged in — show hex icon only, hide wordmark
function EventifyLogo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group shrink-0 select-none">
      {/* Hexagon icon */}
      <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
        <svg width="40" height="40" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hexGrad" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#D4607A" />
              <stop offset="50%"  stopColor="#8B5CB7" />
              <stop offset="100%" stopColor="#534AB7" />
            </linearGradient>
          </defs>
          <path d="M23 2 L42 12.5 L42 33.5 L23 44 L4 33.5 L4 12.5 Z" fill="url(#hexGrad)" />
          <path d="M23 5 L39 14.5 L39 31.5 L23 41 L7 31.5 L7 14.5 Z" fill="white" fillOpacity="0.06" />
          <text
            x="23" y="31" textAnchor="middle" fill="white"
            fontSize="24" fontWeight="700"
            fontFamily="Georgia, 'Times New Roman', serif"
            opacity="0.95"
          >
            E
          </text>
          <circle cx="37" cy="9" r="3.5" fill="#F5A623" />
          <circle cx="37" cy="9" r="1.8" fill="white" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Wordmark — hidden on md/lg when compact (many links), shown on xl+ or when few links */}
      <div className={`flex-col leading-none ${compact ? "hidden xl:flex" : "hidden sm:flex"}`}>
        <span
          className="text-[20px] font-bold tracking-tight"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            background: BRAND.gradientText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Eventify
        </span>
        <span
          className="text-[8px] font-semibold tracking-[0.18em] uppercase mt-0.5"
          style={{ color: "#9B9BA8" }}
        >
          College Events
        </span>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const { auth, logout } = useAuthContext();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  const role      = auth?.user?.role;
  const links     = role ? NAV_LINKS[role] : NAV_LINKS.guest;
  const roleStyle = ROLE_STYLE[role] || {};

  const handleLogout = () => {
    logout();
    setOpenMenu(false);
    navigate("/login");
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(" ").filter(Boolean);
    if (!words.length) return "?";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [openMenu]);

  // ── Desktop nav link ─────────────────────────────────────────────────────────
  const DesktopLink = ({ to, label, icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className="group relative flex items-center gap-1.5 px-1 py-1 text-sm font-semibold transition-colors duration-200"
        style={{ color: active ? BRAND.coral : "#6B7280" }}
      >
        <span
          style={{ color: active ? BRAND.coral : "#9CA3AF" }}
          className="transition-colors duration-200 group-hover:text-[#D4607A]"
        >
          {icon}
        </span>
        <span className="group-hover:text-[#D4607A] transition-colors duration-200">
          {label}
        </span>
        {/* Animated underline */}
        <span
          className="absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 ease-out group-hover:w-full"
          style={{
            background: BRAND.gradientText,
            width: active ? "100%" : "0%",
          }}
        />
      </Link>
    );
  };

  // ── Drawer nav link ──────────────────────────────────────────────────────────
  const DrawerLink = ({ to, label, icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={() => setOpenMenu(false)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background: active ? "linear-gradient(90deg,#FDF0F3,#F3F0FD)" : "transparent",
          color:  active ? BRAND.coral : "#6B7280",
          border: active ? "1px solid #F0BBCA" : "1px solid transparent",
        }}
      >
        <span style={{ color: active ? BRAND.coral : "#9CA3AF" }}>{icon}</span>
        {label}
        {active && (
          <span
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ background: BRAND.gradientBg }}
          />
        )}
      </Link>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  // ADMIN has 6 links — use compact mode on md/lg (icons only + tooltip), full labels on xl
  const isCompact = links.length > 4;

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Fixed single-row height — never wraps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3" style={{ height: 64 }}>

        {/* ── LEFT ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setOpenMenu(true)}
            aria-label="Open menu"
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={22} />
          </button>
          {/* compact=true hides wordmark on md/lg so links have more room */}
          <EventifyLogo compact={isCompact} />
        </div>

        {/* ── CENTER: Desktop nav — NO flex-wrap, overflow hidden ───────────── */}
        <nav className="hidden md:flex items-center justify-center flex-1 overflow-hidden"
          style={{ gap: isCompact ? "4px" : "28px" }}
        >
          {links.map((link) => {
            const active = isActive(link.to);
            if (isCompact) {
              // Icon-only pill with tooltip on md/lg, add label on xl
              return (
                <Tooltip key={link.to} title={link.label} placement="bottom" arrow>
                  <Link
                    to={link.to}
                    className="group relative flex items-center shrink-0 transition-all duration-200"
                    style={{
                      gap: 5,
                      padding: "6px 10px",
                      borderRadius: 10,
                      background: active
                        ? "linear-gradient(90deg,#FDF0F3,#F3F0FD)"
                        : "transparent",
                      border: active ? "1px solid #F0BBCA" : "1px solid transparent",
                      color: active ? BRAND.coral : "#6B7280",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "#F8F5FF";
                        e.currentTarget.style.color = BRAND.coral;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#6B7280";
                      }
                    }}
                  >
                    <span style={{ color: active ? BRAND.coral : "#9CA3AF", display: "flex", alignItems: "center" }}
                      className="group-hover:text-[#D4607A] transition-colors"
                    >
                      {link.icon}
                    </span>
                    {/* Label only on xl+ */}
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                </Tooltip>
              );
            }
            // Standard link with animated underline
            return <DesktopLink key={link.to} to={link.to} label={link.label} icon={link.icon} />;
          })}
        </nav>

        {/* ── RIGHT ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {auth && (
            <>
              {/* Role badge — hide on lg when compact to save space */}
              {role && (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${isCompact ? "hidden xl:inline-flex" : "hidden lg:inline-flex"}`}
                  style={{
                    background:  roleStyle.bg,
                    color:       roleStyle.text,
                    borderColor: roleStyle.border,
                  }}
                >
                  {role}
                </span>
              )}

              {/* Logout — icon-only on md/lg when compact, full on xl */}
              <Tooltip title="Logout" arrow placement="bottom">
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border shrink-0"
                  style={{
                    background:  "#FDF0F3",
                    color:       BRAND.coral,
                    borderColor: "#F0BBCA",
                    // compact: icon-only pill, xl: icon + text
                    padding: isCompact ? "8px 10px" : "8px 14px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAE4EA"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FDF0F3"; }}
                >
                  <LogOut size={15} />
                  <span className={isCompact ? "hidden xl:inline" : ""}>Logout</span>
                </button>
              </Tooltip>

              {/* Avatar */}
              <Tooltip title={auth?.user?.name || "Profile"} arrow placement="bottom">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    background: BRAND.gradientBg,
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(212,96,122,0.35)",
                    "&:hover": { boxShadow: "0 4px 16px rgba(107,94,199,0.4)" },
                    transition: "box-shadow 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(auth?.user?.name)}
                </Avatar>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <Drawer
        anchor="left"
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        PaperProps={{
          sx: {
            width: 288,
            borderRadius: "0 16px 16px 0",
            border: "none",
            boxShadow: "8px 0 32px rgba(107,94,199,0.15)",
          },
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <EventifyLogo />
          <button
            onClick={() => setOpenMenu(false)}
            aria-label="Close menu"
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info card */}
        {auth && (
          <>
            <div
              className="mx-4 mb-3 px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #FDF0F3 0%, #F3F0FD 100%)",
                border: "1px solid #EDD9F0",
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  background: BRAND.gradientBg,
                }}
              >
                {getInitials(auth?.user?.name)}
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {auth?.user?.name || "User"}
                </p>
                {role && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: roleStyle.bg, color: roleStyle.text }}
                  >
                    {role}
                  </span>
                )}
              </div>
            </div>
            <Divider sx={{ mx: 2, mb: 1, borderColor: "#F3EEF8" }} />
          </>
        )}

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
          {links.map((link) => (
            <DrawerLink key={link.to} {...link} />
          ))}
        </nav>

        {/* Logout */}
        {auth && (
          <>
            <Divider sx={{ mx: 2, borderColor: "#F3EEF8" }} />
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: BRAND.gradientBg,
                  boxShadow: "0 4px 14px rgba(212,96,122,0.35)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(107,94,199,0.45)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,96,122,0.35)"; }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </>
        )}
      </Drawer>
    </header>
  );
}