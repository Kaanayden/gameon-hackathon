import { CHUNK_SIZE, RAND_SEED } from "../../frontend/src/utils/consts.js";
import BlockModel from "../models/BlockModel.js";
import { getDefaultOreType } from "../utils/generation/mapGenerator.js";



export function getContacts(req, res) {
    res.status(200).send("getContacts");
}

export function getDefaultMapChunk(chunkX, chunkY) {

    // Create a 2D array using Array.map
    const chunk = Array(CHUNK_SIZE).fill().map((_, col) => 
       Array(CHUNK_SIZE).fill().map((_, row) => {
           // Calculate absolute coordinates
           const worldX = chunkX * CHUNK_SIZE + col;
           const worldY = chunkY * CHUNK_SIZE + row;
           
           // Get ore type for each position
           return getDefaultOreType(worldX, worldY, RAND_SEED);
       })
   );

   return chunk;
}


export async function getChunks(req, res) {
    // get chunk coordinates from query as array of arrays
    const chunkCoordinates = req.query.chunks;
    try {
        //console.log(chunkCoordinates);
    let chunks = JSON.parse(chunkCoordinates);

    chunks = chunks.map(chunk => {
        return { chunkX: chunk[0], chunkY: chunk[1] };
    }  );

    const chunkPromises = chunks.map(async chunk => {
        const chunkData = getDefaultMapChunk(chunk.chunkX, chunk.chunkY);
        //console.log("chunkData", chunks, chunkData);
    
        // Get blocks from the database in specified range and modify chunk
        const blocks = await BlockModel.find({ 
            x: { $gte: chunk.chunkX * CHUNK_SIZE, $lt: (chunk.chunkX + 1) * CHUNK_SIZE }, 
            y: { $gte: chunk.chunkY * CHUNK_SIZE, $lt: (chunk.chunkY + 1) * CHUNK_SIZE } 
        });
    
        // Modify chunk with blocks data
        blocks.forEach(block => {
            const localX = block.x % CHUNK_SIZE;
            const localY = block.y % CHUNK_SIZE;
            chunkData[localX][localY] = block.type;
        });

        //console.log("not default blocks", blocks);
    
        return chunkData;
    });
    

    const allChunkData = await Promise.all(chunkPromises);

    res.status(200).json(allChunkData);
   } catch (err) {
        console.error("Error getting chunks:", err);
        res.status(500).send("Error getting chunks");

}
}

