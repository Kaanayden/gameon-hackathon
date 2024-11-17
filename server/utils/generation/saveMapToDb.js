import mongoose from "mongoose";
import { getDefaultOreType } from "./mapGenerator.js";
import { MAP_SIZE } from "../../../frontend/src/utils/consts.js";
import BlockModel from "../../models/BlockModel.js";

const RAND_SEED = 42;

// Save generated map to database
export const saveMapToDb = async () => {

const blocks = [];

for (let x = 0; x < MAP_SIZE; x++) {
    for (let y = 0; y < MAP_SIZE; y++) {
        let oreType = getDefaultOreType(x, y, RAND_SEED);
        const newBlock = new BlockModel({
            x: x,
            y: y,
            type: oreType,
          });
            blocks.push(newBlock);
    }
}

// Save all blocks to database
try {
    for (const block of blocks) {
        await BlockModel.updateOne(
            { x: block.x, y: block.y }, // Filter
            { $set: block }, // Update
            { upsert: true } // Insert if not exists
        );
    }
    console.log("Blocks saved to database");
} catch (err) {
    console.error("Error saving blocks to database:", err);
}


};