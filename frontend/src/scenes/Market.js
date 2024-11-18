import axios from "axios";
import crypto from "crypto";
import { AEON_APP_ID, AEON_CONFIG, AEON_PAYMENT_URL, AEON_SECRET_KEY } from "../utils/consts";

export class Market extends Phaser.Scene {
    constructor() {
        super({ key: 'Market' });
    }

    preload() {
        // Load assets if you have any
        // Example:
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
            borderRadius: 5,
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
        const landMarketContent = this.add.text(width / 2, height / 2 - 50, 'Land Market', {
            fontSize: '30px',
            fill: '#fff',
        }).setOrigin(0.5);
        landMarketContainer.add(landMarketContent);

        // **Add Buy Button to Land Market Container**
        const buyButtonWidth = 200;
        const buyButtonHeight = 50;
        const buyButton = this.add.rectangle(width / 2, height / 2 + 50, buyButtonWidth, buyButtonHeight, 0x00ff00)
            .setOrigin(0.5)
            .setInteractive({ cursor: 'pointer' });

        const buyButtonText = this.add.text(width / 2, height / 2 + 50, 'Buy Land', {
            fontSize: '20px',
            fill: '#000',
        }).setOrigin(0.5);

        // Add interactivity to the Buy Button
        buyButton.on('pointerover', () => {
            buyButton.setFillStyle(0x00cc00); // Darker green on hover
        });

        buyButton.on('pointerout', () => {
            buyButton.setFillStyle(0x00ff00); // Original green when not hovered
        });

        buyButton.on('pointerdown', async () => {
            await axios.post(AEON_PAYMENT_URL, {
                    ...AEON_CONFIG,
                    sign: sign(AEON_CONFIG),
            }).then((response) => {
                console.log(response.data);
            }
            ).catch((error) => {
                console.error(error
            );
            });
        });

        // Add Buy Button and Text to Land Market Container
        landMarketContainer.add(buyButton);
        landMarketContainer.add(buyButtonText);

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

        const sign = (data) => {
            const sortedKeys = Object.keys(data).sort();
            const queryString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
            const stringToSign = `${queryString}&key=${AEON_SECRET_KEY}`;
          
            return crypto.createHash('sha512')
              .update(stringToSign)
              .digest('hex')
              .toUpperCase();
        }

        // Add interactivity to the selector buttons
        itemMarketButton.on('pointerdown', showItemMarket);
        itemMarketText.on('pointerdown', showItemMarket);

        landMarketButton.on('pointerdown', showLandMarket);
        landMarketText.on('pointerdown', showLandMarket);
    }
}