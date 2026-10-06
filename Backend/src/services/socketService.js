import { Server } from "socket.io";
import Notification from "../models/Notification.js";

let io = null;

export function initSocket(server, allowedOrigins) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed =
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app") ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        callback(null, isAllowed);
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Authenticate / register user room
    socket.on("register", ({ userId, role }) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on("join_channel", (channel) => {
      if (channel) {
        socket.join(`channel_${channel}`);
      }
    });

    socket.on("disconnect", () => {
      // client disconnected
    });
  });

  return io;
}

export function getIO() {
  return io;
}

/**
 * Creates and broadcasts a notification both to DB and live via Socket.io
 */
export async function createAndEmitNotification({
  recipient = null,
  recipientRole = "ALL",
  type,
  title,
  message,
  data = {},
}) {
  try {
    const notification = await Notification.create({
      recipient,
      recipientRole,
      type,
      title,
      message,
      data,
      read: false,
    });

    if (io) {
      if (recipient) {
        // Emit to specific user
        io.to(`user_${recipient}`).emit("notification", notification);
      } else if (recipientRole && recipientRole !== "ALL") {
        // Emit to specific role
        io.to(`role_${recipientRole}`).emit("notification", notification);
      } else {
        // Broadcast to all connected clients
        io.emit("notification", notification);
      }
    }

    return notification;
  } catch (err) {
    console.error("Error creating/emitting notification:", err);
    return null;
  }
}

/**
 * Emits dashboard statistics update to all connected admins in real time
 */
export function emitDashboardUpdate(stats) {
  if (io) {
    io.to("role_ADMIN").emit("dashboard_update", stats);
    io.emit("events_updated");
  }
}

/**
 * Emits new message to channel subscribers
 */
export function emitChannelMessage(channel, message) {
  if (io) {
    io.to(`channel_${channel}`).emit("new_message", message);
    io.emit("message_received", message);
  }
}
