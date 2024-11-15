import mongoose from "mongoose";

const RAND_SEED = 42;

// Save generated map to database
export const saveMapToDb = (map, randSeed) => {
  const Map = mongoose.model("Map");

  // Create a new map document
  const newMap = new Map({
    randSeed,
    map,
  });

  // Save the map to the database
  newMap.save((err, map) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Map saved to database");
    }
  });
};