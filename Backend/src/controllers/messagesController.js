import Message from "../models/Message.js";
import { emitChannelMessage, createAndEmitNotification } from "../services/socketService.js";

// GET /messages — Fetch messages for channel
export async function getMessages(req, res) {
  try {
    const { channel = "ANNOUNCEMENTS" } = req.query;

    const messages = await Message.find({ channel })
      .populate("sender", "name email role avatarUrl")
      .populate("eventId", "name venue")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
}

// POST /messages — Send new announcement/message
export async function sendMessage(req, res) {
  try {
    const { content, channel = "ANNOUNCEMENTS", eventId = null, priority = "NORMAL" } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }

    const newMessage = await Message.create({
      sender: senderId,
      content: content.trim(),
      channel,
      eventId,
      priority,
    });

    const populated = await Message.findById(newMessage._id)
      .populate("sender", "name email role avatarUrl")
      .populate("eventId", "name venue");

    // Real-time Socket.io broadcast
    emitChannelMessage(channel, populated);

    // If Urgent or High priority announcement, also create system notification
    if (priority === "HIGH" || priority === "URGENT") {
      await createAndEmitNotification({
        recipient: null,
        recipientRole: "ALL",
        type: "ANNOUNCEMENT",
        title: `Announcement: ${req.user.name}`,
        message: content.length > 80 ? content.slice(0, 77) + "..." : content,
        data: { messageId: newMessage._id, channel },
      });
    }

    return res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ success: false, message: "Failed to post message" });
  }
}
