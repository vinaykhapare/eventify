import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  Lock,
  Eye,
  Globe,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useTheme } from "../../hooks/useTheme";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuthContext();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [ticketAlerts, setTicketAlerts] = useState(true);
  const [broadcastAlerts, setBroadcastAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully!");
  };

  return (
    <DashboardLayout searchPlaceholder="Search settings...">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            <SettingsIcon size={14} />
            <span>Platform Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
            System & Notification Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure how you receive updates, interface appearance, and account visibility.
          </p>
        </div>

        {/* Appearance Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Appearance & Theme
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Customize the visual interface of the Event Management portal.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Color Mode: {isDark ? "Dark Theme" : "Light Theme"}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  High-contrast palette optimized for readability and event control rooms.
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-650 transition-colors"
            >
              Switch to {isDark ? "Light" : "Dark"} Mode
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Notification Delivery
              </h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Control what alerts you receive via real-time WebSocket notifications.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Ticket Purchase & Registration Confirmations
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Instant real-time notification whenever an attendee books or registers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={ticketAlerts}
                onChange={(e) => setTicketAlerts(e.target.checked)}
                className="size-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Broadcast Announcements
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Critical updates and emergency schedule changes from campus organizers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={broadcastAlerts}
                onChange={(e) => setBroadcastAlerts(e.target.checked)}
                className="size-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Email Summary & Reminders
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Receive event reminders 24 hours prior to scheduled start times.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="size-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>

        {/* Privacy & Visibility */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Privacy & Roster Visibility
              </h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Control whether other attendees can see your registration on public rosters.
            </p>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Public Attendee Listing
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Display name and department on the verified participants roster.
              </p>
            </div>
            <input
              type="checkbox"
              checked={publicProfile}
              onChange={(e) => setPublicProfile(e.target.checked)}
              className="size-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-heading font-bold text-rose-700 dark:text-rose-400">
              Account Deactivation & Sign Out
            </h2>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-0.5">
              Permanently revoke access or log out of all active campus workstations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Sign Out of Current Session
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Request Account Deletion
            </button>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Request Account Deletion?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This will invalidate all current tickets and event volunteer registrations.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success("Account deletion request submitted to campus administrator.");
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
