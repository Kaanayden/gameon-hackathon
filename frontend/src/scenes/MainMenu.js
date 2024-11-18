import { Scene } from 'phaser';
import { getUserFullName, getUserId } from '../utils/telegram';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../utils/consts';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const background = this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'background');
        // preserve aspect ratio of the background image
        const scale = SCREEN_HEIGHT / background.height;
        background.setScale(scale).setScrollFactor(0);

        // Set position and size of the logo
        this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 250, 'logo').setScale(0.5);

        this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 200, 'Start The Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Map');

        });

        this.registry.set('isMobile', false);
        window.addEventListener('touchstart', () => {
            this.registry.set('isMobile', true);
        });

        console.log(Telegram.WebApp.initData);
        // Print welcome message to the main menu
        this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 100, `Welcome ${getUserId() ? getUserFullName() : 'User'}!`, {
            fontFamily: 'Arial', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
    }
}
