import express from "express";
import {  payWithAeon } from "../controllers/aeon.js";
//import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();
//router.use("/", authMiddleware);

router.post("/pay", payWithAeon);

export default router;