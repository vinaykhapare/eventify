import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Camera,
  Trash2,
  Save,
  X,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  FileText,
  Ticket,
  Users,
  IndianRupee,
  Activity,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function AdminProfile() {
  const { auth, updateUser } = useAuthContext();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Locked non-editable fields (strictly immutable)
  const [systemInfo, setSystemInfo] = useState({
    adminId: "ADM-SYSTEM",
    role: "Administrator",
    organization: "College Student Affairs & Event Board",
    accessLevel: "Level 4 — Full Superadmin Control",
    registrationNumber: "REG-INST-7842-ADM",
    primaryAdminEmail: "",
    accountCreationDate: "",
  });

  // Editable personal information
  const [editableInfo, setEditableInfo] = useState({
    name: "",
    phone: "",
    bio: "",
    address: "",
    avatarUrl: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      website: "",
    },
  });

  // Backup for cancel changes
  const [originalEditable, setOriginalEditable] = useState({});

  // Executive Activity Summary
  const [activityStats, setActivityStats] = useState({
    eventsManaged: 0,
    totalAttendeesHandled: 0,
    revenueOverview: 0,
  });

  // Fetch Admin Profile from DB
  useEffect(() => {
    let isMounted = true;
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
        if (!token) return;

        const res = await axios.get(`${baseURL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted && res.data?.success && res.data.user) {
          const u = res.data.user;

          // Set locked system fields
          setSystemInfo({
            adminId: u.adminId || `ADM-${u._id?.toString().slice(-6).toUpperCase()}`,
            role: "Administrator",
            organization: u.organization || "College Student Affairs & Event Board",
            accessLevel: u.accessLevel || "Level 4 — Full Superadmin Control",
            registrationNumber: u.registrationNumber || "REG-INST-7842-ADM",
            primaryAdminEmail: u.email || "",
            accountCreationDate: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Institutional Grant",
          });

          // Set editable personal fields
          const editState = {
            name: u.name || "",
            phone: u.phone || "",
            bio: u.bio || "",
            address: u.address || "Dean of Student Welfare Complex, Wing A-204",
            avatarUrl: u.avatarUrl || "",
            socialLinks: {
              linkedin: u.socialLinks?.linkedin || "",
              twitter: u.socialLinks?.twitter || "",
              website: u.socialLinks?.website || "",
            },
          };
          setEditableInfo(editState);
          setOriginalEditable(editState);
          updateUser({ name: u.name, avatarUrl: u.avatarUrl });

          if (res.data.activityStats) {
            setActivityStats(res.data.activityStats);
          }
        }
      } catch (err) {
        console.error("Admin Profile Load Error:", err);
        toast.error("Failed to load admin dossier");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminProfile();
    return () => {
      isMounted = false;
    };
  }, [auth?.token, updateUser]);

  // Handle editable input changes
  const handleInputChange = (field, value) => {
    setEditableInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network, value) => {
    setEditableInfo((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [network]: value,
      },
    }));
  };

  // Cancel edits
  const handleCancel = () => {
    setEditableInfo(originalEditable);
    setIsEditing(false);
  };

  // Save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editableInfo.name.trim()) {
      toast.error("Administrator name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;

      const res = await axios.patch(
        `${baseURL}/profile/me`,
        {
          name: editableInfo.name,
          phone: editableInfo.phone,
          bio: editableInfo.bio,
          address: editableInfo.address,
          avatarUrl: editableInfo.avatarUrl,
          socialLinks: editableInfo.socialLinks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        toast.success("Administrator record updated successfully!");
        setOriginalEditable({ ...editableInfo });
        updateUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin profile");
    } finally {
      setSaving(false);
    }
  };

  // Profile photo upload preview & persist
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setEditableInfo((prev) => ({ ...prev, avatarUrl: dataUrl }));

      try {
        const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
        await axios.patch(
          `${baseURL}/profile/me`,
          { avatarUrl: dataUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateUser({ avatarUrl: dataUrl });
        toast.success("Profile photo updated");
      } catch {
        toast.error("Failed to update photo");
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove profile photo
  const handleRemovePhoto = async () => {
    try {
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
      await axios.delete(`${baseURL}/profile/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditableInfo((prev) => ({ ...prev, avatarUrl: "" }));
      updateUser({ avatarUrl: "" });
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove photo");
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "AD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <DashboardLayout searchPlaceholder="Search system records...">
      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 p-8 animate-pulse space-y-6">
            <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            <div className="size-24 bg-slate-300 dark:bg-slate-600 rounded-2xl -mt-12" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* ── TOP SECTION: Large Executive Admin Header ── */}
            <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Subtle architectural top boundary bar */}
          <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 p-6 flex items-start justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Institutional Administration Control Dossier</span>
            </div>
            <Link
              to="/admin/dashboard"
              className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <span>Live Console</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Profile Identity Bar */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
              {/* Avatar + Main Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="relative group">
                  {editableInfo.avatarUrl ? (
                    <img
                      src={editableInfo.avatarUrl}
                      alt={editableInfo.name}
                      className="size-24 sm:size-28 rounded-2xl object-cover ring-4 ring-white dark:ring-[#1E293B] shadow-xl"
                    />
                  ) : (
                    <div className="size-24 sm:size-28 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-heading font-black text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-white dark:ring-[#1E293B] shadow-xl">
                      {getInitials(editableInfo.name)}
                    </div>
                  )}

                  {/* Photo Edit Overlay */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera size={20} />
                  </button>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {editableInfo.name || "Administrator"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
                      <ShieldCheck size={13} />
                      <span>{systemInfo.role}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    {systemInfo.organization}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-400 dark:text-slate-500">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      ID: {systemInfo.adminId}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {systemInfo.accessLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Controls */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5 self-center sm:self-end">
                {editableInfo.avatarUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors"
                  >
                    Edit Personal Details
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MIDDLE SECTION: Two Architectural Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CARD 1: Locked System Information (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Lock size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                    System Credentials
                  </h2>
                  <p className="text-[11px] text-slate-400">Fixed institutional security parameters</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80">
                LOCKED
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Admin ID */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Lock size={12} /> Admin ID
                  </span>
                  <span className="text-[10px] text-slate-400">Immutable</span>
                </div>
                <p className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {systemInfo.adminId}
                </p>
              </div>

              {/* Role */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Lock size={12} /> Assigned Role
                  </span>
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white mt-1">
                  {systemInfo.role}
                </p>
              </div>

              {/* Organization */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} /> Organization Name
                  </span>
                </div>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1">
                  {systemInfo.organization}
                </p>
              </div>

              {/* System Access Level */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} /> System Access Level
                  </span>
                </div>
                <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  {systemInfo.accessLevel}
                </p>
              </div>

              {/* Registration / Inst. Number */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Lock size={12} /> Registration Number
                  </span>
                </div>
                <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {systemInfo.registrationNumber}
                </p>
              </div>

              {/* Primary Admin Email */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> Primary Admin Email
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {systemInfo.primaryAdminEmail}
                </p>
              </div>

              {/* Account Creation Date */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Creation Date
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {systemInfo.accountCreationDate}
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: Editable Personal & Contact Information (7 Cols) */}
          <form
            onSubmit={handleSaveChanges}
            className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                  Editable Personal & Contact Information
                </h2>
                <p className="text-[11px] text-slate-400">
                  Update public executive contacts and campus presence
                </p>
              </div>
              {isEditing && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                  EDITING MODE
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={editableInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Vinay Khapare"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact Number (Direct Line)
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={editableInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              {/* Campus Address / Office Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Official Campus Address / Office
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editableInfo.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Dean of Student Welfare Complex, Wing A-204"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Executive Bio & Responsibility Note
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {editableInfo.bio?.length || 0}/400 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={400}
                  disabled={!isEditing}
                  value={editableInfo.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Primary executive oversee for campus hackathons, technical symposiums, and cultural governance..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed resize-none transition-all"
                />
              </div>

              {/* Social & Professional Links */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Institutional & Professional Links
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={editableInfo.socialLinks.linkedin}
                      onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                      placeholder="LinkedIn URL"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75"
                    />
                  </div>

                  <div className="relative">
                    <Twitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={editableInfo.socialLinks.twitter}
                      onChange={(e) => handleSocialChange("twitter", e.target.value)}
                      placeholder="Twitter / X"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75"
                    />
                  </div>

                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={editableInfo.socialLinks.website}
                      onChange={(e) => handleSocialChange("website", e.target.value)}
                      placeholder="Campus Directory URL"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75"
                    />
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ── BOTTOM SECTION: Activity Summary & Executive Overview ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Activity size={14} />
            <span>Executive Operational Scope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Events Managed */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Events Managed
                </p>
                <p className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                  {activityStats.eventsManaged.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Campus authorized listings</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Calendar size={22} />
              </div>
            </div>

            {/* Total Attendees Handled */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Attendees Handled
                </p>
                <p className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                  {activityStats.totalAttendeesHandled.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Registered student roster</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Users size={22} />
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Revenue Overview
                </p>
                <p className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                  ₹{(activityStats.revenueOverview || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Gross registration volume</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <IndianRupee size={22} />
              </div>
            </div>
          </div>
        </div>
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
