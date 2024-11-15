import { BLOCK_SIZE, CHUNK_SIZE } from "./consts";

// gets global coordinates to chunk
export function generateChunkStringFromPoint(x, y) {
    return `${Math.floor(x / CHUNK_SIZE)}-s-${Math.floor(y / CHUNK_SIZE)}`;
}

export function generateChunkString(x, y) {
    return `${x}-s-${y}`;
}

export function getMapCoordinates (x, y) {
    return {x: Math.floor(x / BLOCK_SIZE), y: Math.floor(y / BLOCK_SIZE)};
}

export function getMapCoordinatesPosition (position) {
    return {x: Math.floor(position.x / BLOCK_SIZE), y: Math.floor(position.y / BLOCK_SIZE)};
}

export function getGameCoordinates (x, y) {
    return {x: Math.floor(x * BLOCK_SIZE), y: Math.floor(y * BLOCK_SIZE)};
}

export function getGameCoordinatesPosition (position) {
    return {x: Math.floor(position.x * BLOCK_SIZE), y: Math.floor(position.y * BLOCK_SIZE)};
}