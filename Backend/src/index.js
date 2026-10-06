import http from "http";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectToDB from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import uploadsRouter from "./routers/uploadsRouter.js";
import eventRouter from "./routers/eventsRouter.js";
import volunteeringRouter from "./routers/VolunteeringRouter.js";
import participationsRouter from "./routers/participationsRouter.js";
import adminRouter from "./routers/adminRouter.js";
import notificationsRouter from "./routers/notificationsRouter.js";
import profileRouter from "./routers/profileRouter.js";
import messagesRouter from "./routers/messagesRouter.js";
import { initSocket } from "./services/socketService.js";
import { requireAuth } from "./middlewares/requireAuth.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://eventify-eight-swart.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback for custom preview domains
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rapid preflight response (ensures zero cold-start delay for CORS OPTIONS requests)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Root and health endpoints (accessible without blocking on cold DB connection)
app.get("/", (req, res) => {
  res.status(200).json({ data: "hello world!", status: "online" });
});

app.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "ok",
    database: isDbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// DB connection assurance middleware for application routes
app.use(async (req, res, next) => {
  try {
    await connectToDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRouter);
app.use("/uploads", requireAuth, uploadsRouter);
app.use("/events", requireAuth, eventRouter);
app.use("/volunteering", requireAuth, volunteeringRouter);
app.use("/participations", requireAuth, participationsRouter);
app.use("/admin", requireAuth, adminRouter);
app.use("/notifications", requireAuth, notificationsRouter);
app.use("/profile", requireAuth, profileRouter);
app.use("/messages", requireAuth, messagesRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize real-time Socket.io service
initSocket(httpServer, allowedOrigins);

async function startServer() {
  httpServer.listen(port, () => {
    console.log("Server started successfully");
  });

  try {
    await connectToDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}


// Start listener for traditional Node runtime; Vercel serverless exports app
if (!process.env.VERCEL) {
  startServer();
}

export default app;

//ENDPOINTS

/*
---AUTH---

POST /auth/login
POST /auth/signup

---Admin---

GET /events (all the events created by admin)
POST /events
PATCH /events/:eventId
DELETE /events/:eventId

POST /auth/signup (create volunteer)
POST /volunteering (assign volunteer)

GET /events/:eventId/participants
GET /events/:eventId/analytics
GET /events/:eventId/volunteers

GET /volunteering (all volunteers created by admin)

---Volunteer---

GET /volunteering/me (assigned events)
POST /participations/:id/checkin

---Participant---

GET /events (all events)
GET /events/:eventId
POST /participations
GET /participations/me (QR codes)
*/
