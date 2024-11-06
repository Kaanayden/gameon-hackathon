"use client";

// components/GameComponent.js
import React, { useEffect, useRef } from 'react';
import {AUTO, Input ,Game } from 'phaser';

const GameComponent = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    let game;

    if (typeof window !== 'undefined') {

    const config = {
      type: AUTO,
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
      this.load.spritesheet('guy', '/assets/guy.png', { frameWidth: 16, frameHeight: 24 }); // Specify frame dimensions
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
        .sprite((mapWidth / 2) * tileSize, (mapHeight / 2) * tileSize, 'guy', 0)
        .setCollideWorldBounds(true)
        .setScale(3)

      // Create an animation from the spritesheet
      this.anims.create({
        key: 'walkUp',
        frames: this.anims.generateFrameNumbers('guy', { start: 12, end: 15 }), // Adjust start and end based on your spritesheet
        frameRate: 8,
        repeat: -1
      });

            // Create an animation from the spritesheet
            this.anims.create({
                key: 'walkDown',
                frames: this.anims.generateFrameNumbers('guy', { start: 0, end: 3 }), // Adjust start and end based on your spritesheet
                frameRate: 8,
                repeat: -1
              });

              this.anims.create({
                key: 'walkLeft',
                frames: this.anims.generateFrameNumbers('guy', { start: 8, end: 11 }), // Adjust start and end based on your spritesheet
                frameRate: 8,
                repeat: -1
              });

                this.anims.create({
                    key: 'walkRight',
                    frames: this.anims.generateFrameNumbers('guy', { start: 4, end: 7 }), // Adjust start and end based on your spritesheet
                    frameRate: 8,
                    repeat: -1
                  });


      // Set camera and world bounds
      this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
      this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

      // Make the camera follow the player
      this.cameras.main.startFollow(this.player);

      // Set up WASD keys
      this.keys = this.input.keyboard.addKeys({
        W: Input.Keyboard.KeyCodes.W,
        A: Input.Keyboard.KeyCodes.A,
        S: Input.Keyboard.KeyCodes.S,
        D: Input.Keyboard.KeyCodes.D,
      });
    }

    function update() {
      const speed = 160;
      const keys = this.keys;
      const player = this.player;

      player.setVelocity(0);

        let isWalking = false;


      if (keys.W.isDown) {
        player.setVelocityY(-speed);
        isWalking = true;
              // Play the animation
                player.anims.play('walkUp', true);

      } else if (keys.S.isDown) {
        isWalking = true;
        player.setVelocityY(speed);
                // Play the animation
                    player.anims.play('walkDown', true)
      }

      if (keys.A.isDown) {
        player.setVelocityX(-speed);
        if(!isWalking) player.anims.play('walkLeft', true);
        isWalking = true;
        // Play the animation
      } else if (keys.D.isDown) {
        player.setVelocityX(speed);

        if(!isWalking) player.anims.play('walkRight', true);

        isWalking = true;
        // Play the animation

      }


        if (!isWalking) {
            player.anims.stop(); 
            player.setFrame(0);
        }

    }



    if (typeof window !== 'undefined') {
      game = new Game(config);
    }
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