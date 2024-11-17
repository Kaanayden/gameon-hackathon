
export const blockTypes = {
    '0': {name: 'grass', path: 'naturalBlocks/grass.png', isMovable: true},
    '1': {name: 'coal', path: 'naturalBlocks/coal.png', isMovable: true},
    '2': {name: 'iron', path: 'naturalBlocks/iron.png', isMovable: true},
    '3': {name: 'copper', path: 'naturalBlocks/copper.png', isMovable: true},
    '4': {name: 'quartz', path: 'naturalBlocks/quartz.png', isMovable: true},
    '5': {name: 'bauxite', path: 'naturalBlocks/bauxite.png', isMovable: true},
    '6': {name: 'water', path: 'naturalBlocks/water.png', isMovable: false},
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
    return blockTypes[number.toString()];
}

export function getBlockTypeByName(name) {
    return blockTypesByName[name];
}