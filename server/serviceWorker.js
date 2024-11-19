import mongoose from 'mongoose';
import BlockModel from './models/BlockModel.js';
import { getDefaultOreType } from './utils/generation/mapGenerator.js';
import { getBlockType } from '../frontend/src/utils/getBlockType.js';
import { getMaterialType } from '../frontend/src/utils/getMaterialType.js';
import MaterialModel from './models/MaterialModel.js';
import { io } from './index.js';


let socket;

const REFRESH_TIME = 5000;

export const nextBlockCoordinates = (block) => {
    const blockType = getBlockType(block.type);
    const finalDirection = (block.direction + blockType.outputDirection) % 4;
    switch (finalDirection) {
        case 0:
            return { x: block.x, y: block.y - 1 };
        case 1:
            return { x: block.x + 1, y: block.y };
        case 2:
            return { x: block.x, y: block.y + 1 };
        case 3:
            return { x: block.x - 1, y: block.y };
    }
}

const getDirection = (x1, y1, x2, y2) => {
    if (x1 === x2) {
        if (y1 < y2) {
            return 2;
        } else {
            return 0;
        }
    }
    if (y1 === y2) {
        if (x1 < x2) {
            return 1;
        } else {
            return 3;
        }
    }
}

function isFeeding(fromBlock, toBlock) {
    const toBlockType = getBlockType(toBlock.type);

    const whichDirectionIsInNextBlock = getDirection(fromBlock.x, fromBlock.y, toBlock.x, toBlock.y);
    const requiredDirection = (whichDirectionIsInNextBlock + 2 - toBlock.direction + 4) % 4;

    return toBlockType.inputDirections?.includes(requiredDirection);
}    


const runService = async () => {

    const materials = await MaterialModel.find();
    const compressedMaterials = materials.map(material => {
        return {
            x: material.x,
            y: material.y,
            type: material.type
        };
    });
    io.emit('materials', compressedMaterials);

    // Get all miners (type: 12)
    const miners = await BlockModel.find({ type: 12 });

    miners.forEach(async miner => {
        // Get the 4 blocks adjacent to the miner
        const adjacentBlocks = await BlockModel.find({
            $or: [
                { x: miner.x + 1, y: miner.y, direction: 1 },
                { x: miner.x - 1, y: miner.y, direction: 3 },
                { x: miner.x, y: miner.y + 1, direction: 2 },
                { x: miner.x, y: miner.y - 1, direction: 0 }
            ]
        });

        const minerOreBlockNumber = getDefaultOreType(miner.x, miner.y);
        const minerOreType = getBlockType(minerOreBlockNumber);
        const materialType = getMaterialType(minerOreType.name.replace('-block', ''));

        let currentBlocks = adjacentBlocks.map(block => block);

        const allBlocks = [];
        const paths = currentBlocks.map(block => [block]);

        for (const path of paths) {
            const lastBlocks = [path[0]];
        while (lastBlocks.length > 0) {

                const currBlock = lastBlocks.shift();
                const blockType = getBlockType(currBlock.type);

                if (blockType.isNatural) continue;

                if (blockType.isConveyor) {
                    const nextBlockCoords = nextBlockCoordinates(currBlock);
                    const nextBlock = await BlockModel.findOne({ x: nextBlockCoords.x, y: nextBlockCoords.y });

                    if(isFeeding(currBlock, nextBlock)) {
                        lastBlocks.push(nextBlock);
                        path.push(nextBlock);
                    }
                }
                allBlocks.push(currBlock);
        
        }

    }


        for (const path of paths) {
            // first one is after the miner always
            for(let i = path.length - 1; i > 0; i--) {
                const currBlock = path[i];
                const prevBlock = path[i - 1];
                const currBlockType = getBlockType(currBlock.type);
                const prevBlockType = getBlockType(prevBlock.type);

                console.log("currBlock", currBlock.x, currBlock.y, currBlockType.name, "prevBlock", prevBlock.x, prevBlock.y, prevBlockType.name);

                if(!currBlockType.isConveyor) continue;

                /*
                if(prevBlockType.name == 'miner') {
                    await MaterialModel.create({
                        x: currBlock.x,
                        y: currBlock.y,
                        type: materialType
                    });
                    return;
                }
                    */

                const prevBlockMaterial = await MaterialModel.findOne({ x: prevBlock.x, y: prevBlock.y });
                const currBlockMaterial = await MaterialModel.findOne({ x: currBlock.x, y: currBlock.y });

                console.log("prevBlockMaterial", prevBlockMaterial, "currBlockMaterial", currBlockMaterial);

                if(!currBlockMaterial && prevBlockMaterial) {
                    await MaterialModel.updateOne(
                        { x: prevBlock.x, y: prevBlock.y },
                        { x: currBlock.x, y: currBlock.y }
                    );
                }
            }
            const firstPathBlock = path[0];
            const firstPathBlockType = getBlockType(firstPathBlock.type);
            const firstPathBlockMaterial = await MaterialModel.findOne({ x: firstPathBlock.x, y: firstPathBlock.y });
            
            if(firstPathBlockType.isConveyor && !firstPathBlockMaterial) {
                console.log("created at", firstPathBlock.x, firstPathBlock.y)
                await MaterialModel.create({
                    x: firstPathBlock.x,
                    y: firstPathBlock.y,
                    type: materialType.name
                });
    
            }
        }


    });

    console.log('Service Worker is running');
};


export function startServiceWorker(newSocket) {
    socket = newSocket;
    // Run the event each 5 seconds
    setInterval(runService, REFRESH_TIME);

}
