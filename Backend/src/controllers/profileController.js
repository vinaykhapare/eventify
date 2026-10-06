import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Participation from "../models/Participation.js";
import Volunteering from "../models/Volunteering.js";
import Event from "../models/Event.js";
import { createAndEmitNotification } from "../services/socketService.js";

// GET /profile/me — Fetch authenticated user profile with executive activity metrics
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const adminId = `ADM-${user._id.toString().slice(-6).toUpperCase()}`;

    let activityStats = {
      eventsAttended: 0,
      ticketsCount: 0,
      volunteerShifts: 0,
      eventsManaged: 0,
      totalAttendeesHandled: 0,
      revenueOverview: 0,
    };

    if (user.role === "ADMIN") {
      const [eventsManaged, attendeesCount, revenueData] = await Promise.all([
        Event.countDocuments({ isDeleted: false }),
        Participation.countDocuments(),
        Participation.aggregate([
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
              totalRevenue: { $sum: "$event.entryFee" },
            },
          },
        ]),
      ]);

      activityStats.eventsManaged = eventsManaged;
      activityStats.totalAttendeesHandled = attendeesCount;
      activityStats.revenueOverview = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    } else if (user.role === "STUDENT") {
      const ticketsCount = await Participation.countDocuments({ userId: user._id });
      const eventsAttended = await Participation.countDocuments({
        userId: user._id,
        checkedIn: true,
      });
      activityStats.ticketsCount = ticketsCount;
      activityStats.eventsAttended = eventsAttended;
    } else if (user.role === "VOLUNTEER") {
      const volunteerShifts = await Volunteering.countDocuments({ userId: user._id });
      activityStats.volunteerShifts = volunteerShifts;
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        adminId,
        roleFormatted: user.role === "ADMIN" ? "Administrator" : user.role,
        organization: user.organization || "College Student Affairs & Event Board",
        accessLevel: user.accessLevel || "Level 4 — Full Superadmin Control",
        registrationNumber: user.registrationNumber || "REG-INST-7842-ADM",
        accountCreationDate: user.createdAt,
      },
      activityStats,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
}

// PATCH /profile/me — Update editable fields ONLY (locked fields are protected)
export async function updateProfile(req, res) {
  try {
    const { name, phone, bio, address, socialLinks, avatarUrl } = req.body;
    const userId = req.user._id;

    // Strict whitelist: Only editable personal info can be changed
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (bio !== undefined) updates.bio = String(bio).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (socialLinks !== undefined && typeof socialLinks === "object") {
      updates.socialLinks = {
        linkedin: socialLinks.linkedin ? String(socialLinks.linkedin).trim() : "",
        twitter: socialLinks.twitter ? String(socialLinks.twitter).trim() : "",
        website: socialLinks.website ? String(socialLinks.website).trim() : "",
      };
    }

    // Locked fields cannot be changed via this endpoint
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    const adminId = `ADM-${updatedUser._id.toString().slice(-6).toUpperCase()}`;

    // Real-time notification for profile update
    await createAndEmitNotification({
      recipient: userId,
      type: "PROFILE_UPDATE",
      title: "Profile Updated",
      message: "Your profile information and contact details were saved successfully.",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updatedUser.toObject(),
        adminId,
        roleFormatted: updatedUser.role === "ADMIN" ? "Administrator" : updatedUser.role,
        organization: updatedUser.organization || "College Student Affairs & Event Board",
        accessLevel: updatedUser.accessLevel || "Level 4 — Full Superadmin Control",
        registrationNumber: updatedUser.registrationNumber || "REG-INST-7842-ADM",
        accountCreationDate: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}

// PATCH /profile/change-password — Update account password credentials
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await createAndEmitNotification({
      recipient: userId,
      type: "PROFILE_UPDATE",
      title: "Password Changed",
      message: "Your account security credentials were updated successfully.",
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
}

// DELETE /profile/avatar — Remove profile photo
export async function removeAvatar(req, res) {
  try {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, { avatarUrl: "" });
    return res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
    });
  } catch (error) {
    console.error("Remove Avatar Error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove avatar" });
  }
}
