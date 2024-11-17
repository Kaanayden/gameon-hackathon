import Phaser from 'phaser';
import { BLOCK_SIZE, MAP_SIZE, RAND_SEED } from '../utils/consts';
import { getDefaultOreType } from '../utils/map';
import { getBlockType } from '../utils/getBlockType';

export class Minimap {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    // Minimap properties
    this.minimapVisible = false;
    this.minimapScale = 1;
    this.minimapSize = 600; // Increased size (200 * 3)
    this.areaSize = 10;

    this.createMinimap();
    this.setupMinimapToggle();
    this.createToggleButton();
  }

  createMinimap() {
    // Create a container for the minimap
    this.minimapContainer = this.scene.add
      .container(this.scene.cameras.main.width / 2 - this.minimapSize / 2, this.scene.cameras.main.height / 2 - this.minimapSize / 2)
      .setDepth(1000)
      .setScrollFactor(0);

    // Background rectangle
    const minimapBg = this.scene.add
      .rectangle(0, 0, this.minimapSize, this.minimapSize, 0x000000, 0.5)
      .setOrigin(0, 0);
    this.minimapContainer.add(minimapBg);

    // Border for the minimap
    const minimapBorder = this.scene.add.graphics();
    minimapBorder.lineStyle(2, 0xffffff, 1);
    minimapBorder.strokeRect(0, 0, this.minimapSize, this.minimapSize);
    this.minimapContainer.add(minimapBorder);

    // Initialize minimapGraphics
    this.minimapGraphics = this.scene.add.graphics()
      .setDepth(1001)
      .setScrollFactor(0);
    this.minimapContainer.add(this.minimapGraphics);

    // Close button
    const closeButton = this.scene.add.text(this.minimapSize - 20, 0, 'X', { fontSize: '16px', fill: '#ff0000' })
      .setInteractive()
      .on('pointerdown', () => {
        this.minimapVisible = false;
        this.minimapContainer.setVisible(this.minimapVisible);
      });
    this.minimapContainer.add(closeButton);

    // Initially hide the minimap
    this.minimapContainer.setVisible(this.minimapVisible);

    // Enable interaction for teleportation
    this.enableMinimapInteraction();

    // Render the minimap content
    this.renderMinimapContent();
  }

  renderMinimapContent() {
    const graphics = this.minimapGraphics;
    graphics.clear();

    const numAreasX = Math.ceil(MAP_SIZE / this.areaSize);
    const numAreasY = Math.ceil(MAP_SIZE / this.areaSize);

    const scaleX = this.minimapSize / MAP_SIZE;
    const scaleY = this.minimapSize / MAP_SIZE;

    // Loop through the map areas
    for (let y = 0; y < numAreasY; y++) {
      for (let x = 0; x < numAreasX; x++) {
        const areaX = x * this.areaSize;
        const areaY = y * this.areaSize;

        // Get data for this area
        const areaData = this.getAreaData(areaX, areaY, this.areaSize);

        // Determine color based on areaData
        const color = this.getColorForArea(areaData);

        // Draw the area
        graphics.fillStyle(color, 1);
        graphics.fillRect(
          areaX * scaleX,
          areaY * scaleY,
          this.areaSize * scaleX,
          this.areaSize * scaleY
        );
      }
    }

    // Draw player position
    this.drawPlayerOnMinimap(scaleX, scaleY);
  }

  getAreaData(areaX, areaY, areaSize) {
    const blockTypeNumber = getDefaultOreType(areaX, areaY, RAND_SEED);
    const blockType = getBlockType(blockTypeNumber);
    return blockType.name;
  }

  getColorForArea(areaData) {
    const terrainColors = {
      grass: 0x32691a,
      coal: 0x4b4b4b,
      iron: 0xb87333,
      copper: 0xb87333,
      quartz: 0xffffff,
      bauxite: 0xffe4c4,
      water: 0x0000ff,
    };
    return terrainColors[areaData] || 0xffffff;
  }

  drawPlayerOnMinimap(scaleX, scaleY) {
    const graphics = this.minimapGraphics;

    const playerX = (this.player.x / BLOCK_SIZE) * scaleX;
    const playerY = (this.player.y / BLOCK_SIZE) * scaleY;

    graphics.fillStyle(0xff0000, 1); // Red color for the player
    graphics.fillCircle(playerX, playerY, 3); // Small circle
  }

  updateMinimapPlayerPosition() {
    // Re-render the minimap content
    this.renderMinimapContent();
  }

  enableMinimapInteraction() {
    this.minimapContainer
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.minimapSize, this.minimapSize),
        Phaser.Geom.Rectangle.Contains
      )
      .on('pointerdown', (pointer) => {
        const localX = pointer.x - this.minimapContainer.x;
        const localY = pointer.y - this.minimapContainer.y;

        const mapX = (localX / this.minimapSize) * MAP_SIZE * BLOCK_SIZE;
        const mapY = (localY / this.minimapSize) * MAP_SIZE * BLOCK_SIZE;

        // Teleport the player
        this.player.setPosition(mapX, mapY);

        // Update the camera position
        this.scene.cameras.main.startFollow(this.player);
      });
  }

  setupMinimapToggle() {
    this.scene.input.keyboard.on('keydown-M', () => {
      this.minimapVisible = !this.minimapVisible;
      this.minimapContainer.setVisible(this.minimapVisible);
    });
  }

  createToggleButton() {
    // Create a button for toggling the minimap on mobile
    const toggleButton = this.scene.add.text(10, 10, 'Toggle Minimap', { fontSize: '16px', fill: '#ffffff' })
      .setInteractive()
      .on('pointerdown', () => {
        this.minimapVisible = !this.minimapVisible;
        this.minimapContainer.setVisible(this.minimapVisible);
      });

    // Ensure the button is always on top
    toggleButton.setScrollFactor(0).setDepth(1001);
  }

  zoomInMinimap() {
    this.minimapScale *= 1.2;
    this.minimapContainer.setScale(this.minimapScale);
  }

  zoomOutMinimap() {
    this.minimapScale /= 1.2;
    this.minimapContainer.setScale(this.minimapScale);
  }
}