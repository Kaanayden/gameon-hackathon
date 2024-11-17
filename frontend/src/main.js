import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Map } from './scenes/Map';
import { Preloader } from './scenes/Preloader';
import WebApp from '@twa-dev/sdk'

import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './utils/consts';

WebApp.ready();

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH        
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false },
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver,
        Map
    ],
    plugins: {
        global: [{
            key: 'rexVirtualJoystick',
            plugin: VirtualJoystickPlugin,
            start: true
        },
        ]
    }
};

export default new Phaser.Game(config);
