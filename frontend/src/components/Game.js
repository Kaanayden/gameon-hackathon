import React, { useEffect, useRef } from 'react';
import { AUTO, Input, Game } from 'phaser';

const GameComponent = () => {
  const gameRef = useRef(null);

  // Configuration functions
  const createGameConfig = (scene) => ({
    type: AUTO,
    width: 800,
    height: 600,
    parent: gameRef.current,
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scene,
  });

  // Scene-specific functions
  const loadAssets = function() {
    this.load.image('grass', '/assets/grass.png');
    this.load.spritesheet('guy', '/assets/guy.png', { frameWidth: 16, frameHeight: 24 });
  };

  const createAnimations = function() {
    const animationConfigs = [
      { key: 'walkUp', start: 12, end: 15 },
      { key: 'walkDown', start: 0, end: 3 },
      { key: 'walkLeft', start: 8, end: 11 },
      { key: 'walkRight', start: 4, end: 7 },
    ];

    animationConfigs.forEach(({ key, start, end }) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers('guy', { start, end }),
        frameRate: 8,
        repeat: -1
      });
    });
  };

  const createTileGrid = function(hoverText, selectText) {
    const tileSize = 32;
    const mapWidth = 25;
    const mapHeight = 19;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = this.add
          .sprite(x * tileSize, y * tileSize, 'grass')
          .setOrigin(0, 0)
          .setInteractive();

        tile.on('pointerover', () => {
          tile.setTint(0xaaaaaa);
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
    return { mapWidth, mapHeight, tileSize };
  };

  const setupPlayer = function(mapWidth, mapHeight, tileSize) {
    this.player = this.physics.add
      .sprite((mapWidth / 2) * tileSize, (mapHeight / 2) * tileSize, 'guy', 0)
      .setCollideWorldBounds(true)
      .setScale(3);
  };

  const setupCamera = function(mapWidth, mapHeight, tileSize) {
    this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
    this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
    this.cameras.main.startFollow(this.player);
  };

  const handlePlayerMovement = function(player, keys, speed = 160) {
    player.setVelocity(0);
    let isWalking = false;

    if (keys.W.isDown) {
      player.setVelocityY(-speed);
      player.anims.play('walkUp', true);
      isWalking = true;
    } else if (keys.S.isDown) {
      player.setVelocityY(speed);
      player.anims.play('walkDown', true);
      isWalking = true;
    }

    if (keys.A.isDown) {
      player.setVelocityX(-speed);
      if (!isWalking) player.anims.play('walkLeft', true);
      isWalking = true;
    } else if (keys.D.isDown) {
      player.setVelocityX(speed);
      if (!isWalking) player.anims.play('walkRight', true);
      isWalking = true;
    }

    if (!isWalking) {
      player.anims.stop();
      player.setFrame(0);
    }
  };

  // Main scene functions
  const preload = function() {
    loadAssets.call(this);
  };

  const create = function() {
    const hoverText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);
    const selectText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);

    const { mapWidth, mapHeight, tileSize } = createTileGrid.call(this, hoverText, selectText);
    createAnimations.call(this);
    setupPlayer.call(this, mapWidth, mapHeight, tileSize);
    setupCamera.call(this, mapWidth, mapHeight, tileSize);

    this.keys = this.input.keyboard.addKeys({
      W: Input.Keyboard.KeyCodes.W,
      A: Input.Keyboard.KeyCodes.A,
      S: Input.Keyboard.KeyCodes.S,
      D: Input.Keyboard.KeyCodes.D,
    });
  };

  const update = function() {
    handlePlayerMovement(this.player, this.keys);
  };

  useEffect(() => {
    let game;

    if (typeof window !== 'undefined') {
      const config = createGameConfig({ preload, create, update });
      game = new Game(config);
    }

    return () => {
      if (game) game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};

export default GameComponent;