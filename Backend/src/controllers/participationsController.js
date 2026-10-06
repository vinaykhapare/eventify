import Event from "../models/Event.js";
import Participation from "../models/Participation.js";
import { createAndEmitNotification, emitDashboardUpdate } from "../services/socketService.js";

// POST /participations
export async function registerForEvent(req, res) {
  try {
    const userId = req.user.id;
    const eventId = req.body.eventId;

    if (!userId) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event with this id not found!" });
    }

    const now = new Date();

    //  block registration if deadline passed
    if (now > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline is over!",
      });
    }

    //  block registration if event already ended
    if (now > event.endTime) {
      return res.status(400).json({
        success: false,
        message: "Event already ended!",
      });
    }

    //  block if already registered
    const alreadyRegistered = await Participation.findOne({ eventId, userId });

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event!",
      });
    }

    //  check max participants
    const totalRegistered = await Participation.countDocuments({ eventId });

    if (totalRegistered >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event registration is full!",
      });
    }

    //  register
    const participation = await Participation.create({ eventId, userId });

    createAndEmitNotification({
      recipient: userId,
      type: "TICKET_PURCHASE",
      title: "Registration Confirmed!",
      message: `You have successfully registered for ${event.name}. Show your digital QR pass at check-in.`,
      data: { participationId: participation._id, eventId },
    });

    createAndEmitNotification({
      recipient: null,
      recipientRole: "ADMIN",
      type: "REGISTRATION",
      title: "New Registration",
      message: `${req.user?.name || "A student"} registered for ${event.name}.`,
      data: { participationId: participation._id, eventId },
    });

    emitDashboardUpdate();

    return res
      .status(201)
      .json({ success: true, message: "Successfully registered!", participation });
  } catch (error) {
    console.log("Register Error:", error);
    return res.status(500).json({ message: "Failed to register" });
  }
}


// GET /participations/me (QR codes)
export async function getAllTickets(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    const participations = await Participation.find({ userId }).populate({
      path: "eventId",
    });

    // remove assignments where event is deleted / null
    const validParticipations = participations.filter((a) => a.eventId);

    return res.status(200).json({ tickets: validParticipations });
  } catch (error) {
    console.error("Get Tickets Error:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}

// POST /participations/:participationId/checkin
export async function checkInParticipant(req, res) {
  try {
    const eventId = req.body.eventId;
    const participationId = req.params.participationId;

    if (!participationId) {
      return res.status(400).json({ success: false, message: "Participation ID is required" });
    }

    // check if participation exists
    const participation = await Participation.findById(participationId).populate({
      path: "eventId",
    });

    if (!participation) {
      return res
        .status(404)
        .json({ success: false, message: "User is not a participant" });
    }

    // check if event exists
    if (!participation.eventId) {
      return res.status(404).json({
        success: false,
        message: "Associated event not found or has been deleted",
      });
    }

    // check if user already checked in
    if (participation.checkedIn) {
      return res
        .status(400)
        .json({ success: false, message: "User already checked in!" });
    }

    // check event match (safe string comparison)
    const participationEventId = participation.eventId._id ? participation.eventId._id.toString() : String(participation.eventId);
    if (participationEventId !== String(eventId)) {
      return res.status(400).json({
        success: false,
        message: "User is not participant of this event",
      });
    }

    // check if event expired
    if (participation.eventId.endTime && new Date() > new Date(participation.eventId.endTime)) {
      return res.status(400).json({
        success: false,
        message: "Event already expired!",
      });
    }

    // if everything is okay
    await Participation.findByIdAndUpdate(
      participationId,
      {
        checkedIn: true,
        checkInTime: new Date(),
      },
      { new: true },
    );

    createAndEmitNotification({
      recipient: null,
      recipientRole: "ADMIN",
      type: "ATTENDEE_CHECKIN",
      title: "Gate Admission",
      message: `${participation.userId?.name || "An attendee"} checked in to ${participation.eventId?.name || "the event"}.`,
      data: { participationId, eventId },
    });

    emitDashboardUpdate();

    return res
      .status(200)
      .json({ success: true, message: "Successfully checked in!" });
  } catch (error) {
    console.error("Check-in Error:", error);
    return res.status(500).json({ success: false, message: "Failed to check in participant" });
  }
}


// GET /participations — admin sees all registrations
export async function getAllParticipations(req, res) {
  try {
    const participations = await Participation.find()
      .populate("userId", "name email phone")
      .populate("eventId", "name")
      .sort({ createdAt: -1 });

    // remove deleted users/events
    const valid = participations.filter(
      (p) => p.userId && p.eventId
    );

    const formatted = valid.map((p) => ({
      id: p._id,
      name: p.userId.name,
      email: p.userId.email,
      phone: p.userId.phone ?? "N/A",
      event: p.eventId.name,
      status: p.checkedIn ? "Confirmed" : "Pending",
      registeredAt: p.createdAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));

    return res.status(200).json(formatted);

  } catch (error) {
    console.log("Get Participations Error:", error);
    return res.status(500).json({
      message: "Failed to fetch participations",
    });
  }
}