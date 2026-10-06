import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: {
      type: Date,
    },
  },
  { timestamps: true },
);

participationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
participationSchema.index({ eventId: 1, checkedIn: 1 });

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
