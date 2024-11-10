import math

# FNV-1a hash function
def fnv_hash(x, y, seed, ore_type):
    h = 2166136261  # FNV offset basis

    # Combine inputs into a single list
    data = [x, y, seed, ore_type]

    # Process each byte of data
    for value in data:
        value &= 0xFFFFFFFF  # Ensure 32-bit unsigned integer
        for i in range(4):
            octet = (value >> (i * 8)) & 0xFF
            h ^= octet
            h = (h * 16777619) & 0xFFFFFFFF  # Ensure 32-bit unsigned integer

    return h

# Smooth noise function with interpolation
def smooth_noise(x, y, seed, ore_type):
    ix = int(math.floor(x))
    iy = int(math.floor(y))

    fx = x - ix
    fy = y - iy

    v00 = fnv_hash(ix, iy, seed, ore_type) / 4294967296.0
    v10 = fnv_hash(ix + 1, iy, seed, ore_type) / 4294967296.0
    v01 = fnv_hash(ix, iy + 1, seed, ore_type) / 4294967296.0
    v11 = fnv_hash(ix + 1, iy + 1, seed, ore_type) / 4294967296.0

    i1 = v00 * (1 - fx) + v10 * fx
    i2 = v01 * (1 - fx) + v11 * fx

    return i1 * (1 - fy) + i2 * fy

# Function to determine ore type at (x, y)
def get_ore_type(x, y, rand_seed):
    ore_types = 5
    max_noise = -1.0
    ore_type = 0  # 0 means no ore

    # Parameters for each ore type
    scales = [0.05, 0.1, 0.1, 0.1, 0.1]  # Adjust scales for each ore type
    thresholds = [0.85, 0.8, 0.75, 0.7, 0.65]  # Thresholds for ore presence

    # For each ore type, compute noise value
    for i in range(ore_types):
        scale = scales[i]
        threshold = thresholds[i]
        current_ore_type = i + 1  # Ore types from 1 to 5

        noise_value = smooth_noise(x * scale, y * scale, rand_seed, current_ore_type)

        if noise_value > threshold and noise_value > max_noise:
            max_noise = noise_value
            ore_type = current_ore_type

    return ore_type  # Returns 0 if no ore, or ore type (1 to 5)



# Function to generate and display a 30x30 map
def display_map(size, randSeed):
    # Create a grid for the map
    map_data = np.zeros((size, size))

    # Fill the map data based on ore presence
    for x in range(size):
        for y in range(size):
            map_data[y, x] = get_ore_type(x, y, randSeed)

    # Display the map
    plt.figure(figsize=(10, 10))
    cmap = plt.get_cmap('tab10', 6)  # Use a colormap with 6 discrete colors

    colors = cmap(np.arange(6))
    colors[0] = [1, 1, 1, 1]  # Set the first color (Empty) to white
    custom_cmap = ListedColormap(colors)

    plt.imshow(map_data, cmap=custom_cmap, origin="upper", vmin=0, vmax=5)
    cbar = plt.colorbar(ticks=[0,1,2,3,4,5])
    cbar.ax.set_yticklabels(['Empty', 'Ore 1', 'Ore 2', 'Ore 3', 'Ore 4', 'Ore 5'])
    plt.title("30x30 Ore Map Visualization with 5 Ore Types")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.show()

# Example usage with a single randSeed
randSeed = 42  # Provided as parameter
display_map(100, randSeed)