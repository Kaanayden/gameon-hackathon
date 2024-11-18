import Phaser from 'phaser';
import { BLOCK_SIZE, MAP_SIZE, RAND_SEED } from '../utils/consts';
import { getDefaultOreType } from '../utils/map';
import { getBlockType } from '../utils/getBlockType';



export class BuildingMode {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
    
        // Minimap properties
        this.isBuilding = false;
    
        this.createMinimap();
        this.setupMinimapToggle();
        this.createToggleButton();
      }

      createToggleButton() {
        // Create a button for toggling the minimap on mobile
        const toggleButton = this.scene.add
          .text(10, 10, 'Toggle Minimap', { fontSize: '16px', fill: '#ffffff' })
          .setInteractive()
          .on('pointerdown', () => {
            this.minimapVisible = !this.minimapVisible;
            this.minimapContainer.setVisible(this.minimapVisible);
            this.scene.events.emit('minimapVisibilityChanged', this.minimapVisible);
          });
    
        // Ensure the button is always on top
        toggleButton.setScrollFactor(0).setDepth(1003);
      }
    

}