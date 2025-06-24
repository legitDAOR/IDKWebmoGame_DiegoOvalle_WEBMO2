import BootScene from './Scenes/BootScene.js';
import GameManagerScene from './Scenes/GameManagerScene.js';
import MainScene from './Scenes/MainScene.js';
import BuildModeScene from './Scenes/BuildModeScene.js';
import ShopMenuScene from './Scenes/ShopMenuScene.js';
import InventoryScene from './Scenes/InventoryScene.js';
import SellMenuScene from './Scenes/SellMenuScene.js';
import UIScene from './Scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#000',
    parent: 'game-container',
    scene: [
        BootScene,
        GameManagerScene,
        MainScene,
        BuildModeScene,
        ShopMenuScene,
        InventoryScene,
        SellMenuScene,
        UIScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
