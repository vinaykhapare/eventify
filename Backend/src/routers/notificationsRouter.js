import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationsController.js";

const notificationsRouter = Router();

notificationsRouter.get("/", getNotifications);
notificationsRouter.patch("/mark-all-read", markAllAsRead);
notificationsRouter.patch("/:id/read", markAsRead);
notificationsRouter.delete("/:id", deleteNotification);

export default notificationsRouter;
