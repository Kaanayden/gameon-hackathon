import { getBlockType } from '../../frontend/src/utils/getBlockType.js';
import { io } from '../index.js';
import BlockModel from '../models/BlockModel.js';
import MaterialModel from '../models/MaterialModel.js';
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
  socket.on('playerJoin', async (data) => {
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

    const materials = await MaterialModel.find();
    const compressedMaterials = materials.map(material => {
        return {
            x: material.x,
            y: material.y,
            type: material.type
        };
    });
    socket.emit('materials', compressedMaterials);

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

      //Handle placeBlock
      socket.on('placeBlock', (data) => {
          console.log('Block placed:', data);
          io.emit('blockPlaced', data);

          const newBlock = new BlockModel({
            x: data.x,
            y: data.y,
            type: data.blockType,
            direction: data.direction
          });

          BlockModel.updateOne(
            { x: newBlock.x, y: newBlock.y }, // Filter
            { $set: newBlock }, // Update
            { upsert: true } // Insert if not exists
        ).then(() => {
            console.log('Block placed successfully');
        }).catch((err) => {
            console.error('Failed to place block:', err);
        });

        const blockType = getBlockType(data.blockType)
        if(!blockType.isConveyor) {
          // Also delete the material if it is not a conveyor and if there is any
          MaterialModel.deleteOne({ x: data.x, y: data.y }).then(() => {
              console.log('Material deleted successfully');
          }

          ).catch((err) => {
              console.error('Failed to delete material:', err);
          });
        }

      });



};
