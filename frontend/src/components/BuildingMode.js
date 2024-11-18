import Phaser from 'phaser';
import { BLOCK_SIZE, CHUNK_SIZE, MAP_SIZE, RAND_SEED, SCREEN_HEIGHT, SCREEN_WIDTH } from '../utils/consts';
import { getDefaultMapChunk, getDefaultOreType } from '../utils/map';
import { getBlockType } from '../utils/getBlockType';
import { getBlockTypeByName, getBlockNumberByName, buildableBlocks } from '../utils/getBlockType';
import { generateChunkString, getMapCoordinates } from '../utils/utils';

export class BuildingMode {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
    
        this.isBuilding = false;
        this.selectedBlockType = null;
        this.previewSprite = null;
        this.previewRotation = 0;
        this.selectedBorder = null;
        this.bottomBarItems = [];

        this.createBuildToggleButton();
    }

    createBuildToggleButton() {
        const toggleButton = this.scene.add
        // Create a button to toggle building mode on right bottom corner with pencil-edit icon
        .image(SCREEN_WIDTH - 70, SCREEN_HEIGHT - 70, 'pencil-icon')
          .setInteractive()
          .on('pointerdown', () => {
            this.isBuilding = !this.isBuilding;
            if (this.isBuilding) {
                this.showBottomBar();
            } else {
                this.hideBottomBar();
                this.destroyPreview();
            }
          });

        // Set the button position to the bottom right corner
        // set size
        toggleButton.setScale(0.2);
    
        // Ensure the button is always on top
        toggleButton.setScrollFactor(0).setDepth(1003);
    }

    showBottomBar() {
        // Center the bottom bar
        const barWidth = SCREEN_WIDTH;
        const barHeight = 100;
        this.bottomBarContainer = this.scene.add.container(SCREEN_WIDTH / 2, SCREEN_HEIGHT - barHeight / 2)
            .setScrollFactor(0)
            .setDepth(1000);

        const background = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x444444);
        background.setOrigin(0.5);
        background.setScrollFactor(0);

        this.bottomBarContainer.add(background);

        const blockSize = BLOCK_SIZE;
        const padding = 10;
        const totalBlocks = Object.values(buildableBlocks).length;
        const totalWidth = totalBlocks * (blockSize + padding) - padding;
        let startX = -totalWidth / 2 + blockSize / 2;

        Object.values(buildableBlocks).forEach((block) => {
            const blockContainer = this.scene.add.container(startX, 0);
            blockContainer.setScrollFactor(0);

            const border = this.scene.add.rectangle(0, 0, blockSize + 10, blockSize + 10)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0.5)
                .setScrollFactor(0);

            const blockSprite = this.scene.add.image(0, 0, block.name)
                .setDisplaySize(blockSize, blockSize)
                .setInteractive()
                .setScrollFactor(0)
                .on('pointerdown', (pointer, localX, localY, event) => {
                    event.stopPropagation(); // Correctly prevent event propagation
                    this.selectBlock(block.name, border);
                });

            blockContainer.add([border, blockSprite]);
            this.bottomBarContainer.add(blockContainer);
            this.bottomBarItems.push({ blockName: block.name, border });

            startX += blockSize + padding;
        });
    }

    selectBlock(blockName, border) {
        this.selectedBlockType = blockName;

        // Reset previous border
        if (this.selectedBorder) {
            this.selectedBorder.setStrokeStyle(2, 0xffffff);
        }

        // Highlight new selection
        this.selectedBorder = border;
        this.selectedBorder.setStrokeStyle(2, 0x00ff00);

        const blockType = getBlockTypeByName(blockName);

        // If there's an existing preview, update it
        if (this.previewSprite) {
            this.previewSprite.setTexture(blockName);
            this.previewSprite.setRotation(0);
            this.previewSprite.setDisplaySize(blockType.displaySize ? blockType.displaySize : BLOCK_SIZE, blockType.displaySize ? blockType.displaySize : BLOCK_SIZE);
          
            this.previewRotation = 0;
        }
    }

    hideBottomBar() {
        if (this.bottomBarContainer) {
            this.bottomBarContainer.destroy();
            this.bottomBarContainer = null;
        }
        this.selectedBlockType = null;
        if (this.selectedBorder) {
            this.selectedBorder.setStrokeStyle(2, 0xffffff);
            this.selectedBorder = null;
        }
    }

    createRotateAndDoneButtons() {
        const offsetY = -50;

        if (!this.rotateButton) {
            this.rotateButton = this.scene.add.image(40, SCREEN_HEIGHT - 45, 'rotate-icon')
                .setInteractive()
                .setOrigin(0.5)
                .on('pointerdown', (pointer, localX, localY, event) => {
                    event.stopPropagation();
                    this.previewRotation = (this.previewRotation + 1) % 4;
                    this.previewSprite.setRotation(Phaser.Math.DegToRad(this.previewRotation * 90));
                })
                .setDepth(4001)
                .setScrollFactor(0);

            this.doneButton = this.scene.add.image(105, SCREEN_HEIGHT - 45, 'done-icon')
                .setInteractive()
                .setOrigin(0.5)
                .on('pointerdown', (pointer, localX, localY, event) => {
                    event.stopPropagation();
                    this.placeBlock(this.previewSprite.x, this.previewSprite.y);
                    this.destroyPreview();
                })
                .setDepth(4001)
                .setScrollFactor(0);
                // make the buttons smaller according to their heigts and screen size without changing the aspect ratio
                this.rotateButton.setScale(60 / this.rotateButton.height);
                this.doneButton.setScale(60 / this.doneButton.height);
        }
    }

    destroyPreview() {
        if (this.previewSprite) {
            this.previewSprite.destroy();
            this.previewSprite = null;
        }
        if (this.rotateButton) {
            this.rotateButton.destroy();
            this.rotateButton = null;
        }
        if (this.doneButton) {
            this.doneButton.destroy();
            this.doneButton = null;
        }
    }

    placeBlock(worldX, worldY) {
        const mapCoords = getMapCoordinates(worldX, worldY);
        const chunkX = Math.floor(mapCoords.x / CHUNK_SIZE);
        const chunkY = Math.floor(mapCoords.y / CHUNK_SIZE);
        const chunkString = generateChunkString(chunkX, chunkY);

        if (!this.scene.chunkData[chunkString] || !this.scene.chunkData[chunkString].data) {
            this.scene.chunkData[chunkString] = { data: getDefaultMapChunk(chunkX, chunkY) };
        }

        const blockNumber = getBlockNumberByName(this.selectedBlockType);
/*
        chunkData[localX][localY] = {
            blockType: blockNumber,
            direction: this.previewRotation,
        };

        if (this.scene.chunkRender[chunkString]) {
            this.scene.deleteChunk(chunkString, this.scene.chunkRender[chunkString]);
        }
        this.scene.renderChunk(chunkX, chunkY);
*/
        // Send block placement to server
        console.log("thisSelectedBlockType", blockNumber);
        if(blockNumber != null) this.scene.socket.emit('placeBlock', { x: mapCoords.x, y: mapCoords.y, blockType: blockNumber, direction: this.previewRotation });

    }
}