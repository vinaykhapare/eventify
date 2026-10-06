import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  CheckCircle2,
  XCircle,
  ScanLine,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Keyboard,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function QrScanner() {
  const { eventId } = useParams();
  const { auth } = useAuthContext();

  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [sessionScans, setSessionScans] = useState(0);

  const processCheckIn = async (participationId) => {
    try {
      setScanning(false);
      const res = await axios.post(
        `${baseURL}/participations/${participationId}/checkin`,
        { eventId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setStatus("success");
      setFeedbackMessage(res.data?.message || "Attendee successfully verified & checked in!");
      setSessionScans((prev) => prev + 1);
      toast.success("Check-in confirmed!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.messsage ||
        err.response?.data?.message ||
        "Invalid or already checked-in ticket";
      setStatus("error");
      setFeedbackMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setTimeout(() => {
        setScanning(true);
        setStatus(null);
        setFeedbackMessage("");
      }, 3500);
    }
  };

  const handleScan = async (result) => {
    if (!result || !scanning) return;

    let participationId;
    try {
      const parsed = JSON.parse(result[0].rawValue);
      participationId = parsed.participationId;
    } catch {
      participationId = result[0]?.rawValue || result;
    }

    if (participationId) {
      processCheckIn(participationId);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCheckIn(manualCode.trim());
    setManualCode("");
    setShowManual(false);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/assigned-events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Assigned Shifts
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Gate Check-in Station
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              SCANNER ACTIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Aim camera at student digital boarding passes to record instant admissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300">
            Session Check-ins: <strong className="text-indigo-600 dark:text-indigo-400 text-sm ml-1">{sessionScans}</strong>
          </div>
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Top Camera Bar */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanLine size={18} className="text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Optical QR Reader
              </span>
            </div>
            <button
              onClick={() => setShowManual(!showManual)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              <Keyboard size={13} /> {showManual ? "Use Camera" : "Manual Code"}
            </button>
          </div>

          {/* Scanner Viewport / Manual input */}
          <div className="p-6 relative bg-slate-950 flex flex-col items-center justify-center min-h-[360px]">
            {showManual ? (
              <form onSubmit={handleManualSubmit} className="w-full space-y-4 my-auto p-4">
                <div className="text-center space-y-1">
                  <Keyboard size={28} className="text-indigo-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Manual Pass ID Entry</h3>
                  <p className="text-xs text-slate-400">
                    Paste or type the alphanumeric ticket UUID
                  </p>
                </div>

                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. 6701f..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={14} /> Validate Ticket
                </button>
              </form>
            ) : (
              <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-inner">
                {scanning && (
                  <Scanner
                    onScan={handleScan}
                    formats={["qr_code"]}
                    components={{ finder: false }}
                    styles={{
                      container: { width: "100%", height: "100%" },
                      video: { objectFit: "cover" },
                    }}
                  />
                )}

                {/* Reticle Overlay corners */}
                <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="size-6 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
                    <div className="size-6 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
                  </div>
                  <div className="flex justify-between">
                    <div className="size-6 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
                    <div className="size-6 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Animated Laser Beam */}
                {scanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#818CF8] animate-pulse top-1/2 -translate-y-1/2" />
                )}

                {/* Live Result Feedback Overlay */}
                {status && (
                  <div
                    className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all ${
                      status === "success"
                        ? "bg-emerald-950/80 text-emerald-100"
                        : "bg-rose-950/80 text-rose-100"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 size={54} className="text-emerald-400 mb-2 animate-bounce" />
                    ) : (
                      <XCircle size={54} className="text-rose-400 mb-2 animate-shake" />
                    )}
                    <h4 className="font-extrabold text-sm text-center">
                      {status === "success" ? "ACCESS GRANTED" : "VERIFICATION FAILED"}
                    </h4>
                    <p className="text-xs text-center mt-1 leading-snug opacity-90">
                      {feedbackMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Guide */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hold the QR code steady in front of the lens. Scanner automatically loops.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}