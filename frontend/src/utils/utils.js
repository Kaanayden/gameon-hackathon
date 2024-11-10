// Hash function to generate pseudo-random values
function noise(x, y, seed, oreType) {
    let n = x + y * 57 + seed * 131 + oreType * 951;  // Include oreType in the hash
    n = (n << 13) ^ n;
    const nn = (n * (n * n * 15731 + 789221) + 1376312589);
    return 1.0 - ((nn & 0x7fffffff) / 1073741824.0);
}

// Linear interpolation function
function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

// Smooth noise function with interpolation
function smoothNoise(x, y, seed, oreType) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const fx = x - ix;
    const fy = y - iy;

    const v00 = noise(ix, iy, seed, oreType);
    const v10 = noise(ix + 1, iy, seed, oreType);
    const v01 = noise(ix, iy + 1, seed, oreType);
    const v11 = noise(ix + 1, iy + 1, seed, oreType);

    const i1 = lerp(v00, v10, fx);
    const i2 = lerp(v01, v11, fx);

    return lerp(i1, i2, fy);
}

// Function to determine ore type at (x, y)
function getOreType(x, y, randSeed) {
    const oreTypes = 5;
    let maxNoise = null;
    let oreType = 0;  // 0 means no ore

    // Parameters for each ore type
    const scales = [0.05, 0.08, 0.1, 0.12, 0.15];  // Adjust scales for each ore type
    const thresholds = [0.6, 0.65, 0.7, 0.75, 0.8];  // Thresholds for ore presence

    // For each ore type, compute noise value
    for (let i = 0; i < oreTypes; i++) {
        const scale = scales[i];
        const threshold = thresholds[i];
        const currentOreType = i + 1;  // Ore types from 1 to 5

        let noiseValue = smoothNoise(x * scale, y * scale, randSeed, currentOreType);
        noiseValue = (noiseValue + 1) / 2.0;  // Map from [-1, 1] to [0, 1]

        if (noiseValue > threshold) {
            if (maxNoise === null || noiseValue > maxNoise) {
                maxNoise = noiseValue;
                oreType = currentOreType;
            }
        }
    }

    return oreType;  // Returns 0 if no ore, or ore type (1 to 5)
}

// Example usage
const x = 10;
const y = 15;
const randSeed = 42;

const oreType = getOreType(x, y, randSeed);
console.log(`Ore type at (${x}, ${y}): ${oreType === 0 ? "No ore" : "Ore " + oreType}`);