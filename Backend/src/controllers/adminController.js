import Participation from "../models/Participation.js";
import Volunteering from "../models/Volunteering.js";
import Event from "../models/Event.js";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Events breakdown directly from MongoDB
    const [totalEvents, upcomingEvents, activeEvents, completedEvents] = await Promise.all([
      Event.countDocuments({ isDeleted: false }),
      Event.countDocuments({ isDeleted: false, startTime: { $gt: now } }),
      Event.countDocuments({
        isDeleted: false,
        startTime: { $lte: now },
        endTime: { $gte: now },
      }),
      Event.countDocuments({ isDeleted: false, endTime: { $lt: now } }),
    ]);

    // 2. Total Registrations / Tickets Sold
    const registrationsData = await Participation.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $count: "total" },
    ]);
    const totalRegistrations = registrationsData.length > 0 ? registrationsData[0].total : 0;
    const ticketsSold = totalRegistrations;
    const totalAttendees = totalRegistrations;

    // 3. Registrations Today
    const registrationsToday = await Participation.countDocuments({
      createdAt: { $gte: todayStart },
    });

    // 4. Live Attendance (Checked In)
    const attendanceData = await Participation.aggregate([
      { $match: { checkedIn: true } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $count: "total" },
    ]);
    const liveAttendance = attendanceData.length > 0 ? attendanceData[0].total : 0;

    // 5. Active Volunteers (distinct active user assignments)
    const volunteersData = await Volunteering.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$userId",
        },
      },
      { $count: "total" },
    ]);
    const volunteersActive = volunteersData.length > 0 ? volunteersData[0].total : 0;

    // 6. Revenue = sum of (event.entryFee) for all participations
    const revenueData = await Participation.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: null,
          revenueCollected: { $sum: "$event.entryFee" },
        },
      },
    ]);
    const revenueCollected = revenueData.length > 0 ? revenueData[0].revenueCollected : 0;

    // 7. Recent Registrations list (6 items)
    const recentParticipations = await Participation.find()
      .populate("userId", "name email avatarUrl")
      .populate("eventId", "name venue entryFee startTime")
      .sort({ createdAt: -1 })
      .limit(6);

    const checkInRate =
      totalRegistrations > 0 ? Math.round((liveAttendance / totalRegistrations) * 100) : 0;

    // Return complete real-time response
    return res.status(200).json({
      success: true,
      totalEvents,
      upcomingEvents,
      activeEvents,
      completedEvents,
      totalAttendees,
      ticketsSold,
      revenueCollected,
      registrationsToday,
      totalRegistrations,
      liveAttendance,
      volunteersActive,
      checkInRate,
      recentRegistrations: recentParticipations.filter((p) => p.userId && p.eventId),
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};
