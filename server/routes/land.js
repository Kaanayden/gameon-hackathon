import express from "express";
import { getChunks } from "../controllers/land.js";
//import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();
//router.use("/", authMiddleware);

router.get("/get-chunks", getChunks);

export default router;