import Phaser from 'phaser';
import { BLOCK_SIZE, MAP_SIZE, RAND_SEED, SCREEN_HEIGHT, SCREEN_WIDTH } from '../utils/consts';
import { getDefaultOreType } from '../utils/map';
import { getBlockType } from '../utils/getBlockType';



export class BuildingMode {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
    
        // Minimap properties
        this.isBuilding = false;
    
        this.createBuildToggleButton();
      }

      createBuildToggleButton() {
        const toggleButton = this.scene.add
        // Create a button to toggle building mode on right bottom corner with pencil-edit icon
        .image(SCREEN_WIDTH - 70, SCREEN_HEIGHT - 70, 'pencil-icon')
          .setInteractive()
          .on('pointerdown', () => {
            this.minimapVisible = !this.minimapVisible;
            this.minimapContainer.setVisible(this.minimapVisible);
            this.scene.events.emit('minimapVisibilityChanged', this.minimapVisible);
          });

        // Set the button position to the bottom right corner
        // set size
        toggleButton.setScale(0.2);
    
        // Ensure the button is always on top
        toggleButton.setScrollFactor(0).setDepth(1003);
      }
    

}