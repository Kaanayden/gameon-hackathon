import express from "express";
import { verifyTelegramWebAppDataController } from "../controllers/telegram.js";
//import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();
//router.use("/", authMiddleware);

router.post("/verify-telegram-data", verifyTelegramWebAppDataController);

export default router;