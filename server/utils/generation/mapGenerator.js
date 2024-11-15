const MAP_SIZE = 400

// Require the file system module
import fs from 'fs';

// FNV-1a hash function
function fnv_hash(x, y, seed, oreType) {
    let h = 2166136261; // FNV offset basis

    // Combine inputs into an array
    let data = [x, y, seed, oreType];

    // Process each byte of data
    for (let i = 0; i < data.length; i++) {
        let value = data[i] >>> 0; // Ensure 32-bit unsigned integer
        for (let j = 0; j < 4; j++) {
            let octet = (value >> (j * 8)) & 0xFF;
            h ^= octet;
            h = Math.imul(h, 16777619) >>> 0; // Ensure 32-bit unsigned integer
        }
    }

    return h;
}

// Smooth noise function with interpolation
function smooth_noise(x, y, seed, oreType) {
    let ix = Math.floor(x);
    let iy = Math.floor(y);

    let fx = x - ix;
    let fy = y - iy;

    let v00 = fnv_hash(ix, iy, seed, oreType) / 4294967296.0;
    let v10 = fnv_hash(ix + 1, iy, seed, oreType) / 4294967296.0;
    let v01 = fnv_hash(ix, iy + 1, seed, oreType) / 4294967296.0;
    let v11 = fnv_hash(ix + 1, iy + 1, seed, oreType) / 4294967296.0;

    let i1 = v00 * (1 - fx) + v10 * fx;
    let i2 = v01 * (1 - fx) + v11 * fx;

    return i1 * (1 - fy) + i2 * fy;
}

// Function to determine ore type at (x, y)
function getOreType(x, y, randSeed) {
    const oreTypes = 5;
    let maxNoise = -1.0;
    let oreType = 0; // 0 means no ore

    // Parameters for each ore type
    const scales = [0.06, 0.11, 0.11, 0.11, 0.4]; // Adjust scales for each ore type
    const thresholds = [0.93, 0.89, 0.89, 0.89, 0.86]; // Thresholds for ore presence

    const waterScale = 0.1
    const waterThreshold = 0.8

    const waterNoise = smooth_noise(x * waterScale, y * waterScale, randSeed, 42);


    if(waterNoise > waterThreshold) return 6;

    // For each ore type, compute noise value
    for (let i = 0; i < oreTypes; i++) {
        let scale = scales[i];
        let threshold = thresholds[i];
        let currentOreType = i + 1; // Ore types from 1 to 5

        let noiseValue = smooth_noise(x * scale, y * scale, randSeed, currentOreType);

        if (noiseValue > threshold && noiseValue > maxNoise) {
            maxNoise = noiseValue;
            oreType = currentOreType;
        }
    }

    return oreType; // Returns 0 if no ore, or ore type (1 to 5)
}

// Example usage
let randSeed = 42;

// Create a write stream to the file
const file = fs.createWriteStream('./ore_map.txt');

for (let x = 0; x < MAP_SIZE; x++) {
    for (let y = 0; y < MAP_SIZE; y++) {
        let oreType = getOreType(x, y, randSeed);
        file.write(`At (${x}, ${y}): Ore Type ${oreType}\n`);
    }
}


    
// displaying 200x200 grid example while generating
for(let y = 0; y < MAP_SIZE; y++) {
    let row = '';
    for(let x = 0; x < MAP_SIZE; x++) {
        let oreType = getOreType(x, y, randSeed);
        row += oreType > 0 ? ( oreType != 6 ? oreType : 'W') : '.';
    }
    file.write(row + '\n');
    console.log(row);
}

// Close the file after writing
file.end(() => {
    console.log('Ore map has been written to ore_map.txt');
});


//20x20 chunks

export function getDefaultOreType(x, y, randSeed) {
    return getOreType(x, y, randSeed);
}

