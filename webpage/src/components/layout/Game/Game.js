"use client";

// components/GameComponent.js
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const GameComponent = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    let game;

    const config = {
      type: Phaser.AUTO,
      width: 800, // Adjust as needed
      height: 600, // Adjust as needed
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    function preload() {
      // Load assets here
      this.load.image('grass', '/assets/grass.png'); // Ensure the path is correct
      this.load.spritesheet('characters', '/assets/characters.gif', { frameWidth: 16, frameHeight: 24 }); // Specify frame dimensions
    }

    function create() {
      const tileSize = 32;
      const mapWidth = 25; // Number of tiles horizontally
      const mapHeight = 19; // Number of tiles vertically

      // Create texts for coordinate display
      const hoverText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);
      const selectText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);

      // Create the grid of tiles
      for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
          const tile = this.add
            .sprite(x * tileSize, y * tileSize, 'grass')
            .setOrigin(0, 0)
            .setInteractive();

          tile.on('pointerover', () => {
            tile.setTint(0xaaaaaa); // Hover effect
            hoverText.setText(`Hover: (${x}, ${y})`);
          });

          tile.on('pointerout', () => {
            tile.clearTint();
            hoverText.setText('');
          });

          tile.on('pointerdown', () => {
            selectText.setText(`Selected: (${x}, ${y})`);
          });
        }
      }

      // Create the player character
      this.player = this.physics.add
        .sprite((mapWidth / 2) * tileSize, (mapHeight / 2) * tileSize, 'characters', 4)
        .setCollideWorldBounds(true)
        .setScale(3)

      // Create an animation from the spritesheet
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('characters', { start: 0, end: 4 }), // Adjust start and end based on your spritesheet
        frameRate: 10,
        repeat: -1
      });

      // Play the animation
      this.player.anims.play('walk');

      // Set camera and world bounds
      this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
      this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

      // Make the camera follow the player
      this.cameras.main.startFollow(this.player);

      // Set up WASD keys
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      });
    }

    function update() {
      const speed = 160;
      const keys = this.keys;
      const player = this.player;

      player.setVelocity(0);

      if (keys.A.isDown) {
        player.setVelocityX(-speed);
      } else if (keys.D.isDown) {
        player.setVelocityX(speed);
      }

      if (keys.W.isDown) {
        player.setVelocityY(-speed);
      } else if (keys.S.isDown) {
        player.setVelocityY(speed);
      }
    }

    if (typeof window !== 'undefined') {
      game = new Phaser.Game(config);
    }

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, []);

  return <div ref={gameRef} />;
};

export default GameComponent;