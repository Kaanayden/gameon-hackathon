import { Scene } from 'phaser';
import { AUTO, Input, Game } from 'phaser';
import { BLOCK_SIZE, MAP_SIZE } from '../utils/consts';

export class Map extends Scene {


    constructor ()
    {
        super('Map');
    }


  // Scene-specific functions
    loadAssets = function() {
    this.load.image('grass', '/assets/grass.png');
    this.load.spritesheet('guy', '/assets/guy.png', { frameWidth: 16, frameHeight: 24 });
  };

   createAnimations = function() {
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

   createTileGrid = function(hoverText, selectText) {
    const tileSize = BLOCK_SIZE;

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
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
  };

   setupPlayer = function() {
    this.player = this.physics.add
      .sprite((MAP_SIZE / 2) * BLOCK_SIZE, (MAP_SIZE / 2) * BLOCK_SIZE, 'guy', 0)
      .setCollideWorldBounds(false)
      .setScale(3);
  };

   setupCamera = function() {
    this.cameras.main.setBounds(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
    this.physics.world.setBounds(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
    this.cameras.main.startFollow(this.player);
  };

   handlePlayerMovement = function(player, keys, speed = 160) {
    player.setVelocity(0);
    let isWalking = false;
    let moveDirection = [0, 0];

    if (keys.W.isDown) {
      player.anims.play('walkUp', true);
      isWalking = true;
    moveDirection[1] = -1;
    } else if (keys.S.isDown) {
      player.anims.play('walkDown', true);
      isWalking = true;
    moveDirection[1] = 1;
    }


    if (keys.A.isDown) {
      if (!isWalking) player.anims.play('walkLeft', true);
      isWalking = true;
      moveDirection[0] = -1;
    } else if (keys.D.isDown) {
      if (!isWalking) player.anims.play('walkRight', true);
      isWalking = true;
        moveDirection[0] = 1;
    }

    if (moveDirection[0] != 0 && moveDirection[1] != 0) {
        player.setVelocityX(speed * moveDirection[0] * Math.SQRT1_2);
        player.setVelocityY(speed * moveDirection[1] * Math.SQRT1_2);
    } else {
        player.setVelocityX(speed * moveDirection[0]);
        player.setVelocityY(speed * moveDirection[1]);
    }

    if (!isWalking) {
      player.anims.stop();
      player.setFrame(0);
    }
  };

  // Main scene functions
   preload = function() {
    this.loadAssets()
  };

   create = function() {
    const hoverText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);
    const selectText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);

    this.createTileGrid(hoverText, selectText);
    this.createAnimations();
    this.setupPlayer();
    this.setupCamera();

    this.keys = this.input.keyboard.addKeys({
      W: Input.Keyboard.KeyCodes.W,
      A: Input.Keyboard.KeyCodes.A,
      S: Input.Keyboard.KeyCodes.S,
      D: Input.Keyboard.KeyCodes.D,
    });
  };

   update = function() {
    this.handlePlayerMovement(this.player, this.keys);
  };



};


