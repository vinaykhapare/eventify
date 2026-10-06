import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import { SocketContext } from "./SocketContextInstance";
import { useAuthContext } from "../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export function SocketProvider({ children }) {
  const { auth } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dashboardTrigger, setDashboardTrigger] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const res = await axios.get(`${baseURL}/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  }, [auth]);

  useEffect(() => {
    const token = auth?.token;
    const user = auth?.user;

    if (!token || !user) {
      return;
    }

    const s = io(baseURL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    s.on("connect", () => {
      s.emit("register", {
        userId: user.id || user._id,
        role: user.role,
      });
    });

    // Real-time notification received
    s.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notif.title + ": " + notif.message, {
        icon: "🔔",
        duration: 4500,
      });
    });

    // Real-time dashboard update signal
    s.on("dashboard_update", () => {
      setDashboardTrigger((prev) => prev + 1);
    });

    s.on("events_updated", () => {
      setDashboardTrigger((prev) => prev + 1);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s);
    fetchNotifications();

    return () => {
      s.disconnect();
    };
  }, [auth, fetchNotifications]);

  const markAsRead = async (id) => {
    if (!auth?.token) return;
    try {
      await axios.patch(
        `${baseURL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!auth?.token) return;
    try {
      await axios.patch(
        `${baseURL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        dashboardTrigger,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
