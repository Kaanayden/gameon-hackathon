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
import { handleSocketConnection } from './controllers/socket.js';
import { getUserData, verifyTelegramWebAppData } from './utils/telegram.js';
import landDetailRoutes from './routes/landDetail.js';
import aeonRoutes from './routes/aeon.js';
import { startServiceWorker } from './serviceWorker.js';


const port = process.env.PORT || 8750;
const app = express();

app.use(cors());

app.use(cookieParser());
app.use(bodyParser.json()); // Use body-parser to parse JSON request bodies

connectDB();

app.use("/land", landRoutes);
app.use("/telegram", telegramRoutes);
app.use("/land-detail", landDetailRoutes);  
app.use("/aeon", aeonRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

export { io };

io.on('connection', (socket) => {
  // Add a welcome message to socket connection
  socket.emit('message', 'Welcome to the socket!');

  console.log('A user connected');  // Add logging here
  const verifyResult = verifyTelegramWebAppData(socket.handshake.auth.telegramInitData);
  if(!verifyResult) {
    socket.emit('message', 'Failed to verify Telegram Web App data');
    socket.disconnect();
    return;
  }
  socket.emit('message', 'Successfully verified Telegram Web App data');
  const userData = getUserData(socket.handshake.auth.telegramInitData);
  handleSocketConnection(socket, userData);
});

startServiceWorker();