import express from "express";
import { getContacts } from "../controllers/land.js";
//import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();
//router.use("/", authMiddleware);

router.get("/get-contacts", getContacts);

export default router;