/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * BootScene.js
 * IDK Game — DAOR Studios
 *
 * Loads all game assets, then routes to MenuScene.
 * GameManagerScene is NOT launched here anymore —
 * it starts when the player presses Play in MenuScene.
 */

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // ── Loading bar UI ────────────────────────────────────────────────
        const W  = 1920;
        const H  = 1080;
        const cx = W / 2;

        this.add.rectangle(cx, H / 2, W, H, 0x111122);

        this.add.text(cx, H / 2 - 80, 'Factory Village', {
            fontSize:   '64px',
            color:      '#ffd700',
            fontFamily: 'Arial',
            fontStyle:  'bold'
        }).setOrigin(0.5);

        this.add.text(cx, H / 2 - 20, 'Loading…', {
            fontSize:   '28px',
            color:      '#aaaacc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Progress bar background
        const barW = 600;
        const barH = 24;
        const barX = cx - barW / 2;
        const barY = H / 2 + 30;
        this.add.rectangle(cx, barY + barH / 2, barW, barH, 0x333355)
            .setOrigin(0.5);

        const bar = this.add.rectangle(barX, barY, 0, barH, 0xffd700)
            .setOrigin(0, 0);

        this.load.on('progress', (value) => {
            bar.width = barW * value;
        });

        // Studio credit under the bar
        this.add.text(cx, barY + 50, 'DAOR Studios', {
            fontSize:   '20px',
            color:      '#555577',
            fontFamily: 'Arial',
            fontStyle:  'bold'
        }).setOrigin(0.5);

        // ── Assets ────────────────────────────────────────────────────────
        // Backgrounds
        this.load.image('land_1', 'assets/images/background/land_1.png');
        this.load.image('land_2', 'assets/images/background/land_2.png');

        // Buildings
        for (let i = 1; i <= 6; i++) {
            this.load.image(`building_${i}`, `assets/images/buildings/building_${i}.png`);
        }

        // Tower
        this.load.image('PlayerTower', 'assets/images/tower/PlayerTower.png');

        // Machines
        const machineProducts = ['iron','copper','steel','amethyst','emerald','magmastone','quartz','titanium'];
        machineProducts.forEach(name => {
            this.load.image(`machine_${name}`, `assets/images/machines/machine_${name}.png`);
        });

        // Mineral icons
        const minerals = ['iron','copper','steel','amethyst','emerald','magmastone','quartz','titanium'];
        minerals.forEach(name => {
            this.load.image(name, `assets/images/minerals/${name}.png`);
        });

        // Villager portraits
        const villagers = ['aeron','branna','cael','eira','lorcan','saoirse'];
        villagers.forEach(name => {
            this.load.image(`villager_${name}`, `assets/images/villagers/${name}.png`);
        });
    }

    create() {
        // All assets ready — go to the main menu
        this.scene.start('MenuScene');
    }
}
