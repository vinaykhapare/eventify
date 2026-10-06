import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

router.get("/dashboard", requireRole("ADMIN"), getDashboardStats);

export default router;
