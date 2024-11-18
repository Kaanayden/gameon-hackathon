
export const buildableBlocks = {
    '7': {name : 'conveyor', path: 'buildableBlocks/conveyor.png', isMovable: true, isOre: false, isPlaceable: false, isNatural: false, isBuildable: true, inputDirections: [0], outputDirections: [2], isStorage: false, isSpriteSheet: true, isConveyor: true, frames: [0, 1, 2, 3, 4, 5, 6, 7], frameSize: 32}, 
    '8': {name : 'clockwiseConveyor', path: 'buildableBlocks/curves.png', isMovable: true, isOre: false, isPlaceable: false, isNatural: false, isBuildable: true, inputDirections: [0], outputDirections: [3], isStorage: false, isSpriteSheet: true, isConveyor: true, frames: [0], frameSize: 32},
    '9': {name : 'counterClockwiseConveyor', path: 'buildableBlocks/curves.png', isMovable: true, isOre: false, isPlaceable: false, isNatural: false, isBuildable: true, inputDirections: [0], outputDirections: [1], isStorage: false, isSpriteSheet: true, isConveyor: true, frames:[1], frameSize: 32},
    '10': {name: 'assembler', path: 'buildableBlocks/assembler.png', isMovable: true, isOre: false, isPlaceable: false, isNatural: false, isBuildable: true, inputDirections: [0, 1, 3], outputDirections: [2], isStorage: true, isSpriteSheet: true, frames: [13], frameSize: 56},
    '11': {name: 'storage', path: 'buildableBlocks/storage.png', isMovable: true, isOre: false, isPlaceable: false, isNatural: false, isBuildable: true, inputDirections: [0], outputDirections: null, isStorage: true, isSpriteSheet: false},
}   

export const blockTypes = {
    '0': { name: 'grass', path: 'naturalBlocks/grass.png', isMovable: true, isOre: false },
    '1': { name: 'coal', path: 'naturalBlocks/coal.png', isMovable: true, isOre: true },
    '2': { name: 'iron', path: 'naturalBlocks/iron.png', isMovable: true, isOre: true },
    '3': { name: 'copper', path: 'naturalBlocks/copper.png', isMovable: true, isOre: true },
    '4': { name: 'quartz', path: 'naturalBlocks/quartz.png', isMovable: true, isOre: true },
    '5': { name: 'bauxite', path: 'naturalBlocks/bauxite.png', isMovable: true, isOre: true },
    '6': { name: 'water', path: 'naturalBlocks/water.png', isMovable: false, isOre: false, isPlaceable: false },
    ...buildableBlocks
}

const defaultBlockAttributes = {
    isMovable: true,
    isPlaceable: true,
    isNatural: true,
    isOre: false,
    isStorage: false,
    inputDirections: null,
    outputDirections: null,
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