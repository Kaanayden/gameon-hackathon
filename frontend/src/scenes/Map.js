import { Scene } from 'phaser';
import { AUTO, Input, Game } from 'phaser';
import { BLOCK_SIZE, CHUNK_SIZE, MAP_SIZE, MAX_WALK_FRAMES_PER_SECOND, RAND_SEED } from '../utils/consts';
import { generateChunkString, getGameCoordinates, getMapCoordinates } from '../utils/utils';
import { getDefaultMapChunk } from '../utils/map';
import { getBlockName, getBlockType, getBlockTypeByName } from '../utils/getBlockType';


export class Map extends Scene {


    constructor() {
        super('Map');
        this.chunkRender = {}; // { '0-s-0': {shouldStay: false, group: PhaserGroup}, }
        this.chunkData = {}; // { '0-s-0': {data: [][]}, }

    }


    // Scene-specific functions
    loadAssets = function () {

    };

    renderChunk = function (chunkX, chunkY) {

        const startX = chunkX * CHUNK_SIZE;
        const startY = chunkY * CHUNK_SIZE;

        const chunkGroup = this.add.group({
            classType: Phaser.GameObjects.Sprite,
        });

        const collisionGroup = this.add.group({
            classType: Phaser.GameObjects.Sprite,
        });

        const chunkData = getDefaultMapChunk(chunkX, chunkY);

        for (let ty = 0; ty < CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CHUNK_SIZE; tx++) {

                const worldX = startX + tx;
                const worldY = startY + ty;
                const spriteKey = getBlockName(chunkData[tx][ty]);
                const blockType = getBlockTypeByName(spriteKey);

                const gameCoordinates = getGameCoordinates(worldX, worldY);
                const tile = this.add
                    .sprite(gameCoordinates.x, gameCoordinates.y, spriteKey)
                    .setOrigin(0, 0)
                    .setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);

                    if (!blockType.isMovable) {
                        // Add physics body to immovable blocks
                        this.physics.add.existing(tile, true); // true means static body
                        tile.body.moves = false;
                        collisionGroup.add(tile);
                    }

                chunkGroup.add(tile);
            }
        }

        const collider = this.physics.add.collider(this.player, collisionGroup);

        const chunkString = generateChunkString(chunkX, chunkY);
        this.chunkRender[chunkString] = {
            group: chunkGroup,
            collisionGroup: collisionGroup,
            collider: collider,
            shouldStay: true
        };

        
    }

    deleteChunk = function (key, value) {


        value.group.clear(true, true);
        value.group.destroy();

        value.collider.destroy();

        value.collisionGroup.clear(true, true);
        value.collisionGroup.destroy();
        

        delete this.chunkRender[key];

    }

    renderChunks = function (x, y) {

        const maxChunkNumber = Math.floor(MAP_SIZE / CHUNK_SIZE);

        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkY = Math.floor(y / CHUNK_SIZE);

        Object.values(this.chunkRender).forEach((value) => {
            value.shouldStay = false;
        });

        for (let ty = -2; ty <= 2; ty++) {
            for (let tx = -1; tx <= 1; tx++) {
                const currX = chunkX + tx;
                const currY = chunkY + ty;
                if (currX < 0 || currY < 0 || currX >= maxChunkNumber || currY >= maxChunkNumber) {
                    continue;
                } else {

                }
                const chunkString = generateChunkString(currX, currY);
                if (!this.chunkRender[chunkString]) {
                    console.log('Rendering chunk', currX, currY);
                    this.renderChunk(currX, currY);
                } else {
                    this.chunkRender[chunkString].shouldStay = true;
                }
            }
        }

        // Remove chunks that are not one of the near chunks around the player



        Object.entries(this.chunkRender).forEach(([key, value]) => {

            if (!value.shouldStay) {
                this.deleteChunk(key, value);
            }
        });


    }

    createAnimations = function () {
        const animationConfigs = [
            { key: 'walkUp', start: 12, end: 15, sprite: 'guy', frameRate: MAX_WALK_FRAMES_PER_SECOND },
            { key: 'walkDown', start: 0, end: 3, sprite: 'guy', frameRate: MAX_WALK_FRAMES_PER_SECOND },
            { key: 'walkLeft', start: 8, end: 11, sprite: 'guy', frameRate: MAX_WALK_FRAMES_PER_SECOND },
            { key: 'walkRight', start: 4, end: 7, sprite: 'guy', frameRate: MAX_WALK_FRAMES_PER_SECOND },
        ];

        animationConfigs.forEach(({ key, start, end, sprite, frameRate }) => {
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(sprite, { start, end }),
                frameRate: frameRate,
                repeat: -1
            });
        });



    };

    createTileGrid = function (hoverText, selectText) {
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

    setupPlayer = function () {
        this.player = this.physics.add
            .sprite((MAP_SIZE * BLOCK_SIZE / 2), (MAP_SIZE * BLOCK_SIZE / 2), 'guy', 0)
            .setCollideWorldBounds(true)
            .setScale(3)
            .setDepth(2);

        this.player.body.setSize(this. player.width * 0.6, this.player.height * 0.5);
        this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.5);
    };

    setupCamera = function () {
        this.cameras.main.setBounds(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
        this.physics.world.setBounds(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
        this.cameras.main.startFollow(this.player);
    };

    handlePlayerMovement = function (player, keys, joyStick, speed = 160) {
        player.setVelocity(0);

        let moveDirection = [0, 0];

        if (keys.W.isDown) {
            player.anims.play('walkUp', true);

            moveDirection[1] = -1;
        } else if (keys.S.isDown) {
            player.anims.play('walkDown', true);

            moveDirection[1] = 1;
        }


        if (keys.A.isDown) {
            moveDirection[0] = -1;
        } else if (keys.D.isDown) {
            moveDirection[0] = 1;
        }

        if (this.joyStick && moveDirection[0] == 0 && moveDirection[1] == 0) {
            moveDirection[0] = Math.abs(this.joyStick.forceX) > 100 ? (this.joyStick.forceX < 0 ? -1 : 1) : this.joyStick.forceX / 100;
            moveDirection[1] = Math.abs(this.joyStick.forceY) > 100 ? (this.joyStick.forceY < 0 ? -1 : 1) : this.joyStick.forceY / 100;
        }

        const moveDirectionMagnitude = Math.sqrt(moveDirection[0] ** 2 + moveDirection[1] ** 2);

        const angleX = Math.acos(moveDirection[0] / moveDirectionMagnitude)
        const angleY = Math.asin(moveDirection[1] / moveDirectionMagnitude)

        const speedX = moveDirection[0] != 0 ? speed * Math.cos(angleX) * moveDirectionMagnitude / (1 / Math.SQRT1_2) : 0;
        const speedY = moveDirection[1] != 0 ? speed * Math.sin(angleY) * moveDirectionMagnitude / (1 / Math.SQRT1_2) : 0;



        player.setVelocityX(speedX);
        player.setVelocityY(speedY);
        if (speedX == 0 && speedY == 0) {
            player.anims.stop();
            player.setFrame(0);
        } else {
            if (Math.abs(speedX) > Math.abs(speedY) * 1.5) {
                if (speedX > 0) {
                    player.anims.play('walkRight', true);
                } else {
                    player.anims.play('walkLeft', true);
                }


                player.anims.msPerFrame = 1000 / (Math.abs(speedX / speed) * MAX_WALK_FRAMES_PER_SECOND);

            } else {
                if (speedY > 0) {
                    player.anims.play('walkDown', true);
                } else {
                    player.anims.play('walkUp', true);
                }
                player.anims.msPerFrame = 1000 / (Math.abs(speedY / speed) * MAX_WALK_FRAMES_PER_SECOND);

            }
        }

    };


    setupMobileControls() {
        const joyStickConfig = {
            x: 360,
            y: 1100,
            radius: 100,
            base: this.add.circle(0, 0, 100, 0x888888).setAlpha(0.75),
            thumb: this.add.circle(0, 0, 50, 0xcccccc).setAlpha(0.75),
            // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            //forceMin: 16,
            // enable: true
            forceMin: 0,
            enable: true,
            fixed: true,
        };


        this.joyStick = this.plugins.get('rexVirtualJoystick').add(this, joyStickConfig);

        this.joyStick.base.setScrollFactor(0).setDepth(1000);
        this.joyStick.thumb.setScrollFactor(0).setDepth(1000);

    }

    // Main scene functions
    preload = function () {
        this.loadAssets()
    };

    create = function () {
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

        if (this.registry.get('isMobile')) {
            this.setupMobileControls();
        }

    };

    debugInit = function () {
        this.fpsText = this.add.text(10, 50, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' }).setScrollFactor(0).setDepth(1);
    }

    debug = function () {
        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    }

    update = function () {
        this.handlePlayerMovement(this.player, this.keys, this.joyStick);
        if (this.registry.get('isMobile') && !this.joyStick) this.setupMobileControls();
        const mapCoordinates = getMapCoordinates(this.player.x, this.player.y);
        this.renderChunks(mapCoordinates.x, mapCoordinates.y);
        this.debug();
    };



};


