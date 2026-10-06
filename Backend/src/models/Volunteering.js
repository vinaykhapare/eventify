import mongoose from "mongoose";

const volunteeringSchema = new mongoose.Schema(
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

    role: {
      type: String,
      default: "Volunteer",
    },
  },
  { timestamps: true }
);

volunteeringSchema.index({ userId: 1, eventId: 1 }, { unique: true });
volunteeringSchema.index({ eventId: 1 });

const Volunteering = mongoose.model("Volunteering", volunteeringSchema);

export default Volunteering;