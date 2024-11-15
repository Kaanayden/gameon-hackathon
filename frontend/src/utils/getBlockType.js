
const blockTypes = {
    '0': 'grass',
    '1': 'coal',
    '2': 'iron',
    '3': 'copper',
    '4': 'quartz',
    '5': 'bauxite', 
    '6': 'water',
}

export function getBlockName(number) {
    return blockTypes[number.toString()];
}