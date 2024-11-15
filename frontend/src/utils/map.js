import { CHUNK_SIZE } from "./consts";

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
    const scales = [0.05, 0.1, 0.1, 0.1, 0.1]; // Adjust scales for each ore type
    const thresholds = [0.85, 0.8, 0.75, 0.7, 0.65]; // Thresholds for ore presence

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



export function getDefaultOreType(x, y, randSeed) {
    return getOreType(x, y, randSeed);
}

// it can be given any x, y; it will be return that chunk which contains that x, y coordinates
export function getDefaultMapChunk(x, y) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkY = Math.floor(y / CHUNK_SIZE);

     // Create a 2D array using Array.map
     const chunk = Array(CHUNK_SIZE).fill().map((_, row) => 
        Array(CHUNK_SIZE).fill().map((_, col) => {
            // Calculate absolute coordinates
            const worldX = chunkX * CHUNK_SIZE + col;
            const worldY = chunkY * CHUNK_SIZE + row;
            
            // Get ore type for each position
            return getDefaultOreType(worldX, worldY, 0); // Replace 0 with your randSeed
        })
    );

    return chunk;
}