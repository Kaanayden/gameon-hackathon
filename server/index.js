import express from 'express';
import { connectDB } from './utils/db.js';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {Server} from 'socket.io';
//import socketHandler from './utils/socket.js';

// Routes
import landRoutes from "./routes/land.js";


const port = process.env.PORT || 8080;
const socketPort = process.env.SOCKET_URL || 3030;
const app = express();

app.use(
  cors()
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/land", landRoutes);

//const server = socketHandler(app);
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
