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
    this.minimapSize = 600;
    this.areaSize = 5;

    // Interaction properties
    this.activePointers = {};
    this.moveThreshold = 15;

    this.createMinimap();
    this.setupMinimapToggle();
    this.createToggleButton();
  }

  createMinimap() {
    // Create a container for the minimap
    this.minimapContainer = this.scene.add
      .container(
        this.scene.cameras.main.width / 2 - this.minimapSize / 2,
        this.scene.cameras.main.height / 2 - this.minimapSize / 2
      )
      .setDepth(1000)
      .setScrollFactor(0);

    // Create a container for the minimap content
    this.minimapContentContainer = this.scene.add.container(0, 0);

    // Background rectangle
    const minimapBg = this.scene.add
      .rectangle(0, 0, this.minimapSize, this.minimapSize, 0x000000, 0.5)
      .setOrigin(0, 0);
    this.minimapContentContainer.add(minimapBg);

    // Initialize minimapGraphics
    this.minimapGraphics = this.scene.add.graphics().setDepth(1001).setScrollFactor(0);
    this.minimapContentContainer.add(this.minimapGraphics);

    // Border for the minimap
    const minimapBorder = this.scene.add.graphics();
    minimapBorder.lineStyle(2, 0xffffff, 1);
    minimapBorder.strokeRect(0, 0, this.minimapSize, this.minimapSize);
    this.minimapContentContainer.add(minimapBorder);

    // Add the content container to the main minimap container
    this.minimapContainer.add(this.minimapContentContainer);

    // Close button
    const closeButton = this.scene.add
      .text(this.minimapSize - 20, 0, 'X', { fontSize: '16px', fill: '#ff0000' })
      .setInteractive()
      .on('pointerdown', () => {
        this.minimapVisible = false;
        this.minimapContainer.setVisible(this.minimapVisible);
      });
    this.minimapContainer.add(closeButton);

    // Initially hide the minimap
    this.minimapContainer.setVisible(this.minimapVisible);

    // Enable interaction for dragging, zooming, and teleportation
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
        const areaData = this.getAreaData(areaX, areaY);

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

  getAreaData(areaX, areaY) {
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
    // Enable multi-touch
    this.scene.input.addPointer(2);

    this.minimapContainer
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.minimapSize, this.minimapSize),
        Phaser.Geom.Rectangle.Contains
      )
      .on('pointerdown', (pointer) => {
        this.activePointers[pointer.id] = {
          startX: pointer.x,
          startY: pointer.y,
          prevX: pointer.x,
          prevY: pointer.y,
          totalDeltaX: 0,
          totalDeltaY: 0,
        };

        // If two pointers are down, store initial pinch data
        const pointerIds = Object.keys(this.activePointers);
        if (pointerIds.length === 2) {
          const pointerId1 = pointerIds[0];
          const pointerId2 = pointerIds[1];

          const p1 = this.activePointers[pointerId1];
          const p2 = this.activePointers[pointerId2];

          // Initial distance between pointers
          const dx = p2.startX - p1.startX;
          const dy = p2.startY - p1.startY;
          this.initialPinchDistance = Math.sqrt(dx * dx + dy * dy);

          // Initial center point between pointers
          this.initialPinchCenter = {
            x: (p1.startX + p2.startX) / 2,
            y: (p1.startY + p2.startY) / 2,
          };

          // Store initial scale
          this.initialMinimapScale = this.minimapScale;
        }
      })
      .on('pointermove', (pointer) => {
        const p = this.activePointers[pointer.id];
        if (p) {
          const deltaX = pointer.x - p.prevX;
          const deltaY = pointer.y - p.prevY;

          p.totalDeltaX += Math.abs(deltaX);
          p.totalDeltaY += Math.abs(deltaY);

          p.prevX = pointer.x;
          p.prevY = pointer.y;

          const pointerIds = Object.keys(this.activePointers);

          if (pointerIds.length === 2) {
            // Handle pinch to zoom
            const pointerId1 = pointerIds[0];
            const pointerId2 = pointerIds[1];

            const p1 = this.activePointers[pointerId1];
            const p2 = this.activePointers[pointerId2];

            const currentDistance = Phaser.Math.Distance.Between(
              p1.prevX,
              p1.prevY,
              p2.prevX,
              p2.prevY
            );

            const zoomFactor = currentDistance / this.initialPinchDistance;
            const newScale = Phaser.Math.Clamp(
              this.initialMinimapScale * zoomFactor,
              0.5,
              3
            );

            // Calculate the center point between the two pointers
            const currentPinchCenter = {
              x: (p1.prevX + p2.prevX) / 2,
              y: (p1.prevY + p2.prevY) / 2,
            };

            // Convert the pinch center to local coordinates relative to minimapContentContainer
            const localPinchCenterBeforeZoom = {
              x:
                (currentPinchCenter.x -
                  this.minimapContainer.x -
                  this.minimapContentContainer.x) /
                this.minimapScale,
              y:
                (currentPinchCenter.y -
                  this.minimapContainer.y -
                  this.minimapContentContainer.y) /
                this.minimapScale,
            };

            // Update the scale
            this.minimapScale = newScale;
            this.minimapContentContainer.setScale(this.minimapScale);

            // After scaling, calculate where the local pinch center is now
            const localPinchCenterAfterZoom = {
              x: localPinchCenterBeforeZoom.x * this.minimapScale,
              y: localPinchCenterBeforeZoom.y * this.minimapScale,
            };

            // Calculate the difference between where the pinch center is now and where it should be
            const deltaXContainer =
              currentPinchCenter.x -
              this.minimapContainer.x -
              (this.minimapContentContainer.x + localPinchCenterAfterZoom.x);
            const deltaYContainer =
              currentPinchCenter.y -
              this.minimapContainer.y -
              (this.minimapContentContainer.y + localPinchCenterAfterZoom.y);

            // Adjust the minimapContentContainer position
            this.minimapContentContainer.x += deltaXContainer;
            this.minimapContentContainer.y += deltaYContainer;

            // Update initialPinchDistance and initialMinimapScale for next move
            this.initialPinchDistance = currentDistance;
            this.initialMinimapScale = this.minimapScale;
          } else if (pointerIds.length === 1) {
            // Handle pan
            if (p.totalDeltaX + p.totalDeltaY > this.moveThreshold) {
              this.minimapContentContainer.x += deltaX;
              this.minimapContentContainer.y += deltaY;

              // Update start positions for next move
              p.startX = p.prevX;
              p.startY = p.prevY;
            }
          }
        }
      })
      .on('pointerup', (pointer) => {
        const p = this.activePointers[pointer.id];
        if (p) {
          const totalMovement = p.totalDeltaX + p.totalDeltaY;

          delete this.activePointers[pointer.id];

          const numActivePointers = Object.keys(this.activePointers).length;

          if (numActivePointers < 2) {
            // Reset initial pinch data
            this.initialPinchDistance = null;
            this.initialMinimapScale = null;
          }

          if (totalMovement < this.moveThreshold && numActivePointers === 0) {
            // Consider it a tap
            const localX =
              (pointer.x -
                this.minimapContainer.x -
                this.minimapContentContainer.x) /
              this.minimapScale;
            const localY =
              (pointer.y -
                this.minimapContainer.y -
                this.minimapContentContainer.y) /
              this.minimapScale;

            const mapX = (localX / this.minimapSize) * MAP_SIZE * BLOCK_SIZE;
            const mapY = (localY / this.minimapSize) * MAP_SIZE * BLOCK_SIZE;

            const worldX = localX / this.minimapSize * MAP_SIZE;
            const worldY = localY / this.minimapSize * MAP_SIZE;

            // Teleport the player if it is movable
            console.log("block", worldX, worldY, getBlockType(getDefaultOreType(mapX, mapY, RAND_SEED)))
            if(getBlockType(getDefaultOreType(worldX, worldY)).isMovable) {
           
                this.player.setPosition(mapX, mapY);
            }
            // Update the camera position
            this.scene.cameras.main.startFollow(this.player);
          }
        }
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
    const toggleButton = this.scene.add
      .text(10, 10, 'Toggle Minimap', { fontSize: '16px', fill: '#ffffff' })
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
    this.minimapContentContainer.setScale(this.minimapScale);
  }

  zoomOutMinimap() {
    this.minimapScale /= 1.2;
    this.minimapContentContainer.setScale(this.minimapScale);
  }
}