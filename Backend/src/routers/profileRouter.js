import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  removeAvatar,
} from "../controllers/profileController.js";

const profileRouter = Router();

profileRouter.get("/me", getProfile);
profileRouter.patch("/me", updateProfile);
profileRouter.patch("/change-password", changePassword);
profileRouter.delete("/avatar", removeAvatar);

export default profileRouter;
