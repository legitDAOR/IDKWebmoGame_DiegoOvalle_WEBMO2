/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Semi-transparent full overlay
        this.background = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.6);

        // Panel
        const panelW = 1300;
        const panelH = 820;
        this.menu = this.add.rectangle(960, 520, panelW, panelH, 0x1e1e2e, 0.97)
            .setStrokeStyle(4, 0xcc88ff, 0.8);

        // Title
        this.add.text(960, 140, '🏰  Upgrade Tree', {
            fontSize: '52px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Divider
        this.add.rectangle(960, 170, 1200, 3, 0xcc88ff, 0.5);

        // Upgrades data
        this.upgrades = [
            { name: 'Faster Production', desc: 'Machines produce 30% faster', price: 500,  unlocked: false, prerequisite: null, icon: '⚡' },
            { name: 'Extra Storage',     desc: 'Machines store 5 more items', price: 1000, unlocked: false, prerequisite: 0,    icon: '📦' },
            { name: 'Double Income',     desc: 'Earn 25% more on sales',      price: 2000, unlocked: false, prerequisite: 1,    icon: '💰' },
            { name: 'End of Game',       desc: 'You win! Complete the game!', price: 7000, unlocked: false, prerequisite: 2,    icon: '🏆' }
        ];

        this.registryUpgrades = this.registry.get('unlockedUpgrades') || [];
        this.money = this.registry.get('money') || 0;

        // Money display
        this.moneyText = this.add.text(960, 200, `💰  $${this.money}`, {
            fontSize: '38px', color: '#ffff00', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.drawUpgrades();

        // Close button
        const closeBtn = this.add.rectangle(960, 940, 380, 90, 0x8b0000, 1)
            .setStrokeStyle(3, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });

        this.add.text(960, 940, '← Close', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xaa0000));
        closeBtn.on('pointerout',  () => closeBtn.setFillStyle(0x8b0000));
        closeBtn.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());

        // Click outside to close
        this.input.on('pointerdown', (pointer) => {
            if (!this.menu.getBounds().contains(pointer.x, pointer.y)) {
                this.returnToMain();
            }
        });
    }

    drawUpgrades() {
        const startY = 290;
        const spacing = 155;

        this.upgrades.forEach((upg, index) => {
            const y = startY + index * spacing;

            const unlocked = this.registryUpgrades.includes(index);
            const prerequisiteMet = upg.prerequisite === null || this.registryUpgrades.includes(upg.prerequisite);
            const available = prerequisiteMet && !unlocked;

            // Row card
            const cardColor = unlocked ? 0x1a3a1a : (available ? 0x2a2a3e : 0x1a1a2a);
            const borderColor = unlocked ? 0x44ff44 : (available ? 0xaa88ff : 0x444455);

            this.add.rectangle(960, y, 1200, 130, cardColor, 1)
                .setStrokeStyle(2, borderColor, 0.8);

            // Icon
            this.add.text(400, y, upg.icon, { fontSize: '48px' }).setOrigin(0.5);

            // Name
            const nameColor = unlocked ? '#44ff44' : (available ? '#ffffff' : '#666677');
            this.add.text(480, y - 28, upg.name, {
                fontSize: '34px', color: nameColor, fontFamily: 'Arial', fontStyle: 'bold'
            });

            // Description
            this.add.text(480, y + 14, upg.desc, {
                fontSize: '24px', color: '#aaaacc', fontFamily: 'Arial'
            });

            // Status or buy button
            if (unlocked) {
                this.add.text(1380, y, '✅ Owned', {
                    fontSize: '28px', color: '#44ff44', fontFamily: 'Arial', fontStyle: 'bold'
                }).setOrigin(0.5);

            } else if (!prerequisiteMet) {
                this.add.text(1380, y, '🔒 Locked', {
                    fontSize: '28px', color: '#666666', fontFamily: 'Arial'
                }).setOrigin(0.5);

            } else {
                // Buy button
                const buyBtn = this.add.rectangle(1380, y, 220, 90, 0x5522aa, 1)
                    .setStrokeStyle(2, 0xcc88ff, 0.8)
                    .setInteractive({ useHandCursor: true });

                this.add.text(1380, y - 18, `BUY`, {
                    fontSize: '30px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
                }).setOrigin(0.5);

                this.add.text(1380, y + 22, `$${upg.price}`, {
                    fontSize: '26px', color: '#ffdd44', fontFamily: 'Arial'
                }).setOrigin(0.5);

                buyBtn.on('pointerover', () => buyBtn.setFillStyle(0x7733cc));
                buyBtn.on('pointerout',  () => buyBtn.setFillStyle(0x5522aa));
                buyBtn.on('pointerdown', () => {
                    if (this.money >= upg.price) {
                        this.money -= upg.price;
                        this.registryUpgrades.push(index);
                        this.registry.set('money', this.money);
                        this.registry.set('unlockedUpgrades', this.registryUpgrades);

                        if (index === 3) {
                            alert('🏆 Congratulations! You completed the game!');
                        }

                        this.scene.restart();
                    }
                });
            }
        });
    }

    returnToMain() {
        this.scene.stop();
        this.scene.resume('MainScene');
    }
}
