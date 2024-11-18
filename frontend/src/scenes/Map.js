import { Scene } from 'phaser';
import { Input } from 'phaser';
import io from 'socket.io-client';
import { RemotePlayer } from '../components/RemotePlayer';
import {
    BLOCK_SIZE,
    CHUNK_SIZE,
    MAP_SIZE,
    MAX_WALK_FRAMES_PER_SECOND,
} from '../utils/consts';
import {
    generateChunkString,
    getGameCoordinates,
    getMapCoordinates,
} from '../utils/utils';
import {
    fetchChunk,
    getDefaultMapChunk,
} from '../utils/map';
import { blockTypes, getBlockName, getBlockTypeByName } from '../utils/getBlockType';
import { Minimap } from '../components/Minimap'; // Import the Minimap class
import { getSocket } from '../utils/socket';
import { getUserId } from '../utils/telegram';

export class Map extends Scene {
    constructor() {
        super('Map');
        this.chunkRender = {};
        this.chunkData = {};

        // Add this line to allow Minimap to access BLOCK_SIZE
        this.blockSize = BLOCK_SIZE;

        // Other properties
        this.keys = null;
        this.player = null;
        this.joyStick = null;
        this.minimap = null;
        this.remotePlayers = {};
    }

    // Load assets (if any)
    loadAssets() {
        // Implement asset loading if needed
    }

    // Preload assets
    preload() {
        this.loadAssets();
    }

