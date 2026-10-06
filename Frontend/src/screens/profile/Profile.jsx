import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Trash2,
  Lock,
  Shield,
  Key,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  Clock,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";
import AdminProfile from "./AdminProfile";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

function AttendeeProfile() {
  const { auth, updateUser } = useAuthContext();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'security'
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    avatarUrl: "",
    role: "STUDENT",
    twoFactorEnabled: false,
    lastLogin: null,
  });

  // Backup for cancel changes
  const [originalProfile, setOriginalProfile] = useState({});

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Email change state
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    passwordConfirmation: "",
  });
  const [savingEmail, setSavingEmail] = useState(false);

  // Fetch full profile from DB
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
        if (!token) return;

        const res = await axios.get(`${baseURL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted && res.data?.success && res.data.user) {
          const u = res.data.user;
          const loaded = {
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            bio: u.bio || "",
            location: u.location || "",
            avatarUrl: u.avatarUrl || "",
            role: u.role || "STUDENT",
            twoFactorEnabled: Boolean(u.twoFactorEnabled),
            lastLogin: u.lastLogin,
          };
          setProfile(loaded);
          setOriginalProfile(loaded);
          updateUser(loaded);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [auth?.token, updateUser]);

  // Handle personal info changes
  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Cancel edits
  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  // Save personal info
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    try {
      setSavingPersonal(true);
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;

      const res = await axios.patch(
        `${baseURL}/profile/me`,
        {
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          location: profile.location,
          avatarUrl: profile.avatarUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        toast.success("Profile updated successfully!");
        setOriginalProfile({ ...profile });
        updateUser(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingPersonal(false);
    }
  };

  // Avatar upload preview simulation (reads local file as data URL & saves)
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));

      try {
        const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
        await axios.patch(
          `${baseURL}/profile/me`,
          { avatarUrl: dataUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateUser({ avatarUrl: dataUrl });
        toast.success("Profile photo updated!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to save avatar");
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
      await axios.delete(`${baseURL}/profile/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((prev) => ({ ...prev, avatarUrl: "" }));
      updateUser({ avatarUrl: "" });
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove avatar");
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please enter both current and new passwords");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSavingPassword(true);
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
      const res = await axios.patch(
        `${baseURL}/profile/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  // Update Email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.passwordConfirmation) {
      toast.error("Please fill out both the new email and password");
      return;
    }

    try {
      setSavingEmail(true);
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
      const res = await axios.patch(
        `${baseURL}/profile/update-email`,
        {
          email: emailForm.newEmail,
          password: emailForm.passwordConfirmation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        toast.success("Email address updated!");
        setProfile((prev) => ({ ...prev, email: res.data.email }));
        updateUser({ email: res.data.email });
        setEmailForm({ newEmail: "", passwordConfirmation: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <DashboardLayout searchPlaceholder="Search settings and options...">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              <Shield size={14} />
              <span>Account Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
              Profile & Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your personal credentials, identity info, and authentication security.
            </p>
          </div>

          {/* Role Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 self-start sm:self-auto">
            <span className="size-2 rounded-full bg-indigo-500" />
            <span>Role: {profile.role}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 w-fit">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "personal"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User size={16} />
            <span>Personal Information</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "security"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Shield size={16} />
            <span>Account & Security</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-4">
            <div className="size-20 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ) : (
          <>
            {/* Tab 1: Personal Information */}
            {activeTab === "personal" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
            {/* Avatar & Photo Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Profile Photo
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                This image is displayed publicly on your attendee tickets and admin reports.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar Display */}
                <div className="relative group">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="size-24 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
                    />
                  ) : (
                    <div className="size-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                      {getInitials(profile.name)}
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera size={22} />
                  </button>
                </div>

                {/* Actions & Guidelines */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>Upload New Photo</span>
                    </button>

                    {profile.avatarUrl && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200/60 dark:border-rose-800/40 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Recommended: Square JPG or PNG, maximum file size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Details Form */}
            <form
              onSubmit={handleSavePersonal}
              className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Update your official contact credentials and campus identification.
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={savingPersonal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                    >
                      <Save size={14} />
                      <span>{savingPersonal ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g. Vinay Khapare"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("security")}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Change in Security →
                    </button>
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={profile.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                {/* Location / Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Department / Location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profile.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g. Computer Science, Block B"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bio / About Me
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {profile.bio.length}/300 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  disabled={!isEditing}
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Share a short note about your interests, campus club memberships, or organizer background..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed resize-none transition-all"
                />
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={savingPersonal}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {savingPersonal ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* Tab 2: Account & Security */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Change Password Card */}
            <form
              onSubmit={handleChangePassword}
              className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                    Change Password
                  </h2>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Update your account password. Choose a strong combination of letters, numbers & symbols.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      placeholder="Min 6 characters"
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* Update Email Card */}
            <form
              onSubmit={handleUpdateEmail}
              className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                    Update Primary Email
                  </h2>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Current address: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.email}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Email Address *
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) =>
                      setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))
                    }
                    placeholder="new.email@college.edu"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Confirm Account Password *
                  </label>
                  <input
                    type="password"
                    value={emailForm.passwordConfirmation}
                    onChange={(e) =>
                      setEmailForm((prev) => ({ ...prev, passwordConfirmation: e.target.value }))
                    }
                    placeholder="Enter current password to verify"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {savingEmail ? "Verifying..." : "Update Email Address"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
        </>
      )}
      </div>
    </DashboardLayout>
  );
}

export default function Profile() {
  const { auth } = useAuthContext();

  if (auth?.user?.role === "ADMIN") {
    return <AdminProfile />;
  }

  return <AttendeeProfile />;
}
