import express from 'express';
import { connectDB } from './utils/db.js';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {Server} from 'socket.io';
import bodyParser from 'body-parser';

//import socketHandler from './utils/socket.js';

// Routes
import landRoutes from "./routes/land.js";
import telegramRoutes from "./routes/telegram.js";
import { saveMapToDb } from './utils/generation/saveMapToDb.js';


const port = process.env.PORT || 8750;
const socketPort = process.env.SOCKET_URL || 3030;
const app = express();

app.use(cors());

app.use(cookieParser());
app.use(bodyParser.json()); // Use body-parser to parse JSON request bodies

connectDB();

app.use("/land", landRoutes);
app.use("/telegram", telegramRoutes);


//const server = socketHandler(app);
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
