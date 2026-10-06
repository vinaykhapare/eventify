import Notification from "../models/Notification.js";

// GET /notifications — Get current user's notifications (specific to them OR role-based OR global)
export async function getNotifications(req, res) {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { recipient: null, recipientRole: "ALL" },
        { recipient: null, recipientRole: role },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(40);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
}

// PATCH /notifications/:id/read — Mark single notification as read
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update notification" });
  }
}

// PATCH /notifications/mark-all-read — Mark all notifications for user as read
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          { recipient: null, recipientRole: "ALL" },
          { recipient: null, recipientRole: role },
        ],
        read: false,
      },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
}

// DELETE /notifications/:id — Delete notification
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
}
