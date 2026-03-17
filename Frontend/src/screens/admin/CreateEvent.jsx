import { useRef, useState } from "react";
import axios from "axios";

import {
  Info,
  UploadCloud,
  Calendar,
  CalendarX,
  MapPin,
  Users,
  ChevronDown,
  Save,
  Plus,
  Trash2,
  Wallet,
  ClipboardList,
  Trophy,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

// ─── Brand token (mirrors your brand.js) ─────────────────────────────────────
const BRAND = {
  coral: "#D4607A",
  purple: "#6B5EC7",
  indigo: "#534AB7",
  amber: "#F5A623",
  gradientText: "linear-gradient(90deg, #D4607A 0%, #6B5EC7 100%)",
  gradientBg: "linear-gradient(135deg, #D4607A 0%, #6B5EC7 100%)",
  coralSurface: { bg: "#FDF0F3", border: "#F0BBCA", text: "#D4607A" },
  purpleSurface: { bg: "#F3F0FD", border: "#C4BBF0", text: "#534AB7" },
  amberSurface: { bg: "#FEF6EC", border: "#F5D49A", text: "#C47A1A" },
};

// ─── Reusable styled primitives ───────────────────────────────────────────────

const SectionCard = ({ children, style = {} }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 20,
      border: "1px solid #F0EBF8",
      boxShadow: "0 2px 12px 0 rgba(107,94,199,0.06)",
      padding: "32px",
      marginBottom: 24,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, required, accentColor = BRAND.coral }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      paddingBottom: 20,
      marginBottom: 24,
      borderBottom: `2px solid`,
      borderImage: `${BRAND.gradientBg} 1`,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: BRAND.purpleSurface.bg,
        border: `1px solid ${BRAND.purpleSurface.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={BRAND.purple} />
    </div>
    <h2
      style={{
        fontSize: "1.15rem",
        fontWeight: 700,
        color: "#1a1033",
        letterSpacing: "-0.02em",
        margin: 0,
      }}
    >
      {title}
      {required && (
        <span style={{ color: BRAND.coral, marginLeft: 4 }}>*</span>
      )}
    </h2>
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label
    style={{
      display: "block",
      fontSize: "0.78rem",
      fontWeight: 700,
      color: "#4B4568",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      marginBottom: 8,
    }}
  >
    {children}
    {required && (
      <span style={{ color: BRAND.coral, marginLeft: 4 }}>*</span>
    )}
  </label>
);

const baseInputStyle = {
  width: "100%",
  height: 48,
  padding: "0 16px",
  borderRadius: 12,
  border: "1.5px solid #E8E3F5",
  background: "#FAFAFE",
  color: "#1a1033",
  fontSize: "0.9rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const errorInputStyle = {
  ...baseInputStyle,
  borderColor: BRAND.coral,
  background: BRAND.coralSurface.bg,
};

const FieldError = ({ msg }) =>
  msg ? (
    <p
      style={{
        fontSize: "0.78rem",
        color: BRAND.coral,
        marginTop: 6,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ⚠ {msg}
    </p>
  ) : null;

const InputWithIcon = ({ icon: Icon, error, style: extra = {}, ...props }) => (
  <div style={{ position: "relative" }}>
    <div
      style={{
        position: "absolute",
        inset: "0 auto 0 0",
        paddingLeft: 14,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <Icon size={16} color={error ? BRAND.coral : "#9B8FC4"} />
    </div>
    <input
      style={{
        ...(error ? errorInputStyle : baseInputStyle),
        paddingLeft: 42,
        ...extra,
      }}
      {...props}
    />
  </div>
);

const GhostButton = ({ children, onClick, type = "button", danger = false, disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 18px",
      borderRadius: 10,
      border: `1.5px solid ${danger ? "#F0BBCA" : "#E8E3F5"}`,
      background: danger ? BRAND.coralSurface.bg : BRAND.purpleSurface.bg,
      color: danger ? BRAND.coral : BRAND.purple,
      fontSize: "0.83rem",
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "inherit",
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = danger ? "#F7D6DF" : "#EAE5FA";
        e.currentTarget.style.transform = "translateY(-1px)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = danger ? BRAND.coralSurface.bg : BRAND.purpleSurface.bg;
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {children}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateEvent = () => {
  const baseURL = import.meta.env.VITE_API_URL;
  const UPLOAD_API_URL = `${baseURL}/uploads/banner`;
  const CREATE_EVENT_API_URL = `${baseURL}/events`;

  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerPreview, setBannerPreview] = useState("");
  const [openPreview, setOpenPreview] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    startTime: "",
    endTime: "",
    registrationStartDate: "",
    registrationDeadline: "",
    venue: "",
    capacity: "",
    entryFee: "",
    teamSizeMin: "",
    teamSizeMax: "",
    rules: [""],
    prizes: [{ position: "", amount: "", perks: "" }],
    bannerUrl: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // UPLOAD IMAGE TO BACKEND
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, banner: "File size must be less than 3MB" }));
      return;
    }
    setErrors((prev) => ({ ...prev, banner: "" }));
    try {
      setUploading(true);
      setUploadProgress(0);
      setBannerPreview("");
      setFormData((prev) => ({ ...prev, bannerUrl: "" }));

      const data = new FormData();
      data.append("image", file);

      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;

      if (!token) {
        setErrors((prev) => ({ ...prev, banner: "You are not logged in. Please login first." }));
        setUploading(false);
        return;
      }

      const res = await axios.post(UPLOAD_API_URL, data, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      setFormData((prev) => ({ ...prev, bannerUrl: res.data.url }));
      setUploadProgress(100);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      setTimeout(() => setUploading(false), 500);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        banner: error.response?.data?.message || error.message,
      }));
      setBannerPreview("");
      setFormData((prev) => ({ ...prev, bannerUrl: "" }));
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // RULES HANDLING
  const handleRuleChange = (index, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = value;
    setFormData((prev) => ({ ...prev, rules: updatedRules }));
    if (errors.rules) setErrors((prev) => ({ ...prev, rules: "" }));
  };
  const addRule = () => setFormData((prev) => ({ ...prev, rules: [...prev.rules, ""] }));
  const removeRule = (index) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, rules: updatedRules.length > 0 ? updatedRules : [""] }));
  };

  // PRIZES HANDLING
  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index][field] = value;
    setFormData((prev) => ({ ...prev, prizes: updatedPrizes }));
    if (errors.prizes) setErrors((prev) => ({ ...prev, prizes: "" }));
  };
  const addPrize = () =>
    setFormData((prev) => ({
      ...prev,
      prizes: [...prev.prizes, { position: "", amount: "", perks: "" }],
    }));
  const removePrize = (index) => {
    const updatedPrizes = formData.prizes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, prizes: updatedPrizes.length > 0 ? updatedPrizes : prev.prizes }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) newErrors.eventName = "Event name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.startTime) newErrors.startTime = "Start date & time is required";
    if (!formData.endTime) newErrors.endTime = "End date & time is required";
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime))
      newErrors.endTime = "End time must be after start time";
    if (!formData.registrationStartDate) newErrors.registrationStartDate = "Registration start date is required";
    if (!formData.registrationDeadline) newErrors.registrationDeadline = "Registration deadline is required";
    if (
      formData.registrationStartDate &&
      formData.registrationDeadline &&
      new Date(formData.registrationDeadline) <= new Date(formData.registrationStartDate)
    )
      newErrors.registrationDeadline = "Registration deadline must be after start date";
    if (!formData.venue) newErrors.venue = "Venue is required";
    if (!formData.capacity) newErrors.capacity = "Max capacity is required";
    if (formData.teamSizeMin && formData.teamSizeMax && Number(formData.teamSizeMin) > Number(formData.teamSizeMax))
      newErrors.teamSizeMax = "Max team size must be greater than Min";
    if (formData.rules.filter((r) => r.trim() !== "").length === 0)
      newErrors.rules = "At least one rule is required";
    if (formData.prizes.filter((p) => p.position.trim() && p.amount.toString().trim() && p.perks.trim()).length === 0)
      newErrors.prizes = "At least one complete prize is required";
    if (!formData.bannerUrl) newErrors.banner = "Banner image upload is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) { alert("Banner is uploading... Please wait!"); return; }
    if (validateForm()) {
      const finalPayload = {
        name: formData.eventName,
        description: formData.description,
        bannerImageUrl: formData.bannerUrl,
        startTime: formData.startTime,
        endTime: formData.endTime,
        registrationStartDate: formData.registrationStartDate,
        registrationDeadline: formData.registrationDeadline,
        venue: formData.venue,
        maxParticipants: Number(formData.capacity),
        entryFee: formData.entryFee ? Number(formData.entryFee) : 0,
        teamSize: {
          min: formData.teamSizeMin ? Number(formData.teamSizeMin) : 1,
          max: formData.teamSizeMax ? Number(formData.teamSizeMax) : 1,
        },
        rules: formData.rules.filter((r) => r.trim() !== ""),
        prizes: formData.prizes
          .filter((p) => p.position.trim() && p.amount.toString().trim() && p.perks.trim())
          .map((p) => ({ position: p.position, amount: Number(p.amount), perks: p.perks })),
      };
      try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        const token = auth?.token;
        if (!token) { alert("Login required!"); return; }
        const res = await axios.post(CREATE_EVENT_API_URL, finalPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Saved Event:", res.data);
        alert("Event created successfully!");
      } catch (error) {
        alert(error.response?.data?.message || "Event create failed!");
        console.log(error);
        return;
      }
      setFormData({
        eventName: "", description: "", startTime: "", endTime: "",
        registrationStartDate: "", registrationDeadline: "", venue: "",
        capacity: "", entryFee: "", teamSizeMin: "", teamSizeMax: "",
        rules: [""], prizes: [{ position: "", amount: "", perks: "" }], bannerUrl: "",
      });
      setErrors({});
      setBannerPreview("");
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setFormData({
      eventName: "", description: "", startTime: "", endTime: "",
      registrationStartDate: "", registrationDeadline: "", venue: "",
      capacity: "", entryFee: "", teamSizeMin: "", teamSizeMax: "",
      rules: [""], prizes: [{ position: "", amount: "", perks: "" }], bannerUrl: "",
    });
    setErrors({});
    setBannerPreview("");
    setUploadProgress(0);
    setUploading(false);
    setOpenPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .ce-root * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .ce-input:focus { border-color: ${BRAND.purple} !important; background: #FAFAFE !important; box-shadow: 0 0 0 3.5px rgba(107,94,199,0.13) !important; outline: none !important; }
        .ce-input-error:focus { border-color: ${BRAND.coral} !important; box-shadow: 0 0 0 3.5px rgba(212,96,122,0.13) !important; }
        .ce-select:focus { border-color: ${BRAND.purple} !important; box-shadow: 0 0 0 3.5px rgba(107,94,199,0.13) !important; outline: none !important; }
        .ce-textarea:focus { border-color: ${BRAND.purple} !important; box-shadow: 0 0 0 3.5px rgba(107,94,199,0.13) !important; outline: none !important; }
        .prize-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .prize-card:hover { border-color: ${BRAND.purple}55 !important; box-shadow: 0 4px 16px rgba(107,94,199,0.08); }
        .rule-row:hover .rule-number { background: ${BRAND.gradientBg}; color: white; }
        @media (max-width: 640px) { .ce-grid-2 { grid-template-columns: 1fr !important; } .ce-form-actions { flex-direction: column-reverse !important; } }
      `}</style>

      <div
        className="ce-root"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #F8F5FF 0%, #FDF0F3 40%, #F5F0FF 100%)",
          padding: "40px 16px 60px",
        }}
      >
        {/* ── Page Header ── */}
        <div style={{ maxWidth: 860, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: BRAND.gradientBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: BRAND.purple,
              }}
            >
              Event Management
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "0 0 10px",
              background: BRAND.gradientText,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Create New Event
          </h1>
          <p style={{ color: "#7B6E9A", fontSize: "0.92rem", margin: 0 }}>
            Fill in the details below to add a new event to the tech fest schedule.
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* ─ Event Information ─ */}
          <SectionCard>
            <SectionHeader icon={Info} title="Event Information" />

            {/* Event Name */}
            <div style={{ marginBottom: 22 }}>
              <FieldLabel required>Event Name</FieldLabel>
              <input
                className={`ce-input ${errors.eventName ? "ce-input-error" : ""}`}
                style={errors.eventName ? errorInputStyle : baseInputStyle}
                placeholder="e.g., Inter College Hackathon"
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
              />
              <FieldError msg={errors.eventName} />
            </div>

            {/* Banner Upload */}
            <div style={{ marginBottom: 22 }}>
              <FieldLabel required>Event Banner</FieldLabel>

              <div
                onClick={() => { if (!uploading) fileInputRef.current.click(); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (uploading) return;
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileChange({ target: { files: [file] } });
                }}
                style={{
                  border: `2px dashed ${errors.banner ? BRAND.coral : uploading ? "#C4BBF0" : "#C4BBF0"}`,
                  borderRadius: 16,
                  padding: "36px 24px",
                  background: uploading
                    ? BRAND.purpleSurface.bg
                    : errors.banner
                    ? BRAND.coralSurface.bg
                    : "#FAFAFE",
                  cursor: uploading ? "not-allowed" : "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) e.currentTarget.style.borderColor = BRAND.purple;
                }}
                onMouseLeave={(e) => {
                  if (!uploading) e.currentTarget.style.borderColor = errors.banner ? BRAND.coral : "#C4BBF0";
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: BRAND.gradientBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    boxShadow: "0 6px 20px rgba(212,96,122,0.25)",
                  }}
                >
                  <UploadCloud size={26} color="#fff" />
                </div>

                <p style={{ fontWeight: 700, color: "#1a1033", marginBottom: 4, fontSize: "0.95rem" }}>
                  {uploading ? "Uploading banner…" : "Click to upload or drag & drop"}
                </p>
                <p style={{ color: "#9B8FC4", fontSize: "0.8rem", marginBottom: 0 }}>
                  PNG, JPG, GIF · max 3 MB
                </p>

                {/* Progress bar */}
                {uploading && (
                  <div style={{ marginTop: 20, maxWidth: 340, margin: "20px auto 0" }}>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 99,
                        background: "#E8E3F5",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${uploadProgress}%`,
                          background: BRAND.gradientBg,
                          borderRadius: 99,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 6,
                        fontSize: "0.75rem",
                        color: BRAND.purple,
                        fontWeight: 600,
                      }}
                    >
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                  </div>
                )}

                {formData.bannerUrl && !uploading && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 14,
                      background: "#EDFBF3",
                      border: "1px solid #A3E6C0",
                      borderRadius: 99,
                      padding: "6px 14px",
                      color: "#1A7A4A",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={15} />
                    Uploaded Successfully
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={uploading}
                />
              </div>

              {/* Preview thumbnail */}
              {formData.bannerUrl && bannerPreview && !uploading && (
                <div style={{ marginTop: 16 }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#7B6E9A",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Preview
                  </p>
                  <div
                    onClick={() => setOpenPreview(true)}
                    style={{
                      position: "relative",
                      width: 280,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid #E8E3F5",
                      boxShadow: "0 4px 14px rgba(107,94,199,0.12)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector(".preview-overlay").style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector(".preview-overlay").style.opacity = "0";
                    }}
                  >
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                    />
                    <div
                      className="preview-overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(83,74,183,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          background: "rgba(0,0,0,0.4)",
                          padding: "6px 16px",
                          borderRadius: 99,
                        }}
                      >
                        View Full Image
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <FieldError msg={errors.banner} />
            </div>

            {/* Description */}
            <div>
              <FieldLabel required>Description</FieldLabel>
              <textarea
                className="ce-textarea"
                style={{
                  ...baseInputStyle,
                  height: "auto",
                  padding: "14px 16px",
                  resize: "none",
                  lineHeight: 1.6,
                }}
                rows={5}
                placeholder="Describe the event agenda, prerequisites, and what participants can expect…"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
              <FieldError msg={errors.description} />
            </div>
          </SectionCard>

          {/* ─ Logistics ─ */}
          <SectionCard>
            <SectionHeader icon={Calendar} title="Logistics" />

            <div
              className="ce-grid-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 24px",
              }}
            >
              {/* Start */}
              <div>
                <FieldLabel required>Start Date & Time</FieldLabel>
                <InputWithIcon
                  icon={Calendar}
                  error={errors.startTime}
                  className={`ce-input ${errors.startTime ? "ce-input-error" : ""}`}
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  style={{ paddingLeft: 42 }}
                />
                <FieldError msg={errors.startTime} />
              </div>

              {/* End */}
              <div>
                <FieldLabel required>End Date & Time</FieldLabel>
                <InputWithIcon
                  icon={CalendarX}
                  error={errors.endTime}
                  className={`ce-input ${errors.endTime ? "ce-input-error" : ""}`}
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  style={{ paddingLeft: 42 }}
                />
                <FieldError msg={errors.endTime} />
              </div>

              {/* Reg Start */}
              <div>
                <FieldLabel required>Registration Start</FieldLabel>
                <input
                  className={`ce-input ${errors.registrationStartDate ? "ce-input-error" : ""}`}
                  style={errors.registrationStartDate ? errorInputStyle : baseInputStyle}
                  type="datetime-local"
                  name="registrationStartDate"
                  value={formData.registrationStartDate}
                  onChange={handleChange}
                />
                <FieldError msg={errors.registrationStartDate} />
              </div>

              {/* Reg Deadline */}
              <div>
                <FieldLabel required>Registration Deadline</FieldLabel>
                <input
                  className={`ce-input ${errors.registrationDeadline ? "ce-input-error" : ""}`}
                  style={errors.registrationDeadline ? errorInputStyle : baseInputStyle}
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
                <FieldError msg={errors.registrationDeadline} />
              </div>

              {/* Venue */}
              <div>
                <FieldLabel required>Venue</FieldLabel>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 auto 0 0",
                      paddingLeft: 14,
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <MapPin size={16} color={errors.venue ? BRAND.coral : "#9B8FC4"} />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 0 0 auto",
                      paddingRight: 14,
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <ChevronDown size={16} color="#9B8FC4" />
                  </div>
                  <select
                    className="ce-select"
                    style={{
                      ...(errors.venue ? errorInputStyle : baseInputStyle),
                      paddingLeft: 42,
                      paddingRight: 40,
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select a location</option>
                    <option value="main-auditorium">Main Auditorium</option>
                    <option value="CSE Lab">CSE Lab (Block A)</option>
                    <option value="AIML Lab">AIML Lab</option>
                    <option value="AIDS">AIDS Lab</option>
                    <option value="ENTC">ENTC Lab</option>
                  </select>
                </div>
                <FieldError msg={errors.venue} />
              </div>

              {/* Capacity */}
              <div>
                <FieldLabel required>Max Capacity</FieldLabel>
                <InputWithIcon
                  icon={Users}
                  error={errors.capacity}
                  className={`ce-input ${errors.capacity ? "ce-input-error" : ""}`}
                  type="number"
                  min="1"
                  placeholder="e.g. 200"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  style={{ paddingLeft: 42 }}
                />
                <FieldError msg={errors.capacity} />
              </div>

              {/* Entry Fee */}
              <div>
                <FieldLabel>Entry Fee (₹)</FieldLabel>
                <InputWithIcon
                  icon={Wallet}
                  className="ce-input"
                  type="number"
                  min="0"
                  placeholder="e.g. 199 (leave blank for free)"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  style={{ paddingLeft: 42 }}
                />
              </div>

              {/* Team Size */}
              <div>
                <FieldLabel>Team Size (Min / Max)</FieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input
                    className="ce-input"
                    style={baseInputStyle}
                    type="number"
                    min="1"
                    placeholder="Min"
                    name="teamSizeMin"
                    value={formData.teamSizeMin}
                    onChange={handleChange}
                  />
                  <input
                    className={`ce-input ${errors.teamSizeMax ? "ce-input-error" : ""}`}
                    style={errors.teamSizeMax ? errorInputStyle : baseInputStyle}
                    type="number"
                    min="1"
                    placeholder="Max"
                    name="teamSizeMax"
                    value={formData.teamSizeMax}
                    onChange={handleChange}
                  />
                </div>
                <FieldError msg={errors.teamSizeMax} />
              </div>
            </div>
          </SectionCard>

          {/* ─ Rules ─ */}
          <SectionCard>
            <SectionHeader icon={ClipboardList} title="Rules & Guidelines" required />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formData.rules.map((rule, index) => (
                <div
                  key={index}
                  className="rule-row"
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    className="rule-number"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: BRAND.purpleSurface.bg,
                      border: `1px solid ${BRAND.purpleSurface.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: BRAND.purple,
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {index + 1}
                  </div>
                  <input
                    className="ce-input"
                    style={{ ...baseInputStyle, flex: 1 }}
                    placeholder={`Rule ${index + 1} — e.g., Teams must have a college ID`}
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      border: `1.5px solid ${BRAND.coralSurface.border}`,
                      background: BRAND.coralSurface.bg,
                      color: BRAND.coral,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F7D6DF")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = BRAND.coralSurface.bg)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <FieldError msg={errors.rules} />

            <div style={{ marginTop: 16 }}>
              <GhostButton onClick={addRule}>
                <Plus size={15} />
                Add Rule
              </GhostButton>
            </div>
          </SectionCard>

          {/* ─ Prizes ─ */}
          <SectionCard>
            <SectionHeader icon={Trophy} title="Prize Details" required />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {formData.prizes.map((prize, index) => {
                const medalColors = ["#F5A623", "#9B8FC4", "#C47A1A"];
                const medalLabels = ["🥇 1st", "🥈 2nd", "🥉 3rd"];
                return (
                  <div
                    key={index}
                    className="prize-card"
                    style={{
                      border: "1.5px solid #E8E3F5",
                      borderRadius: 16,
                      padding: 20,
                      background: "#FAFAFE",
                      position: "relative",
                    }}
                  >
                    {/* Prize badge */}
                    {index < 3 && (
                      <div
                        style={{
                          position: "absolute",
                          top: -10,
                          left: 20,
                          background: BRAND.gradientBg,
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          padding: "3px 12px",
                          borderRadius: 99,
                          letterSpacing: "0.04em",
                        }}
                      >
                        Prize #{index + 1}
                      </div>
                    )}

                    <div
                      className="ce-grid-2"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "14px 16px",
                        marginTop: 8,
                      }}
                    >
                      <div>
                        <FieldLabel>Position</FieldLabel>
                        <input
                          className="ce-input"
                          style={baseInputStyle}
                          placeholder={index < 3 ? medalLabels[index] : "e.g. Winner"}
                          value={prize.position}
                          onChange={(e) => handlePrizeChange(index, "position", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Amount (₹)</FieldLabel>
                        <input
                          className="ce-input"
                          style={baseInputStyle}
                          type="number"
                          min="0"
                          placeholder="e.g. 25000"
                          value={prize.amount}
                          onChange={(e) => handlePrizeChange(index, "amount", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Perks</FieldLabel>
                        <input
                          className="ce-input"
                          style={baseInputStyle}
                          placeholder="e.g. Trophy + Certificate"
                          value={prize.perks}
                          onChange={(e) => handlePrizeChange(index, "perks", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                      <GhostButton danger onClick={() => removePrize(index)}>
                        <Trash2 size={14} />
                        Remove
                      </GhostButton>
                    </div>
                  </div>
                );
              })}
            </div>

            <FieldError msg={errors.prizes} />

            <div style={{ marginTop: 16 }}>
              <GhostButton onClick={addPrize}>
                <Plus size={15} />
                Add Prize
              </GhostButton>
            </div>
          </SectionCard>

          {/* ─ Action Bar ─ */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #F0EBF8",
              boxShadow: "0 2px 12px 0 rgba(107,94,199,0.06)",
              padding: "22px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ color: "#9B8FC4", fontSize: "0.8rem", margin: 0 }}>
              Fields marked <span style={{ color: BRAND.coral, fontWeight: 700 }}>*</span> are required.
            </p>

            <div
              className="ce-form-actions"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "11px 28px",
                  borderRadius: 12,
                  border: "1.5px solid #E8E3F5",
                  background: "#fff",
                  color: "#4B4568",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F5FF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: uploading ? "#C4BBF0" : BRAND.gradientBg,
                  color: "#fff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: uploading ? "not-allowed" : "pointer",
                  boxShadow: uploading ? "none" : "0 4px 18px rgba(212,96,122,0.35)",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(212,96,122,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = uploading ? "none" : "0 4px 18px rgba(212,96,122,0.35)";
                }}
              >
                <Save size={16} />
                {uploading ? "Uploading…" : "Save Event"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ─ Full Image Modal ─ */}
      {openPreview && (
        <div
          onClick={() => setOpenPreview(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,16,51,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
              maxWidth: 800,
              width: "100%",
              overflow: "hidden",
            }}
          >
            <img
              src={bannerPreview}
              alt="Full Banner"
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", background: "#0a0a0a", display: "block" }}
            />
            <button
              onClick={() => setOpenPreview(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                color: "#1a1033",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEvent;