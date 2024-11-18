import { Scene } from 'phaser';
import { Input } from 'phaser';
import { RemotePlayer } from '../components/RemotePlayer';
import {
    BLOCK_SIZE,
    CHUNK_SIZE,
    MAP_SIZE,
    MAX_WALK_FRAMES_PER_SECOND,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
} from '../utils/consts';
import {
    generateChunkString,
    generateChunkStringFromPoint,
    getGameCoordinates,
    getMapCoordinates,
} from '../utils/utils';
import {
    fetchChunk,
    getDefaultMapChunk,
    getDefaultOreType,
} from '../utils/map';
import { blockTypes, getBlockByCoordinates, getBlockName, getBlockType, getBlockTypeByName } from '../utils/getBlockType';
import { Minimap } from '../components/Minimap'; // Import the Minimap class
import { getSocket } from '../utils/socket';
import { getUserId } from '../utils/telegram';
import { BuildingMode } from '../components/BuildingMode';
import { GameFi } from '@ton/phaser-sdk';


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
        this.connectButton = null;
        this.marketButton = null;
    }

    // Load assets (if any)
    loadAssets() {
        Object.values(blockTypes).forEach((block) => {
            if (block.path) {
                this.load.image(block.name, block.path);
            }
        });
        this.load.image('market', 'assets/market.png');
    }

    // Preload assets
    preload() {
        this.loadAssets();
    }

    // Create game objects
    create() {

        GameFi.create({
            connector: {
                // if tonconnect-manifest.json is placed in the root you can skip this option
                manifestUrl: "https://raw.githubusercontent.com/koybasimuhittin/manifest/refs/heads/main/tonconnect-manifest.json",
                actionsConfiguration: {
                    // address of your Telegram Mini App to return to after the wallet is connected
                    // url you provided to BothFather during the app creation process
                    // to read more please read https://github.com/ton-community/flappy-bird#telegram-bot--telegram-web-app
                    twaReturnUrl: import.meta.env.VITE_PUBLIC_FRONTEND_URL,
                },
                contentResolver: {
                    // some NFT marketplaces don't support CORS, so we need to use a proxy
                    // you are able to use any format of the URL, %URL% will be replaced with the actual URL
                    urlProxy: `%URL%`
                },
            },
        }).then((gameFi) => {
            console.log(gameFi);
            this.connectButton = gameFi.createConnectButton(
                {scene: this, x: 0, y: 0, text: 'Connect Wallet'}
            );
            this.connectButton.setDepth(10000);
            this.connectButton.setScrollFactor(0);
            this.connectButton.setScale(2)
            this.connectButton.setPosition(SCREEN_WIDTH - this.connectButton.width * 2, 0);

            this.unsubscribeWalletChange = gameFi.onWalletChange(this.onWalletChange.bind(this));

        });

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
        this.buildingMode = new BuildingMode(this, this.player);


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

        // Override the default map click handler to include boundary checks
        this.input.on('pointerdown', this.onMapClick, this);
    }

    onMapClick(pointer) {
        // Define the bottom bar height and position
        const bottomBarHeight = 100;
        const bottomBarY = SCREEN_HEIGHT - bottomBarHeight;

        // If the pointer is within the bottom bar area, ignore the click
        if (pointer.y >= bottomBarY) {
            return;
        }
        

        if (!this.buildingMode.isBuilding) {
            return;
        }

        const worldX = Math.floor(pointer.worldX / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE / 2;
        const worldY = Math.floor(pointer.worldY / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE / 2;
        const blockType = getBlockTypeByName(this.buildingMode.selectedBlockType);

        const previousBlock = getBlockByCoordinates(worldX, worldY, this.chunkData);
        const previousBlockType = getBlockType(previousBlock.blockType);

        if(!previousBlockType.isNatural) {
            const mapCoords = getMapCoordinates(worldX, worldY);
            this.socket.emit('placeBlock', { x: mapCoords.x, y: mapCoords.y, blockType: getDefaultOreType(mapCoords.x, mapCoords.y), direction: 0});
        }

        if(!this.buildingMode.selectedBlockType || !previousBlockType.isMovable) return;


        if (this.buildingMode.previewSprite) {
            // Update position
            this.buildingMode.previewSprite.setPosition(worldX, worldY);
        } else {
            // Create preview
            this.buildingMode.previewSprite = this.add.sprite(worldX, worldY, blockType.name)
                .setAlpha(0.5)
                .setOrigin(0.5, 0.5)
                .setDisplaySize(blockType.displaySize ? blockType.displaySize : BLOCK_SIZE, blockType.displaySize ? blockType.displaySize : BLOCK_SIZE);
            this.buildingMode.previewRotation = 0;

            this.buildingMode.createRotateAndDoneButtons();
        }
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

    // Add this method inside the Map class
    createMarketButton() {
        if (this.marketButton) return; // Prevent multiple instances

        // Create the Market Button as an interactive image
        this.marketButton = this.add.image(0, 0, 'market').setInteractive();

        // Define padding between buttons
        const padding = 10;

        // Position the Market Button to the left of the Connect Button
        this.marketButton.setScale(0.6)

        this.marketButton.setPosition(
            this.connectButton.x - padding - 20,
            this.connectButton.y + 20
        );
       

        // Set rendering properties
        this.marketButton.setDepth(1000);
        this.marketButton.setScrollFactor(0);

        // Add a pointer (click) event listener
        this.marketButton.on('pointerdown', () => {
            this.scene.pause('Map');
            this.scene.launch('Market');
        });
    }

    destroyMarketButton() {
        if (this.marketButton) {
            this.marketButton.destroy();
            this.marketButton = null;
        }
    }

    // Handle player movement (your existing code)
    handlePlayerMovement(player, keys, speed = 160) {
        // Your existing movement code
        console.log("player", this.player);
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

            console.log("player", this.player);

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
                const worldX = startX + tx;
                const worldY = startY + ty;
                const spriteKey = getBlockName(currBlock.blockType);
                const blockType = getBlockTypeByName(spriteKey);

                const gameCoordinates = getGameCoordinates(worldX, worldY);

                if(blockType.isTransparent) {
                    const tile = this.add
                    .sprite(gameCoordinates.x + BLOCK_SIZE / 2, gameCoordinates.y + BLOCK_SIZE / 2, getBlockType(getDefaultOreType(worldX, worldY)).name)
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(BLOCK_SIZE , BLOCK_SIZE)

                    chunkGroup.add(tile);
                }


                const tile = this.add
                    .sprite(gameCoordinates.x + BLOCK_SIZE / 2, gameCoordinates.y + BLOCK_SIZE / 2, spriteKey)
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(blockType.displaySize ? blockType.displaySize : BLOCK_SIZE, blockType.displaySize ? blockType.displaySize : BLOCK_SIZE)
                    // rotate the sprite if needed
                    .setAngle(90 * currBlock.direction)

                

                if (!blockType.isMovable) {
                    // Add physics body to immovable blocks
                    this.physics.add.existing(tile, true); // true means static body
                    tile.body.moves = false;
                    collisionGroup.add(tile);
                    // make the hitbox equal to the BLOCK_SIZE
                    if(blockType.displaySize) {
                    tile.body.setSize(BLOCK_SIZE, BLOCK_SIZE);
                    tile.body.setOffset((blockType.displaySize - BLOCK_SIZE) / 2, (blockType.displaySize - BLOCK_SIZE) / 2);
                    }
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

        // Handle player building
        this.socket.on('blockPlaced', (data) => {
            console.log("place block:", data)
            const chunkString = generateChunkStringFromPoint(data.x, data.y)
            this.chunkData[chunkString].data[data.x % CHUNK_SIZE][data.y % CHUNK_SIZE] = { blockType: data.blockType, direction: data.direction };
            
            this.deleteChunk(chunkString, this.chunkRender[chunkString]);
            this.renderChunk(data.chunkX, data.chunkY);
        });
    }



    onWalletChange(wallet) {
        if (wallet) {
            // Wallet is connected
            this.createMarketButton();
        } else {
            this.destroyMarketButton();

        }
    }
}