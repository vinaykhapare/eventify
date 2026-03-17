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

const Volunteering = mongoose.model("Volunteering", volunteeringSchema);

export default Volunteering;