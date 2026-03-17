import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download, Ticket, AlertCircle,
  CalendarDays, MapPin, Eye, X,
} from "lucide-react";
import { useAuthContext } from "../../../hooks/useAuthContext";

const BRAND = {
  grad:    "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:   "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:   "#D4607A",
  purple:  "#534AB7",
  coralSurface:  "#FDF0F3",
  purpleSurface: "#F3F0FD",
};

const MyTicket = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const { auth } = useAuthContext();
  const [tickets, setTickets]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    document.body.style.overflow = selectedTicket ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedTicket]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${baseURL}/participations/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setTickets(res.data.tickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchTickets();
  }, [auth]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const handleDownload = async (id) => {
    const element = document.getElementById(`print-${id}`);
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "pt", "a4");
    const imgWidth = 350;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 120, 80, imgWidth, imgHeight);
    pdf.save(`ticket-${id}.pdf`);
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8fc] px-4 sm:px-8 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 w-48 rounded-xl mb-2" style={{ background: "#EDD9F0" }} />
          <div className="h-4 w-72 rounded mb-10" style={{ background: "#F3F0FD" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-[#EDD9F0] rounded-2xl overflow-hidden shadow-sm">
                <div className="h-28" style={{ background: "#F3F0FD" }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded" style={{ background: "#F3F0FD" }} />
                  <div className="h-4 w-1/2 rounded" style={{ background: "#F3F0FD" }} />
                  <div className="h-44 rounded-2xl" style={{ background: "#F3F0FD" }} />
                  <div className="h-9 w-full rounded-xl" style={{ background: "#EDD9F0" }} />
                  <div className="h-9 w-full rounded-xl" style={{ background: "#EDD9F0" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!tickets.length) {
    return (
      <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center px-4">
        <div className="bg-white border border-[#EDD9F0] shadow-sm rounded-2xl p-8 max-w-md w-full text-center">
          <div
            className="mx-auto size-14 rounded-2xl flex items-center justify-center mb-5 border"
            style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
          >
            <AlertCircle size={26} style={{ color: BRAND.purple }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">No Tickets Found</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            You haven't registered for any event yet. Once you register, your tickets will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8fc] px-4 sm:px-8 lg:px-10 py-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1
            className="text-2xl sm:text-3xl font-black flex items-center gap-2"
            style={{
              background: BRAND.gradH,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Ticket size={26} style={{ color: BRAND.coral }} />
            My Tickets
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            View and download your event tickets. Show the QR code at the event entrance.
          </p>
          <div className="mt-3 h-1 w-16 rounded-full" style={{ background: BRAND.gradH }} />
        </div>

        {/* ── Tickets grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tickets.map((ticket) => {
            const qrData = JSON.stringify({ participationId: ticket._id });

            return (
              <div
                key={ticket._id}
                className="bg-white rounded-2xl shadow-sm border border-[#EDD9F0] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Card header */}
                <div
                  className="px-5 py-5 text-white"
                  style={{ background: BRAND.grad }}
                >
                  <h2 className="font-black text-base leading-snug line-clamp-2 min-h-12">
                    {ticket.eventId?.name}
                  </h2>
                  <div className="mt-3 space-y-1 text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <p className="flex items-center gap-2 min-h-4">
                      <CalendarDays size={13} />
                      {ticket.eventId?.startTime ? formatDate(ticket.eventId.startTime) : "N/A"}
                    </p>
                    <p className="flex items-center gap-2 line-clamp-1 min-h-4">
                      <MapPin size={13} />
                      {ticket.eventId?.venue || "N/A"}
                    </p>
                  </div>
                </div>

                {/* QR section */}
                <div className="p-5 flex flex-col items-center">
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className="rounded-2xl p-4 flex items-center justify-center w-full cursor-zoom-in border transition-all duration-200 hover:shadow-md"
                    style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
                  >
                    <QRCode value={qrData} size={155} fgColor={BRAND.purple} />
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Ticket ID</p>
                  <p className="text-xs font-black text-gray-700 text-center break-all mt-0.5">{ticket._id}</p>

                  {/* View */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border transition-all duration-200 active:scale-95"
                    style={{ background: BRAND.purpleSurface, color: BRAND.purple, borderColor: "#C4BBF0" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EAE5FB"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = BRAND.purpleSurface; }}
                  >
                    <Eye size={16} /> View Ticket
                  </button>

                  {/* Download */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(ticket._id); }}
                    className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
                    style={{ background: BRAND.grad, boxShadow: "0 4px 14px rgba(212,96,122,0.3)" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,96,122,0.3)"; }}
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>

                {/* Hidden print layout */}
                <div
                  id={`print-${ticket._id}`}
                  style={{
                    position: "absolute", left: "-9999px", top: 0,
                    width: "420px", backgroundColor: "#ffffff",
                    padding: "35px", textAlign: "center",
                    fontFamily: "Arial, sans-serif", color: "#000000",
                    border: "2px solid #EDD9F0", borderRadius: "18px",
                  }}
                >
                  <h2 style={{ marginBottom: "14px", fontSize: "22px", fontWeight: "800", color: BRAND.coral }}>
                    Event Ticket
                  </h2>
                  <p style={{ fontSize: "14px", marginBottom: "20px" }}>{ticket.eventId?.name}</p>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <QRCode value={qrData} size={210} fgColor={BRAND.purple} />
                  </div>
                  <p style={{ fontSize: "13px", marginTop: "15px" }}>Ticket ID:</p>
                  <p style={{ fontSize: "12px", marginTop: "6px", wordBreak: "break-all", fontWeight: "700" }}>
                    {ticket._id}
                  </p>
                  <p style={{ marginTop: "18px", fontSize: "12px" }}>
                    Present this QR code at the event entrance.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ticket preview modal ─────────────────────────────────────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#EDD9F0] overflow-hidden">

            {/* Modal header */}
            <div
              className="px-5 py-4 flex items-start justify-between text-white"
              style={{ background: BRAND.grad }}
            >
              <div>
                <h2 className="font-black text-base leading-snug">{selectedTicket.eventId?.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Ticket Preview</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition"
              >
                <X size={19} className="text-white" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 flex flex-col items-center">
              <div
                className="rounded-2xl p-5 border"
                style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
              >
                <QRCode
                  value={JSON.stringify({ participationId: selectedTicket._id })}
                  size={210}
                  fgColor={BRAND.purple}
                />
              </div>

              <div className="w-full mt-5 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <CalendarDays size={15} style={{ color: BRAND.coral }} />
                  {selectedTicket.eventId?.startTime ? formatDate(selectedTicket.eventId.startTime) : "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} style={{ color: BRAND.coral }} />
                  {selectedTicket.eventId?.venue || "N/A"}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-4">Ticket ID</p>
                <p className="font-black text-gray-800 break-all text-xs">{selectedTicket._id}</p>
              </div>

              <button
                onClick={() => handleDownload(selectedTicket._id)}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
                style={{ background: BRAND.grad, boxShadow: "0 4px 14px rgba(212,96,122,0.3)" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,96,122,0.3)"; }}
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicket;