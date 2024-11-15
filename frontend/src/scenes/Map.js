import { Scene } from 'phaser';
import { AUTO, Input, Game } from 'phaser';
import { BLOCK_SIZE, CHUNK_SIZE, MAP_SIZE, RAND_SEED } from '../utils/consts';
import { generateChunkString, getGameCoordinates, getMapCoordinates } from '../utils/utils';
import { getDefaultMapChunk } from '../utils/map';
import { getBlockName } from '../utils/getBlockType';

export class Map extends Scene {


    constructor ()
    {
        super('Map');
        this.chunkRender = {}; // { '0-s-0': {shouldStay: false, group: PhaserGroup}, }
        this.chunkData = {}; // { '0-s-0': {data: [][]}, }
   
    }


  // Scene-specific functions
    loadAssets = function() {

  };

  renderChunk = function( chunkX, chunkY) {

    const startX = chunkX * CHUNK_SIZE;
    const startY = chunkY * CHUNK_SIZE;

    const chunkGroup = this.add.group({
        classType: Phaser.GameObjects.Sprite,
    });

    const chunkData = getDefaultMapChunk(chunkX, chunkY);

    for (let ty = 0; ty < CHUNK_SIZE; ty++) {
      for (let tx = 0; tx < CHUNK_SIZE; tx++) {

        const worldX = startX + tx;
        const worldY = startY + ty;
        const spriteKey = getBlockName(chunkData[tx][ty]);

        const gameCoordinates = getGameCoordinates(worldX, worldY);
        const tile = this.add.sprite(gameCoordinates.x, gameCoordinates.y, spriteKey)
        .setOrigin(0, 0);
        
        chunkGroup.add(tile);
      }
    }

    const chunkString = generateChunkString(chunkX, chunkY);
    this.chunkRender[chunkString] = {
        group: chunkGroup,
        shouldStay: true
    };
  }

  renderChunks = function(x, y) {
    
    const maxChunkNumber = Math.floor(MAP_SIZE / CHUNK_SIZE);

    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkY = Math.floor(y / CHUNK_SIZE);

    Object.values(this.chunkRender).forEach((value) => {
        value.shouldStay = false;
    });

    for(let ty = -1; ty <= 1; ty++) {
        for(let tx = -1; tx <= 1; tx++) {
            const currX = chunkX + tx;
            const currY = chunkY + ty;
            if(currX < 0 || currY < 0 || currX >= maxChunkNumber || currY >= maxChunkNumber ) {
                continue;
            } else {

            }
            const chunkString = generateChunkString(currX, currY);
            if(!this.chunkRender[chunkString]) {
                console.log('Rendering chunk', currX, currY);
                this.renderChunk(currX, currY);
            } else {
                this.chunkRender[chunkString].shouldStay = true;
            }
        }
    }

    // Remove chunks that are not one of the 9 chunks around the player
    Object.entries(this.chunkRender).forEach(([key, value]) => {
        if(!value.shouldStay) {
            value.group.destroy();
            delete this.chunkRender[key];
        }
    });



  }

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
      .sprite((MAP_SIZE / 2), (MAP_SIZE / 2), 'guy', 0)
      .setCollideWorldBounds(true)
      .setScale(3)
      .setDepth(2);
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

    //this.createTileGrid(hoverText, selectText);
    this.createAnimations();
    this.setupPlayer();
    this.setupCamera();

    this.debugInit();

    this.keys = this.input.keyboard.addKeys({
      W: Input.Keyboard.KeyCodes.W,
      A: Input.Keyboard.KeyCodes.A,
      S: Input.Keyboard.KeyCodes.S,
      D: Input.Keyboard.KeyCodes.D,
    });
  };

debugInit = function() {
    this.fpsText = this.add.text(10, 50, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);
}

  debug = function() {
     this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
}

   update = function() {
    this.handlePlayerMovement(this.player, this.keys);
    const mapCoordinates = getMapCoordinates(this.player.x, this.player.y);
    this.renderChunks(mapCoordinates.x, mapCoordinates.y);
    this.debug();
  };



};


