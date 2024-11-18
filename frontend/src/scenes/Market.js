export class Market extends Phaser.Scene {
    constructor() {
        super({ key: 'Market' });
    }

    preload() {
        // Load assets if you have any
        // this.load.image('backButton', 'path/to/backButton.png');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // **Set the background color of the scene**
        this.cameras.main.setBackgroundColor(0x1e1e1e); // You can change the color code as desired

        // Create the back button
        const backButton = this.add.text(20, 20, '< Back', {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 },
        }).setOrigin(0).setInteractive({ cursor: 'pointer' });

        backButton.on('pointerdown', () => {
            this.scene.stop('Market');
            this.scene.resume('Map');
        });

        const selectorHeight = 50;

        // Item Market Button
        const itemMarketButton = this.add.rectangle(0, height - selectorHeight, width / 2, selectorHeight, 0x555555)
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });

        const itemMarketText = this.add.text(width / 4, height - selectorHeight / 2, 'Item Market', {
            fontSize: '20px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

        // Land Market Button
        const landMarketButton = this.add.rectangle(width / 2, height - selectorHeight, width / 2, selectorHeight, 0x777777)
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });

        const landMarketText = this.add.text((3 * width) / 4, height - selectorHeight / 2, 'Land Market', {
            fontSize: '20px',
            fill: '#fff',
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

        // Containers for market content
        const itemMarketContainer = this.add.container(0, 0);
        const landMarketContainer = this.add.container(0, 0);

        // Add content to Item Market Container
        const itemMarketContent = this.add.text(width / 2, height / 2 - 50, 'Item Market Coming Soon...', {
            fontSize: '30px',
            fill: '#fff',
        }).setOrigin(0.5);
        itemMarketContainer.add(itemMarketContent);

        // Add content to Land Market Container
        const landMarketContent = this.add.text(width / 2, height / 2 - 50, 'Land Market Content', {
            fontSize: '30px',
            fill: '#fff',
        }).setOrigin(0.5);
        landMarketContainer.add(landMarketContent);

        // Initially, show Item Market and hide Land Market
        landMarketContainer.setAlpha(0);

        // Function to switch to Item Market
        const showItemMarket = () => {
            itemMarketButton.fillColor = 0x555555;
            landMarketButton.fillColor = 0x777777;

            this.tweens.add({
                targets: itemMarketContainer,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
            });
            this.tweens.add({
                targets: landMarketContainer,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
            });
        };

        // Function to switch to Land Market
        const showLandMarket = () => {
            itemMarketButton.fillColor = 0x777777;
            landMarketButton.fillColor = 0x555555;

            this.tweens.add({
                targets: itemMarketContainer,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
            });
            this.tweens.add({
                targets: landMarketContainer,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
            });
        };

        // Add interactivity to the selector buttons
        itemMarketButton.on('pointerdown', showItemMarket);
        itemMarketText.on('pointerdown', showItemMarket);

        landMarketButton.on('pointerdown', showLandMarket);
        landMarketText.on('pointerdown', showLandMarket);
    }
}