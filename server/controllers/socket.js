const currentPlayers = {};

export const handleSocketConnection = (socket, userData) => {
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


  // id, x, y
  socket.on('playerJoin', (data) => {
    console.log('userData:', userData);
    console.log('Player joined:', data);
    currentPlayers[userData.id] = data;
    socket.broadcast.emit('playerJoin', data);

    // Send current players to the new player
    for (const id in currentPlayers) {
      if (id !== data.id) {
        socket.emit('playerJoin', currentPlayers[id]);
      }
    }

  });
  
    socket.on('playerMove', (data) => {
        //console.log('Player moved:', data);
        currentPlayers[userData.id] = data;
        socket.broadcast.emit('playerMove', data);
    });

    socket.on('playerLeft', () => {
        console.log('Player left:', userData.id);
        delete currentPlayers[userData.id];
        socket.broadcast.emit('playerLeft', userData.id);
    });

    socket.on('disconnect', () => {
        console.log('Player left:', userData.id);
        delete currentPlayers[userData.id];
        socket.broadcast.emit('playerLeft', userData.id);
        console.log('A user disconnected');
      });


};
