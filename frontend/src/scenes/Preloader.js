import { Scene } from 'phaser';
import { blockTypes } from '../utils/getBlockType';
import { verifyTelegramWebAppData } from '../utils/telegram';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(360, 540, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(360, 540, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(360-230, 540, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        verifyTelegramWebAppData()
            .then(() => {
                console.log("Telegram WebApp data found");
            }
            )
            .catch((err) => {
                console.error(err);
                console.log('Telegram session not found. Please run the game in Telegram');
                this.add.text(360, 340, 'Telegram session not found.', {
                    fontFamily: 'Arial', fontSize: 36, color: '#ffffff',
                    stroke: '#000000', strokeThickness: 4,
                    align: 'center'
                }).setOrigin(0.5);

                this.add.text(360, 380, 'Please run the game in Telegram', {
                    fontFamily: 'Arial', fontSize: 36, color: '#ffffff',
                    stroke: '#000000', strokeThickness: 4,
                    align: 'center'
                }).setOrigin(0.5);
                return;
            });

        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.spritesheet('guy', 'guy.png', { frameWidth: 16, frameHeight: 24 });

        Object.entries(blockTypes).forEach(([key, value]) => {
            this.load.image(value.name, value.path);
        });

        //this.load.spritesheet('water', 'naturalBlocks/ocean.png', { frameWidth: 16, frameHeight: 16 });
        
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
