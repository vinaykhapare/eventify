import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { CheckCircle2, XCircle, ScanLine, RefreshCw } from "lucide-react";

const BRAND = {
  grad:    "linear-gradient(135deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  gradH:   "linear-gradient(90deg, #D4607A 0%, #8B5CB7 50%, #534AB7 100%)",
  coral:   "#D4607A",
  purple:  "#534AB7",
  purpleSurface: "#F3F0FD",
};

const QrScanner = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const { eventId } = useParams();
  const { auth } = useAuthContext();

  const [scanning, setScanning] = useState(true);
  const [message, setMessage]   = useState(null);
  const [error, setError]       = useState(null);

  const handleScan = async (result) => {
    if (!result || !scanning) return;

    try {
      setScanning(false);
      setMessage(null);
      setError(null);

      let participationId;
      try {
        const parsed = JSON.parse(result[0].rawValue);
        participationId = parsed.participationId;
      } catch {
        participationId = result[0].rawValue;
      }

      const res = await axios.post(
        `${baseURL}/participations/${participationId}/checkin`,
        { eventId },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      setMessage(res.data.message);
    } catch (err) {
      const errorMsg =
        err.response?.data?.messsage ||
        err.response?.data?.message ||
        "Invalid QR Code";
      setError(errorMsg);
    } finally {
      setTimeout(() => {
        setScanning(true);
        setMessage(null);
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] flex flex-col items-center px-4 py-10">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center size-14 rounded-2xl mb-4 border"
          style={{ background: BRAND.purpleSurface, borderColor: "#C4BBF0" }}
        >
          <ScanLine size={26} style={{ color: BRAND.purple }} />
        </div>

        <h1
          className="text-2xl sm:text-3xl font-black"
          style={{
            background: BRAND.gradH,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          QR Check-in
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Scan attendee QR codes to check them in
        </p>

        <div className="flex justify-center mt-3">
          <div className="h-1 w-14 rounded-full" style={{ background: BRAND.gradH }} />
        </div>
      </div>

      {/* ── Scanner card ────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-[#EDD9F0] overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 w-full" style={{ background: BRAND.gradH }} />

        <div className="p-5">
          {/* Scanner viewport */}
          <div
            className="relative rounded-2xl overflow-hidden border-2"
            style={{ borderColor: scanning ? BRAND.purple : (message ? "#1D9E75" : "#D4607A") }}
          >
            {/* Corner decorations */}
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute z-10 w-6 h-6 ${cls}`}
                style={{ borderColor: scanning ? BRAND.purple : (message ? "#1D9E75" : BRAND.coral) }}
              />
            ))}

            <Scanner
              onScan={handleScan}
              onError={(err) => console.error(err)}
              constraints={{ facingMode: "environment" }}
              styles={{ container: { borderRadius: 0 } }}
            />

            {/* Scanning status overlay */}
            {!scanning && (
              <div
                className="absolute inset-0 flex items-center justify-center z-20"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                <div className="flex flex-col items-center gap-2">
                  {message ? (
                    <CheckCircle2 size={48} className="text-emerald-400" />
                  ) : (
                    <XCircle size={48} style={{ color: BRAND.coral }} />
                  )}
                  <span className="text-white font-bold text-sm text-center px-4">
                    {message || error}
                  </span>
                  <span className="text-white/60 text-xs flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin" /> Resuming in 3s...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className="relative flex h-2.5 w-2.5"
            >
              {scanning && (
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: BRAND.purple }}
                />
              )}
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ background: scanning ? BRAND.purple : "#9CA3AF" }}
              />
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {scanning ? "Scanning…" : "Processing"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Result feedback cards ────────────────────────────────────────── */}
      <div className="mt-6 w-full max-w-sm space-y-3">
        {message && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl border shadow-sm"
            style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
          >
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Check-in Successful</p>
              <p className="text-sm text-emerald-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl border shadow-sm"
            style={{ background: BRAND.coralSurface || "#FDF0F3", borderColor: "#F0BBCA" }}
          >
            <XCircle size={20} style={{ color: BRAND.coral }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND.coral }}>
                Check-in Failed
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#B04060" }}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Hint ────────────────────────────────────────────────────────── */}
      <p className="mt-8 text-xs text-gray-400 text-center max-w-xs">
        Point the camera at the attendee's QR code. The scanner will automatically detect and process it.
      </p>
    </div>
  );
};

export default QrScanner;