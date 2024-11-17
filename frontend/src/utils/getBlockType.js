
export const blockTypes = {
    '0': { name: 'grass', path: 'naturalBlocks/grass.png', isMovable: true, isOre: false },
    '1': { name: 'coal', path: 'naturalBlocks/coal.png', isMovable: true, isOre: true },
    '2': { name: 'iron', path: 'naturalBlocks/iron.png', isMovable: true, isOre: true },
    '3': { name: 'copper', path: 'naturalBlocks/copper.png', isMovable: true, isOre: true },
    '4': { name: 'quartz', path: 'naturalBlocks/quartz.png', isMovable: true, isOre: true },
    '5': { name: 'bauxite', path: 'naturalBlocks/bauxite.png', isMovable: true, isOre: true },
    '6': { name: 'water', path: 'naturalBlocks/water.png', isMovable: false, isOre: false, isPlaceable: false },
}

const defaultBlockAttributes = {
    isMovable: true,
    isPlaceable: true,
    isNatural: true,
    isOre: false,
}

// Also map with the block names as a key and to value
const blockTypesByName = {};
Object.entries(blockTypes).forEach(([key, value]) => {
    blockTypesByName[value.name] = value;
});

export function getBlockName(number) {
    return blockTypes[number.toString()].name;
}

export function getBlockType(number) {
    // Return the block type object with default attributes
    return { ...defaultBlockAttributes, ...blockTypes[number.toString()] };
}

export function getBlockTypeByName(name) {
    // Return the block type object with default attributes
    return {...defaultBlockAttributes, ...blockTypesByName[name]};
}