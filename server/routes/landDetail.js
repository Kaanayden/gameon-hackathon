import express from 'express';
import { getOwnerAddress } from '../controllers/landDetail.js';

const router = express.Router();

router.get("/get-owner", getOwnerAddress);

export default router;
