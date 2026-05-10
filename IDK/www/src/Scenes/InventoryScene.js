/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super('InventoryScene');
    }

    init(data) {
        this.playerInventory = data.inventory || this.registry.get('inventory') || [];
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.money = data.money ?? this.registry.get('money') ?? 0;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];
        this.uiElements = [];
    }

    create() {
        // Dark overlay
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.55);

        // Panel
        const panelW = 1400;
        const panelH = 860;
        this.add.rectangle(960, 530, panelW, panelH, 0x1e1e2e, 0.97)
            .setStrokeStyle(4, 0xff9944, 0.8);

        // Title
        this.add.text(960, 105, '🎒  Inventory', {
            fontSize: '52px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Money
        this.moneyText = this.add.text(960, 170, `💰  $${this.money}`, {
            fontSize: '40px', color: '#ffff00', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Divider
        this.add.rectangle(960, 205, 1300, 3, 0xff9944, 0.5);

        // Empty label (shown when nothing in inventory)
        this.emptyText = this.add.text(960, 500, 'Your inventory is empty!', {
            fontSize: '36px', color: '#888888', fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);

        this.drawInventory();

        // Close button
        const closeBtn = this.add.rectangle(960, 940, 380, 90, 0x8b0000, 1)
            .setStrokeStyle(3, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });

        this.add.text(960, 940, '← Back', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xaa0000));
        closeBtn.on('pointerout',  () => closeBtn.setFillStyle(0x8b0000));
        closeBtn.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());

        // Refresh every second
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.playerInventory = this.registry.get('inventory') || [];
                this.money = this.registry.get('money') ?? this.money;
                this.moneyText.setText(`💰  $${this.money}`);
                this.drawInventory();
            }
        });
    }

    drawInventory() {
        this.uiElements.forEach(e => e.destroy());
        this.uiElements = [];

        // Count items
        const itemCounts = {};
        this.playerInventory.forEach(item => {
            const key = item.produces || item;
            itemCounts[key] = (itemCounts[key] || 0) + 1;
        });

        const entries = Object.entries(itemCounts);
        this.emptyText.setVisible(entries.length === 0);

        // Grid layout — 4 columns
        const cols = 4;
        const cellW = 280;
        const cellH = 160;
        const startX = 960 - ((Math.min(entries.length, cols) - 1) * cellW) / 2;
        const startY = 340;

        entries.forEach(([type, count], index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * cellW - (cols - 1) * cellW / 2 + (cols - 1) * cellW / 2;
            const cx = 310 + col * cellW;
            const cy = startY + row * cellH;

            // Item card
            const card = this.add.rectangle(cx, cy, cellW - 20, cellH - 20, 0x2a2a3e, 1)
                .setStrokeStyle(2, 0x555577, 0.9);

            // Icon
            const icon = this.add.image(cx - 70, cy, type)
                .setOrigin(0.5).setScale(2.5);

            // Count
            const txt = this.add.text(cx + 20, cy - 20, `x${count}`, {
                fontSize: '42px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
            }).setOrigin(0.5);

            // Type label
            const label = this.add.text(cx + 20, cy + 28, type, {
                fontSize: '26px', color: '#aaaacc', fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.uiElements.push(card, icon, txt, label);
        });
    }

    returnToMain() {
        this.scene.start('MainScene');
    }
}
