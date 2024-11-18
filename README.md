# Machina Flow

## Overview

Welcome to our blockchain-based casual factory game! This game is built using Phaser.js, TON and AEON technologies and is targeted for mobile devices. Players can manage and expand their own plots of land, mine ores, and create complex items. The entire map is available for purchase, and players can buy and sell plots of land and assets on a marketplace.

## Features

- **Large Map**: Explore a vast map where players can only modify their own plots.
- **Random Ores**: Discover randomly placed ores throughout the map.
- **Plots of Land**: Purchase and expand your plots of land as NFTs.
- **Avatars**: Move your avatar around the map to interact with the environment.
- **Marketplace**: Buy and sell plots of land and assets.
- **Assets**: Mine ores, create complex items, and manage logistics with various blocks.

## Gameplay

### Plots of Land

- Players can expand their plots by purchasing additional land as NFTs.
- Players can place various blocks on their plots to manage resources and production.

### Assets

- **Ores**: The basic exportable assets that can be mined from the ground.
- **Complex Items**: Created by combining ores or other items. These items are not placeable on the map but move on conveyor belts and are produced over time.

### Blocks

- **Logistics Blocks**: Conveyor belts, separators, mergers, etc. These blocks may require resources to build, except for conveyor belts.
- **Process Blocks**: Production, exporter, storage blocks that manipulate assets. These blocks combine items to create complex items over time.
- **Decoration Blocks**: Purely aesthetic blocks that add flair to your plot. Their rarity is important.

### Marketplace

- All assets can be sold on the marketplace.
- Items are crafted through processing and can be instantly produced from a recipe book.

### Process Blocks

- Process blocks like chests allow for item combination, enabling collaboration between players.

## Questions

- **Can players expand their plots?** Yes, if they purchase them as NFTs.
- **What can players place on their plots?** Blocks.
- **Is the entire map for sale?** Yes.
- **Can players buy each other's plots?** Yes, if the owner puts them up for sale.
- **What happens to assets on a plot when it's sold?** They go to the inventory or disappear based on the sale conditions.

## Asset Types

- **Ores**: Basic exportable assets mined from the ground.
- **Complex Items**: Created by combining ores or items, not placeable on the map, move on conveyor belts, and produced over time.

## Blocks

- **Logistics Blocks**: Conveyor belts, separators, mergers, etc.
- **Process Blocks**: Production, exporter, storage blocks that manipulate assets.
- **Decoration Blocks**: Aesthetic blocks with rarity.

## Development

### Project Structure

- **Frontend**: Built with Phaser.js, includes scenes, components, and utilities.
- **Blockchain**: TON, Smart contracts and wrappers for managing NFTs and transactions. AEON is used for payment integration.
- **Server**: Handles socket connections, map generation, and database interactions.

### Future Work
We have designed our game but not all the features are implemented yet. We will continue to develop the game.
