import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means global / broadcast to all or role-based
    },
    recipientRole: {
      type: String,
      enum: ["ALL", "ADMIN", "STUDENT", "VOLUNTEER"],
      default: "ALL",
    },
    type: {
      type: String,
      enum: [
        "REGISTRATION",
        "TICKET_PURCHASE",
        "EVENT_UPDATE",
        "EVENT_CREATED",
        "ATTENDEE_CHECKIN",
        "PROFILE_UPDATE",
        "ANNOUNCEMENT",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
