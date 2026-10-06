import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    tagline: { type: String, default: "" },

    description: { type: String, required: true },

    bannerImageUrl: { type: String },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    registrationStartDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },

    venue: { type: String, required: true },

    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
    },

    entryFee: {
      type: Number,
      default: 0,
    },

    maxParticipants: { type: Number, required: true },

    prizes: [
      {
        position: String,
        amount: Number,
        perks: String,
      },
    ],

    rules: [String],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

eventSchema.index({ createdBy: 1, createdAt: -1 });
eventSchema.index({ endTime: 1, startTime: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