    // Create game objects
    create() {
        this.cameras.main.setBackgroundColor('#2d4c1e'); // grass color
        // Set up texts
        const hoverText = this.add
            .text(10, 10, '', {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: '#000',
            })
            .setScrollFactor(0)
            .setDepth(1);
        const selectText = this.add
            .text(10, 30, '', {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: '#000',
            })
            .setScrollFactor(0)
            .setDepth(1);

        this.createAnimations();
        this.setupPlayer();
        this.setupCamera();

        // Keyboard inputs
        this.keys = this.input.keyboard.addKeys({
            W: Input.Keyboard.KeyCodes.W,
            A: Input.Keyboard.KeyCodes.A,
            S: Input.Keyboard.KeyCodes.S,
            D: Input.Keyboard.KeyCodes.D,
        });

        // Mobile controls
        if (this.registry.get('isMobile')) {
            this.setupMobileControls();
        }

        // Create the minimap
        this.minimap = new Minimap(this, this.player);


        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.minimap.minimapVisible) {
                this.minimap.zoomMinimap(-deltaY);
            }
        });

        this.events.on('minimapVisibilityChanged', (visible) => {
            if (this.joyStick) {
                this.joyStick.visible = !visible;
                this.joyStick.enable = !visible;
            }
        });

        this.setupSocket();

        this.socket.emit('playerJoin', {
            id: getUserId(),
            x: this.player.x,
            y: this.player.y,
        });

    }

    // Update game objects
    update() {
        this.handlePlayerMovement(this.player, this.keys);
        if (this.registry.get('isMobile') && !this.joyStick) {
            this.setupMobileControls();
        }

        const mapCoordinates = getMapCoordinates(this.player.x, this.player.y);
        this.renderChunks(mapCoordinates.x, mapCoordinates.y);

        // Update minimap if visible
        if (this.minimap && this.minimap.minimapVisible) {
            this.minimap.updateMinimapPlayerPosition();
        }
    }


    // Create animations (your existing code)
    createAnimations() {
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
                repeat: -1,
            });
        });
        Object.entries(blockTypes).forEach(([key, value]) => {
            if(value.isSpriteSheet) {
                this.anims.create({
                    key: value.name + '-anim',
                    // all frames
                    frames: this.anims.generateFrameNumbers(value.name, { start: 0, end: value.frames.length - 1 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        });

    }

    // Setup player (your existing code)
    setupPlayer() {
        this.player = this.physics.add
            .sprite(MAP_SIZE / 2, MAP_SIZE / 2, 'guy', 0)
            .setCollideWorldBounds(true)
            .setScale(3)
            .setDepth(2);

        this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.5);
        this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.5);
    }

    // Setup camera (your existing code)
    setupCamera() {
        this.cameras.main.setBounds(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
        this.physics.world.setBounds(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
        this.cameras.main.startFollow(this.player);
    }

    // Handle player movement (your existing code)
    handlePlayerMovement(player, keys, speed = 160) {
        // Your existing movement code
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

        if (this.joyStick && moveDirection[0] === 0 && moveDirection[1] === 0) {
            moveDirection[0] = Math.abs(this.joyStick.forceX) > 100 ? (this.joyStick.forceX < 0 ? -1 : 1) : this.joyStick.forceX / 100;
            moveDirection[1] = Math.abs(this.joyStick.forceY) > 100 ? (this.joyStick.forceY < 0 ? -1 : 1) : this.joyStick.forceY / 100;
        }

        const moveDirectionMagnitude = Math.hypot(moveDirection[0], moveDirection[1]);

        if (moveDirectionMagnitude > 0) {
            const normalizedDirection = [
                moveDirection[0] / moveDirectionMagnitude,
                moveDirection[1] / moveDirectionMagnitude,
            ];

            const speedX = speed * normalizedDirection[0];
            const speedY = speed * normalizedDirection[1];

            player.setVelocityX(speedX);
            player.setVelocityY(speedY);

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
        } else {
            player.anims.stop();
            player.setFrame(0);
        }

        // Emit player's position to the server
        if (this.socket && this.socket.connected) {
            this.socket.emit('playerMove', {
                id: getUserId(),
                x: player.x,
                y: player.y,
                anim: moveDirectionMagnitude > 0 ? player.anims.currentAnim.key : 'idle',
            });
        }
    }

    renderChunks(x, y) {
        const maxChunkNumber = Math.floor(MAP_SIZE / CHUNK_SIZE);

        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkY = Math.floor(y / CHUNK_SIZE);

        Object.values(this.chunkRender).forEach((value) => {
            value.shouldStay = false;
        });

        Object.values(this.chunkData).forEach((value) => {
            value.shouldStay = false;
        });

        for (let ty = -4; ty <= 4; ty++) {
            for (let tx = -3; tx <= 3; tx++) {
                const currX = chunkX + tx;
                const currY = chunkY + ty;
                if (currX < 0 || currY < 0 || currX >= maxChunkNumber || currY >= maxChunkNumber) {
                    continue;
                }
                const chunkString = generateChunkString(currX, currY);
                if (!this.chunkData[chunkString] || !this.chunkData[chunkString].fetchRequested) {
                    this.chunkData[chunkString] = { fetchRequested: true, shouldStay: true };
                    fetchChunk(currX, currY).then((currData) => {
                        this.chunkData[chunkString] = { shouldStay: true, data: currData, fetchCompleted: true, fetchRequested: true };
                        if (this.chunkRender[chunkString]?.usePlaceholders) {
                            this.deleteChunk(chunkString, this.chunkRender[chunkString]);
                            this.renderChunk(currX, currY);
                        }
                    });
                } else {
                    this.chunkData[chunkString].shouldStay = true;
                }
            }
        }

        for (let ty = -2; ty <= 2; ty++) {
            for (let tx = -1; tx <= 1; tx++) {
                const currX = chunkX + tx;
                const currY = chunkY + ty;
                if (currX < 0 || currY < 0 || currX >= maxChunkNumber || currY >= maxChunkNumber) {
                    continue;
                }
                const chunkString = generateChunkString(currX, currY);
                if (!this.chunkRender[chunkString]) {
                    this.renderChunk(currX, currY);
                } else {
                    this.chunkRender[chunkString].shouldStay = true;
                }
            }
        }

        // Remove chunks that are not needed
        Object.entries(this.chunkRender).forEach(([key, value]) => {
            if (!value.shouldStay) {
                this.deleteChunk(key, value);
            }
        });

        Object.entries(this.chunkData).forEach(([key, value]) => {
            if (!value.shouldStay) {
                delete this.chunkData[key];
            }
        });
    }

    renderChunk(chunkX, chunkY) {

        let usePlaceholders = false;

        const chunkString = generateChunkString(chunkX, chunkY);

        if (!this.chunkData[chunkString] || !this.chunkData[chunkString].fetchCompleted) {
            usePlaceholders = true;
        }

        const startX = chunkX * CHUNK_SIZE;
        const startY = chunkY * CHUNK_SIZE;

        const chunkGroup = this.add.group({
            classType: Phaser.GameObjects.Sprite,
        });

        const collisionGroup = this.add.group({
            classType: Phaser.GameObjects.Sprite,
        });

        const chunkData = usePlaceholders
            ? getDefaultMapChunk(chunkX, chunkY)
            .map((row) => row.map((blockType) => ({ blockType, direction: 0 })))
            : this.chunkData[chunkString].data;

        for (let ty = 0; ty < CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CHUNK_SIZE; tx++) {
                const currBlock = chunkData[tx][ty];
                console.log("currBlock", currBlock);
                const worldX = startX + tx;
                const worldY = startY + ty;
                const spriteKey = getBlockName(currBlock.blockType);
                const blockType = getBlockTypeByName(spriteKey);

                const gameCoordinates = getGameCoordinates(worldX, worldY);
                const tile = this.add
                    .sprite(gameCoordinates.x, gameCoordinates.y, spriteKey)
                    .setOrigin(0, 0)
                    .setDisplaySize(BLOCK_SIZE, BLOCK_SIZE)
                    // rotate the sprite if needed
                    .setAngle(90 * currBlock.direction)

                if (!blockType.isMovable) {
                    // Add physics body to immovable blocks
                    this.physics.add.existing(tile, true); // true means static body
                    tile.body.moves = false;
                    collisionGroup.add(tile);
                }
                if(blockType.isSpriteSheet) {
                    tile.anims.play(spriteKey + '-anim', true);
                }

                chunkGroup.add(tile);
            }
        }

        const collider = this.physics.add.collider(this.player, collisionGroup);

        this.chunkRender[chunkString] = {
            group: chunkGroup,
            collisionGroup: collisionGroup,
            collider: collider,
            shouldStay: true,
            usePlaceholders: usePlaceholders,
        };
    }

    // Delete a chunk (your existing code)
    deleteChunk(key, value) {
        value.group.clear(true, true);
        value.group.destroy();

        value.collider.destroy();

        value.collisionGroup.clear(true, true);
        value.collisionGroup.destroy();

        delete this.chunkRender[key];
    }



    // Setup mobile controls (your existing code)
    setupMobileControls() {
        // Your existing mobile controls setup
        const joyStickConfig = {
            x: 360,
            y: 1040,
            radius: 100,
            base: this.add.circle(0, 0, 100, 0x888888).setAlpha(0.75),
            thumb: this.add.circle(0, 0, 50, 0xcccccc).setAlpha(0.75),
            forceMin: 0,
            enable: true,
            fixed: true,
        };

        this.joyStick = this.plugins.get('rexVirtualJoystick').add(this, joyStickConfig);

        this.joyStick.base.setScrollFactor(0).setDepth(1000);
        this.joyStick.thumb.setScrollFactor(0).setDepth(1000);
    }

    // Debug functions (if any)
    debugInit() {
        this.fpsText = this.add
            .text(40, 80, '', { fontSize: '16px', fill: '#fff', backgroundColor: '#000' })
            .setScrollFactor(0)
            .setDepth(10000);
    }

    debug() {
        this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    }

    setupSocket() {
        this.socket = getSocket();

        // Handle new players joining
        this.socket.on('playerJoin', (data) => {
            if (data.id !== getUserId() && !this.remotePlayers[data.id]) {
                const remotePlayer = new RemotePlayer(this, data.id, data.x, data.y);
                this.remotePlayers[data.id] = remotePlayer;
            }
        });

        // Handle remote player movement
        this.socket.on('playerMove', (data) => {
            if (data.id !== getUserId() && this.remotePlayers[data.id]) {
                this.remotePlayers[data.id].update(data);
            }
        });

        // Handle players disconnecting
        this.socket.on('playerLeft', (id) => {
            if (this.remotePlayers[id]) {
                this.remotePlayers[id].destroy();
                delete this.remotePlayers[id];
            }
        });
    }
}