/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * MenuScene.js
 * IDK Game — DAOR Studios
 *
 * Main menu: shown after assets are loaded.
 * Scales UI automatically for mobile vs web via GameConfig.
 */

import Platform from '../GameConfig.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const W = 1920;
        const H = 1080;
        const cx = W / 2;

        // ── BACKGROUND ────────────────────────────────────────────────────
        // Tile the land background we already loaded in BootScene
        for (let y = 0; y < H; y += 256)
            for (let x = 0; x < W; x += 256)
                this.add.image(x, y, 'land_1').setOrigin(0);

        // Scatter some land details
        for (let i = 0; i < 18; i++)
            this.add.image(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(0, H),
                'land_2'
            ).setOrigin(0.5).setAlpha(0.6);

        // Dark vignette overlay so text pops
        this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.55);

        // ── LOGO PANEL ────────────────────────────────────────────────────
        // Subtle panel behind the title block
        this.add.rectangle(cx, 290, 1100, 280, 0x000000, 0.45)
            .setStrokeStyle(2, 0xffd700, 0.3);

        // ── TITLE ─────────────────────────────────────────────────────────
        this.add.text(cx, 210, 'IDK: The Game', {
            fontSize:       Platform.FONT_TITLE,
            color:          '#ffd700',
            fontFamily:     'Arial',
            fontStyle:      'bold',
            stroke:         '#000000',
            strokeThickness: 10,
            shadow: {
                offsetX: 4, offsetY: 4,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Tagline
        this.add.text(cx, 320, 'Build · Trade · Evolve', {
            fontSize:    Platform.FONT_MD,
            color:       '#ccddff',
            fontFamily:  'Arial',
            fontStyle:   'italic',
            stroke:      '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // ── DIVIDER ───────────────────────────────────────────────────────
        this.add.rectangle(cx, 390, 600, 2, 0xffd700, 0.4);

        // ── BUTTONS ───────────────────────────────────────────────────────
        const btnW = Platform.BTN_W;
        const btnH = Platform.BTN_H;

        // Calculate vertical layout depending on whether Quit is shown
        const playY = Platform.SHOW_QUIT ? 510 : 540;
        const quitY = playY + btnH + 28;

        // PLAY ──────────────────────────────────────────────────────────────
        const playBtn = this.add.rectangle(cx, playY, btnW, btnH, 0x1a6b1a, 1)
            .setStrokeStyle(Platform.STROKE + 1, 0x66ff66, 0.9)
            .setInteractive({ useHandCursor: true });

        this.add.text(cx, playY, '▶  Play', {
            fontSize:    Platform.FONT_XL,
            color:       '#ffffff',
            fontFamily:  'Arial',
            fontStyle:   'bold',
            stroke:      '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.addButtonFeedback(playBtn, 0x1a6b1a, 0x22aa22);

        playBtn.on('pointerdown', () => {
            // Brief flash then start the game
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.launch('GameManagerScene');
                this.scene.start('MainScene');
            });
        });

        // QUIT (mobile only) ────────────────────────────────────────────────
        if (Platform.SHOW_QUIT) {
            const quitBtn = this.add.rectangle(cx, quitY, btnW, btnH * 0.85, 0x6b1a1a, 1)
                .setStrokeStyle(Platform.STROKE, 0xff6666, 0.8)
                .setInteractive({ useHandCursor: true });

            this.add.text(cx, quitY, '✕  Quit', {
                fontSize:    Platform.FONT_LG,
                color:       '#ffcccc',
                fontFamily:  'Arial',
                fontStyle:   'bold'
            }).setOrigin(0.5);

            this.addButtonFeedback(quitBtn, 0x6b1a1a, 0xaa2222);
            quitBtn.on('pointerdown', () => Platform.quit());
        }

        // ── CREDITS (bottom) ──────────────────────────────────────────────
        // Thin separator
        this.add.rectangle(cx, H - 80, W, 1, 0xffffff, 0.15);

        // Studio name — left
        this.add.text(60, H - 50, 'DAOR Studios', {
            fontSize:    Platform.FONT_SM,
            color:       '#aaaacc',
            fontFamily:  'Arial',
            fontStyle:   'bold'
        }).setOrigin(0, 0.5);

        // Developer name — right
        this.add.text(W - 60, H - 50, 'Diego Ovalle', {
            fontSize:    Platform.FONT_SM,
            color:       '#aaaacc',
            fontFamily:  'Arial'
        }).setOrigin(1, 0.5);

        // Version tag — center
        this.add.text(cx, H - 50, 'v1.0', {
            fontSize:    Platform.FONT_SM,
            color:       '#555577',
            fontFamily:  'Arial'
        }).setOrigin(0.5);

        // ── ENTRANCE ANIMATION ────────────────────────────────────────────
        // Fade in from black on first load
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    /**
     * Adds hover/press colour feedback to a rectangle button.
     * @param {Phaser.GameObjects.Rectangle} btn
     * @param {number} normalColor
     * @param {number} hoverColor
     */
    addButtonFeedback(btn, normalColor, hoverColor) {
        btn.on('pointerover',  () => btn.setFillStyle(hoverColor));
        btn.on('pointerout',   () => btn.setFillStyle(normalColor));
        btn.on('pointerdown',  () => btn.setFillStyle(hoverColor));
        btn.on('pointerup',    () => btn.setFillStyle(normalColor));
    }
}
