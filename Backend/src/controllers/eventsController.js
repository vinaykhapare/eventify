// GET /events (all the events created by admin)
// POST /events
// PATCH /events/:eventId
// DELETE /events/:eventId

import mongoose from "mongoose";
import Event from "../models/Event.js";
import Participation from "../models/Participation.js";
import Volunteering from "../models/Volunteering.js";
import { createAndEmitNotification, emitDashboardUpdate } from "../services/socketService.js";

export async function getAllEvents(req, res) {
  try {
    const isUserAdmin = req.user?.role === "ADMIN";
    const now = new Date();

    const matchQuery = isUserAdmin
      ? { createdBy: new mongoose.Types.ObjectId(req.user.id) }
      : { endTime: { $gte: now } };

    const sortQuery = isUserAdmin ? { createdAt: -1 } : { startTime: 1 };

    // Optimized aggregation replacing N+1 countDocuments roundtrips
    const eventsWithCounts = await Event.aggregate([
      { $match: matchQuery },
      { $sort: sortQuery },
      {
        $lookup: {
          from: "participations",
          localField: "_id",
          foreignField: "eventId",
          as: "participationsList",
        },
      },
      {
        $addFields: {
          registrationsCount: { $size: "$participationsList" },
        },
      },
      {
        $project: {
          participationsList: 0,
        },
      },
    ]);

    return res.status(200).json({ events: eventsWithCounts });
  } catch (error) {
    console.error("Fetch Events Error:", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
}

export async function createEvent(req, res) {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id,
    });

    // Real-time broadcast
    createAndEmitNotification({
      recipient: null,
      recipientRole: "ALL",
      type: "EVENT_CREATED",
      title: "New Event Announced",
      message: `${event.name} has been published at ${event.venue || "Campus"}.`,
      data: { eventId: event._id },
    });
    emitDashboardUpdate();

    return res.status(201).json({ success: true, event });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({ message: "Failed to create event: " + error.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event with this Id doesn't exist" });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
      runValidators: true,
    });

    createAndEmitNotification({
      recipient: null,
      recipientRole: "ALL",
      type: "EVENT_UPDATE",
      title: "Event Updated",
      message: `${updatedEvent.name} schedule or location details have changed.`,
      data: { eventId: updatedEvent._id },
    });
    emitDashboardUpdate();

    return res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Update Event Error:", error);
    return res.status(500).json({ message: "Failed to update event: " + error.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event with this Id doesn't exist" });
    }

    // delete all participations of this event
    await Participation.deleteMany({ eventId });

    // delete all volunteering assignments of this event
    await Volunteering.deleteMany({ eventId });

    // finally delete event itself
    await Event.deleteOne({ _id: eventId });

    emitDashboardUpdate();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully from everywhere!",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({ message: "Failed to delete event" });
  }
}

export async function getEventParticipations(req, res) {
  try {
    const eventId = req.params.eventId;

    const participations = await Participation.find({ eventId }).populate({
      path: "userId",
      select: "-passwordHash -role",
    });

    return res.status(200).json({ participations });
  } catch (error) {
    console.error("Get Participations Error:", error);
    return res.status(500).json({ message: "Failed to fetch participations" });
  }
}

export async function getEventAnalytics(req, res) {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const [totalRegistered, checkedInCount] = await Promise.all([
      Participation.countDocuments({ eventId }),
      Participation.countDocuments({ eventId, checkedIn: true }),
    ]);

    const revenue = totalRegistered * (event.entryFee || 0);
    const capacity = event.maxParticipants || 0;
    const occupancyPercentage = capacity > 0 ? Math.min(Math.round((totalRegistered / capacity) * 100), 100) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalRegistered,
        checkedInCount,
        capacity,
        occupancyPercentage,
        revenue,
      },
    });
  } catch (error) {
    console.error("Get Analytics Error:", error);
    return res.status(500).json({ message: "Failed to fetch event analytics" });
  }
}

export async function getEventVolunteers(req, res) {
  try {
    const eventId = req.params.eventId;

    const volunteers = await Volunteering.find({ eventId }).populate({
      path: "userId",
      select: "-passwordHash -role",
    });

    return res.status(200).json({ volunteers });
  } catch (error) {
    console.error("Get Volunteers Error:", error);
    return res.status(500).json({ message: "Failed to fetch volunteers" });
  }
}

// GET /events/:eventId
export async function getEventDetails(req, res) {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await Event.findById(eventId).populate(
      "createdBy",
      "name email",
    );

    if (!event) {
      return res.status(404).json({ message: "Event with this id not found" });
    }

    const hasRegistered = !!(await Participation.findOne({ eventId, userId }));

    const now = new Date();

    const isExpired = now > event.endTime;
    const isRegistrationClosed = now > event.registrationDeadline;

    res.status(200).json({
      ...event.toObject(),
      hasRegistered,
      isExpired,
      isRegistrationClosed,
    });
  } catch (error) {
    console.log("Get Event Details Error:", error);
    res.status(500).json({ message: "Failed to fetch event details" });
  }
}

