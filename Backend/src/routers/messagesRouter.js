import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messagesController.js";

const messagesRouter = Router();

messagesRouter.get("/", getMessages);
messagesRouter.post("/", sendMessage);

export default messagesRouter;
