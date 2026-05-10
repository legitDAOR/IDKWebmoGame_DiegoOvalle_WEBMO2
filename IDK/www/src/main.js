/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * main.js
 * IDK Game — DAOR Studios
 *
 * Entry point. Registers all scenes and boots Phaser.
 * Platform detection (mobile vs web) lives in GameConfig.js.
 */

import Platform      from './GameConfig.js';

import BootScene     from './Scenes/BootScene.js';
import MenuScene     from './Scenes/MenuScene.js';
import GameManagerScene from './Scenes/GameManagerScene.js';
import MainScene     from './Scenes/MainScene.js';
import BuildModeScene   from './Scenes/BuildModeScene.js';
import ShopMenuScene    from './Scenes/ShopMenuScene.js';
import InventoryScene   from './Scenes/InventoryScene.js';
import SellMenuScene    from './Scenes/SellMenuScene.js';
import UIScene          from './Scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,

    // Game canvas is always 1920×1080.
    // On mobile Phaser.Scale.FIT letterboxes it to fill the screen.
    // On web it fits inside the browser window with the same aspect ratio.
    width:  1920,
    height: 1080,

    backgroundColor: '#111122',

    parent: 'game-container',

    scale: {
        mode:        Phaser.Scale.FIT,
        autoCenter:  Phaser.Scale.CENTER_BOTH,
        width:       1920,
        height:      1080,
        expandParent: true
    },

    // WebGL where available, Canvas as fallback
    // Phaser.AUTO picks automatically
    scene: [
        BootScene,        // 1. load assets → MenuScene
        MenuScene,        // 2. main menu   → MainScene (on Play)
        GameManagerScene, // 3. background logic scene (launched by MenuScene)
        MainScene,
        BuildModeScene,
        ShopMenuScene,
        InventoryScene,
        SellMenuScene,
        UIScene
    ]
};

const game = new Phaser.Game(config);

// Expose for debugging in the browser console
if (!Platform.IS_MOBILE) {
    window.__game = game;
}
