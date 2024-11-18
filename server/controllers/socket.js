export const handleSocketConnection = (socket) => {
  console.log('A user connected');

  socket.on('message', (data) => {
    console.log('Message received:', data);
    // Broadcast the message to all connected clients
    socket.broadcast.emit('message', data);
  });

  socket.on('joinRoom', (room) => {
    console.log(`User joined room: ${room}`);
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
};
