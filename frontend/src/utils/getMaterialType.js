const oresArray = [
    { name: 'coal', path: 'ores/coal.png', isOre: true, oreBlock: '1', },
    { name: 'iron', path: 'ores/iron.png', isOre: true, oreBlock: '2', },
    { name: 'copper', path: 'ores/copper.png', isOre: true, oreBlock: '3', },
    { name: 'quartz', path: 'ores/quartz.png', isOre: true, oreBlock: '4', },
    { name: 'bauxite', path: 'ores/bauxite.png', isOre: true, oreBlock: '5', },
]

const materialsArray = [
    ...oresArray,
];

export const materials = {};
materialsArray.forEach((ore) => {
    materials[ore.name] = ore;
});


export function getMaterialType(name) {
    return materials[name];
}

