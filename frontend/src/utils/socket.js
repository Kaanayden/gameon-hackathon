import { io } from "socket.io-client";

let socket;

export function getSocket() {
    return socket;
}

export const connectSocket = (telegramInitData) => {

// Create a Socket.IO client instance
socket = io(import.meta.env.VITE_BASE_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'], // Ensure both transports are available
  secure: true, // Use secure connection if your server uses HTTPS
  auth: {
    telegramInitData: telegramInitData
  }
});

};

export function handleSocket() {
    // Handle connection event
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    // Handle disconnection event
    socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
    });
    
    // Handle messages from the server
    socket.on('message', (msg) => {
        console.log('Message from server:', msg);
    });
    
    // Handle errors
    socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
    });
}
