import { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  Info,
  UploadCloud,
  Calendar,
  MapPin,
  Users,
  Save,
  Plus,
  Trash2,
  Trophy,
  CheckCircle2,
  X,
  Sparkles,
  ArrowLeft,
  IndianRupee,
  ClipboardList,
  AlertCircle,
  Eye,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const UPLOAD_API_URL = `${baseURL}/uploads/banner`;
const CREATE_EVENT_API_URL = `${baseURL}/events`;

export default function CreateEvent() {
  const { auth } = useAuthContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerPreview, setBannerPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    teamSizeMin: "1",
    teamSizeMax: "1",
    rules: [""],
    prizes: [{ position: "1st Place", amount: "", perks: "Certificate + Trophy" }],
    bannerUrl: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, banner: "File size must be under 5MB" }));
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

      const token = auth?.token;
      if (!token) {
        toast.error("Authentication required to upload");
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
      toast.success("Banner uploaded successfully!");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        banner: error.response?.data?.message || "Failed to upload banner",
      }));
      toast.error("Banner upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Rules handling
  const handleRuleChange = (index, value) => {
    const updated = [...formData.rules];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, rules: updated }));
    if (errors.rules) setErrors((prev) => ({ ...prev, rules: "" }));
  };

  const addRule = () => setFormData((prev) => ({ ...prev, rules: [...prev.rules, ""] }));

  const removeRule = (index) => {
    const updated = formData.rules.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, rules: updated.length > 0 ? updated : [""] }));
  };

  // Prizes handling
  const handlePrizeChange = (index, field, value) => {
    const updated = [...formData.prizes];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, prizes: updated }));
    if (errors.prizes) setErrors((prev) => ({ ...prev, prizes: "" }));
  };

  const addPrize = () =>
    setFormData((prev) => ({
      ...prev,
      prizes: [...prev.prizes, { position: "", amount: "", perks: "" }],
    }));

  const removePrize = (index) => {
    const updated = formData.prizes.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      prizes: updated.length > 0 ? updated : prev.prizes,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) newErrors.eventName = "Event name is required";
    if (!formData.description.trim()) newErrors.description = "Event description is required";
    if (!formData.bannerUrl) newErrors.banner = "Cover banner image is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime))
      newErrors.endTime = "End time must be after start time";
    if (!formData.registrationStartDate) newErrors.registrationStartDate = "Registration start date is required";
    if (!formData.registrationDeadline) newErrors.registrationDeadline = "Registration deadline is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue location is required";
    if (!formData.capacity) newErrors.capacity = "Maximum participant capacity is required";

    if (formData.rules.filter((r) => r.trim()).length === 0)
      newErrors.rules = "Provide at least 1 guideline or rule";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait for the banner to finish uploading");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields highlighted in red");
      return;
    }

    try {
      setSubmitting(true);
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

      await axios.post(CREATE_EVENT_API_URL, finalPayload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      toast.success("Event published successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Create event error:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create New Campus Event
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure registrations, ticket capacity, event schedules, rules, and rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all"
          >
            <Save size={15} />
            {submitting ? "Publishing Event..." : "Publish Event"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {/* Section 1: General Info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Info size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. General Information
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="e.g. National Hackathon 2026: Code for Innovation"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.eventName
                  ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
              }`}
            />
            {errors.eventName && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> {errors.eventName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Description & Highlights <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe event objectives, eligibility criteria, schedule breakdown, and key takeaways..."
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.description
                  ? "border-rose-300 dark:border-rose-700 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Banner Media */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <UploadCloud size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Cover Banner
            </h2>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
              errors.banner
                ? "border-rose-300 dark:border-rose-700 bg-rose-50/40 dark:bg-rose-950/20"
                : formData.bannerUrl
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-900/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {bannerPreview || formData.bannerUrl ? (
              <div className="space-y-3">
                <img
                  src={bannerPreview || formData.bannerUrl}
                  alt="Banner preview"
                  className="max-h-56 mx-auto rounded-xl object-cover shadow-md"
                />
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} /> Banner uploaded successfully! (Click to replace)
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {uploading ? "Uploading banner image..." : "Upload Cover Banner"}
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG, or WEBP up to 5MB · Recommended 16:9 ratio (1200x675)
                </p>
                {uploading && (
                  <div className="max-w-xs mx-auto mt-3">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {uploadProgress}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {errors.banner && (
            <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.banner}
            </p>
          )}
        </div>

        {/* Section 3: Schedule & Logistics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Schedule & Logistics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Event Start Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.startTime && (
                <p className="text-xs text-rose-500 mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Event End Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.endTime && (
                <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Registration Opens <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="registrationStartDate"
                value={formData.registrationStartDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Registration Closes <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Campus Venue / Hall <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium, Block C or CS Lab 3"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            {errors.venue && (
              <p className="text-xs text-rose-500 mt-1">{errors.venue}</p>
            )}
          </div>
        </div>

        {/* Section 4: Participation & Fees */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Users size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Capacity & Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Max Capacity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g. 250"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.capacity && (
                <p className="text-xs text-rose-500 mt-1">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Entry Fee (INR)
              </label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  placeholder="0 for Free"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Team Size (Min - Max)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  name="teamSizeMin"
                  value={formData.teamSizeMin}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="number"
                  min="1"
                  name="teamSizeMax"
                  value={formData.teamSizeMax}
                  onChange={handleChange}
                  placeholder="Max"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Rules & Guidelines */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ClipboardList size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                5. Guidelines & Code of Conduct
              </h2>
            </div>
            <button
              type="button"
              onClick={addRule}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus size={14} /> Add Rule
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="size-7 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => handleRuleChange(idx, e.target.value)}
                  placeholder={`Rule ${idx + 1} — e.g. Valid college ID mandatory for entry`}
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {formData.rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.rules && <p className="text-xs text-rose-500 mt-1">{errors.rules}</p>}
        </div>

        {/* Section 6: Prizes */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Trophy size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                6. Prize Pool & Accolades
              </h2>
            </div>
            <button
              type="button"
              onClick={addPrize}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Plus size={14} /> Add Prize Tier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {formData.prizes.map((prize, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 relative space-y-2.5"
              >
                {formData.prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrize(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={prize.position}
                    onChange={(e) => handlePrizeChange(idx, "position", e.target.value)}
                    placeholder="e.g. 1st Place / Winner"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Cash Prize (INR)
                  </label>
                  <input
                    type="number"
                    value={prize.amount}
                    onChange={(e) => handlePrizeChange(idx, "amount", e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Perks & Goodies
                  </label>
                  <input
                    type="text"
                    value={prize.perks}
                    onChange={(e) => handlePrizeChange(idx, "perks", e.target.value)}
                    placeholder="e.g. Trophy + Swag Kits + Certificate"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all"
          >
            <Save size={15} />
            {submitting ? "Publishing Event..." : "Publish Event"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}