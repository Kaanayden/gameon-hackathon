#include <stdio.h>
#include <stdint.h>
#include <math.h>

// FNV-1a hash function
uint32_t fnv_hash(int32_t x, int32_t y, int32_t seed, int32_t ore_type) {
    uint32_t h = 2166136261U; // FNV offset basis

    // Combine inputs into an array
    int32_t data[4] = { x, y, seed, ore_type };

    // Process each byte of data
    for (int i = 0; i < 4; i++) {
        uint32_t value = (uint32_t)data[i];
        for (int j = 0; j < 4; j++) {
            uint8_t octet = (value >> (j * 8)) & 0xFF;
            h ^= octet;
            h *= 16777619U;
        }
    }

    return h;
}

// Smooth noise function with interpolation
double smooth_noise(double x, double y, int32_t seed, int32_t ore_type) {
    int32_t ix = (int32_t)floor(x);
    int32_t iy = (int32_t)floor(y);

    double fx = x - ix;
    double fy = y - iy;

    uint32_t v00 = fnv_hash(ix, iy, seed, ore_type);
    uint32_t v10 = fnv_hash(ix + 1, iy, seed, ore_type);
    uint32_t v01 = fnv_hash(ix, iy + 1, seed, ore_type);
    uint32_t v11 = fnv_hash(ix + 1, iy + 1, seed, ore_type);

    double n00 = v00 / 4294967296.0;
    double n10 = v10 / 4294967296.0;
    double n01 = v01 / 4294967296.0;
    double n11 = v11 / 4294967296.0;

    double i1 = n00 * (1 - fx) + n10 * fx;
    double i2 = n01 * (1 - fx) + n11 * fx;

    return i1 * (1 - fy) + i2 * fy;
}

// Function to determine ore type at (x, y)
int get_ore_type(double x, double y, int32_t rand_seed) {
    const int ore_types = 5;
    double max_noise = -1.0;
    int ore_type = 0; // 0 means no ore

    // Parameters for each ore type
    double scales[5] = { 0.05, 0.1, 0.1, 0.1, 0.1 };      // Adjust scales for each ore type
    double thresholds[5] = { 0.85, 0.8, 0.75, 0.7, 0.65 }; // Thresholds for ore presence

    // For each ore type, compute noise value
    for (int i = 0; i < ore_types; i++) {
        double scale = scales[i];
        double threshold = thresholds[i];
        int current_ore_type = i + 1; // Ore types from 1 to 5

        double noise_value = smooth_noise(x * scale, y * scale, rand_seed, current_ore_type);

        if (noise_value > threshold && noise_value > max_noise) {
            max_noise = noise_value;
            ore_type = current_ore_type;
        }
    }

    return ore_type; // Returns 0 if no ore, or ore type (1 to 5)
}
int main() {
    int rand_seed = 42;

    // Open a file for writing
    FILE *file = fopen("ore_map.txt", "w");
    if (file == NULL) {
        fprintf(stderr, "Error opening file for writing.\n");
        return 1;
    }

    // Iterate over the map and write to the file
    for (int x = 0; x < 100; x++) {
        for (int y = 0; y < 100; y++) {
            int ore_type = get_ore_type((double)x, (double)y, rand_seed);
            fprintf(file, "At (%d, %d): Ore Type %d\n", x, y, ore_type);
        }
    }

    // Close the file
    fclose(file);

    printf("Ore map has been written to ore_map.txt\n");

    return 0;
}