import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Download,
  Ticket as TicketIcon,
  CalendarDays,
  MapPin,
  Eye,
  X,
  Search,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function MyTickets() {
  const { auth } = useAuthContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${baseURL}/participations/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setTickets(res.data?.tickets || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Could not load your tickets");
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchTickets();
  }, [auth]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success("Ticket ID copied to clipboard!");
  };

  const handleDownload = async (ticket) => {
    setDownloadingId(ticket._id);
    const element = document.getElementById(`print-${ticket._id}`);
    if (!element) {
      setDownloadingId(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2.5,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "pt", "a4");
      const imgWidth = 400;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 97, 80, imgWidth, imgHeight);
      pdf.save(`eventify-pass-${ticket.eventId?.name ? ticket.eventId.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : ticket._id}.pdf`);
      toast.success("Ticket PDF downloaded!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter(
      (t) =>
        t.eventId?.name?.toLowerCase().includes(q) ||
        t.eventId?.venue?.toLowerCase().includes(q) ||
        t._id?.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  return (
    <DashboardLayout
      searchPlaceholder="Search your tickets..."
      onSearch={(q) => setSearchQuery(q)}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <TicketIcon size={14} />
            <span>Digital Wallet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            My Event Passes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Present your verified QR pass at the entrance gate for instant check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by event name or ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse space-y-4"
            >
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-44 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <TicketIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {searchQuery ? "No matching tickets" : "No event passes found"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {searchQuery
              ? "Try adjusting your search keywords to locate your pass."
              : "You haven't registered for any events yet. Explore upcoming campus hackathons, workshops, and fests to claim your pass."}
          </p>
          <div className="mt-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles size={14} /> Explore Campus Events
            </Link>
          </div>
        </div>
      ) : (
        /* Tickets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => {
            const qrData = JSON.stringify({ participationId: ticket._id });
            const event = ticket.eventId || {};

            return (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Top Banner Stripe */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-5 text-white relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-white/20 backdrop-blur-md text-white border border-white/30 uppercase">
                      <ShieldCheck size={12} /> Confirmed Pass
                    </span>
                    <span className="text-[10px] font-mono text-indigo-100 tracking-wider">
                      #PASS-{ticket._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mt-2.5 leading-snug line-clamp-1">
                    {event.name || "Event Pass"}
                  </h3>

                  <div className="mt-2.5 space-y-1 text-xs text-indigo-100">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="shrink-0" />
                      <span>{event.startTime ? formatDate(event.startTime) : "TBA"}</span>
                      {event.startTime && (
                        <span className="opacity-75">· {formatTime(event.startTime)}</span>
                      )}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="shrink-0" />
                      <span className="truncate">{event.venue || "Campus Venue"}</span>
                    </p>
                  </div>
                </div>

                {/* Perforation Tear Notch */}
                <div className="relative flex items-center justify-between px-3 -my-3 z-10">
                  <div className="size-6 rounded-full bg-slate-50 dark:bg-[#0F172A] -ml-6 border-r border-slate-200/80 dark:border-slate-800" />
                  <div className="flex-1 border-b-2 border-dashed border-slate-200 dark:border-slate-700/80 mx-2" />
                  <div className="size-6 rounded-full bg-slate-50 dark:bg-[#0F172A] -mr-6 border-l border-slate-200/80 dark:border-slate-800" />
                </div>

                {/* Card Body & QR Section */}
                <div className="p-5 flex-1 flex flex-col items-center justify-between">
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group/qr flex flex-col items-center"
                    title="Click to expand QR Code"
                  >
                    <div className="bg-white p-2.5 rounded-xl shadow-xs">
                      <QRCode value={qrData} size={130} fgColor="#0F172A" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover/qr:text-indigo-600 dark:group-hover/qr:text-indigo-400 mt-2 flex items-center gap-1">
                      <Eye size={12} /> Tap to expand for scanning
                    </span>
                  </div>

                  {/* Pass Metadata */}
                  <div className="w-full mt-4 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Attendee
                      </p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {auth?.user?.name || "Student"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyId(ticket._id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                      title="Copy Pass ID"
                    >
                      <span>{ticket._id.slice(0, 8)}...</span>
                      <Copy size={11} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Eye size={14} /> Full Pass
                    </button>

                    <button
                      onClick={() => handleDownload(ticket)}
                      disabled={downloadingId === ticket._id}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-xs"
                    >
                      <Download size={14} />
                      {downloadingId === ticket._id ? "Saving..." : "PDF Ticket"}
                    </button>
                  </div>
                </div>

                {/* Hidden Layout for Crisp PDF Generation */}
                <div
                  id={`print-${ticket._id}`}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    width: "480px",
                    backgroundColor: "#ffffff",
                    padding: "36px",
                    borderRadius: "24px",
                    fontFamily: "'Inter', sans-serif",
                    color: "#0F172A",
                    boxShadow: "none",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      padding: "24px",
                      borderRadius: "16px",
                      color: "#ffffff",
                      marginBottom: "24px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Eventify Pass
                      </span>
                      <span style={{ fontSize: "11px", opacity: 0.85 }}>
                        Confirmed Pass
                      </span>
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: "800", marginTop: "12px", lineHeight: "1.2" }}>
                      {event.name}
                    </h2>
                    <p style={{ fontSize: "13px", marginTop: "8px", opacity: 0.9 }}>
                      📅 {event.startTime ? formatDate(event.startTime) : "TBA"} • {event.startTime ? formatTime(event.startTime) : ""}
                    </p>
                    <p style={{ fontSize: "13px", marginTop: "4px", opacity: 0.9 }}>
                      📍 {event.venue || "College Campus"}
                    </p>
                  </div>

                  <div style={{ textAlign: "center", padding: "16px" }}>
                    <div style={{ display: "inline-block", padding: "14px", border: "2px solid #E2E8F0", borderRadius: "16px" }}>
                      <QRCode value={qrData} size={220} fgColor="#0F172A" />
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748B", marginTop: "16px" }}>
                      Show this official QR code at the check-in desk for entry.
                    </p>
                    <div style={{ marginTop: "16px", padding: "10px", background: "#F8FAFC", borderRadius: "10px", fontSize: "11px", color: "#0F172A" }}>
                      <strong>Attendee:</strong> {auth?.user?.name || "Student"} &nbsp;|&nbsp;
                      <strong>Ticket ID:</strong> {ticket._id}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal Preview */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-white/20 text-white">
                  Entrance Pass
                </span>
                <h3 className="text-lg font-bold mt-2 leading-snug">
                  {selectedTicket.eventId?.name}
                </h3>
                <p className="text-xs text-indigo-100 mt-1 flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  {selectedTicket.eventId?.startTime
                    ? formatDate(selectedTicket.eventId.startTime)
                    : "TBA"}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700">
                  <QRCode
                    value={JSON.stringify({ participationId: selectedTicket._id })}
                    size={220}
                    fgColor="#0F172A"
                  />
                </div>

                <div className="w-full mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-slate-400 font-medium">Attendee Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {auth?.user?.name || "Student"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-slate-400 font-medium">Venue</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                      {selectedTicket.eventId?.venue || "Campus Venue"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-slate-400 font-medium">Ticket ID</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedTicket._id.slice(0, 14)}...
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(selectedTicket)}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Download size={16} /> Download High-Res Pass (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}