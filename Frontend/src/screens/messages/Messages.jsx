import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Bell,
  Sparkles,
  ShieldAlert,
  Radio,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useSocket } from "../../hooks/useSocket";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const CHANNELS = [
  { id: "ANNOUNCEMENTS", name: "announcements", desc: "Official campus event broadcasts", icon: Bell },
  { id: "ORGANIZERS", name: "organizers", desc: "Volunteer & crew coordination", icon: Users },
  { id: "GENERAL", name: "general", desc: "Open community discussions", icon: Hash },
];

export default function Messages() {
  const { auth } = useAuthContext();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  const [activeChannel, setActiveChannel] = useState("ANNOUNCEMENTS");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentRole = auth?.user?.role || "STUDENT";
  const canPostToAnnouncements = currentRole === "ADMIN" || currentRole === "ORGANIZER";

  // Fetch messages when channel changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
        if (!token) return;

        const res = await axios.get(`${baseURL}/messages?channel=${activeChannel}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Join socket channel room
    if (socket?.connected) {
      socket.emit("join_channel", activeChannel);
    }

    const handleNewMessage = (msg) => {
      if (msg.channel === activeChannel) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket?.on("channel_message", handleNewMessage);

    return () => {
      socket?.off("channel_message", handleNewMessage);
    };
  }, [activeChannel, auth?.token, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeChannel === "ANNOUNCEMENTS" && !canPostToAnnouncements) {
      toast.error("Only Administrators and Organizers can post official announcements.");
      return;
    }

    try {
      setSending(true);
      const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
      const res = await axios.post(
        `${baseURL}/messages`,
        {
          channel: activeChannel,
          content: inputText.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setInputText("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <DashboardLayout searchPlaceholder="Search messages...">
      <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  #{activeChannel.toLowerCase()}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Chat
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {CHANNELS.find((c) => c.id === activeChannel)?.desc}
              </p>
            </div>
          </div>

          {/* Channel Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeChannel === ch.id
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span className="capitalize">{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                <Hash size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Welcome to #{activeChannel.toLowerCase()}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                This is the start of the #{activeChannel.toLowerCase()} channel. Send a message to
                start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe =
                msg.senderId?._id === auth?.user?.id ||
                msg.senderId?._id === auth?.user?._id ||
                msg.senderId?.email === auth?.user?.email;

              return (
                <div
                  key={msg._id}
                  className={`flex items-start gap-3 group transition-colors ${
                    isMe ? "bg-indigo-50/30 dark:bg-indigo-950/20 p-2 rounded-xl" : ""
                  }`}
                >
                  {msg.senderId?.avatarUrl ? (
                    <img
                      src={msg.senderId.avatarUrl}
                      alt={msg.senderName}
                      className="size-9 rounded-xl object-cover shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {getInitials(msg.senderName || msg.senderId?.name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {isMe ? "You" : msg.senderName || msg.senderId?.name || "Campus Member"}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                        {msg.senderRole || msg.senderId?.role || "STUDENT"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
        >
          {activeChannel === "ANNOUNCEMENTS" && !canPostToAnnouncements ? (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>
                Broadcast restriction: Only Admins & Event Organizers can publish to #announcements.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${activeChannel.toLowerCase()}...`}
                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-all shadow-2xs"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send size={14} />
                <span className="hidden sm:inline">{sending ? "Posting..." : "Send"}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
