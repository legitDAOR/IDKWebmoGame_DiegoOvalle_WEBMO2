/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class SellMenuScene extends Phaser.Scene {
    constructor() {
        super('SellMenuScene');
    }

    init(data) {
        this.inventory = data.inventory || this.registry.get('inventory') || [];
        this.money = data.money ?? this.registry.get('money') ?? 0;
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.timeLeft = data.timeLeft ?? this.registry.get('timeLeft') ?? 15000;
        this.buildingIndex = data.buildingIndex ?? 0;

        this.villageRequests = this.registry.get('villageRequests') || [];
        this.wants = this.villageRequests[this.buildingIndex] || 'iron';

        this.villagerNames = ['aeron', 'branna', 'cael', 'eira', 'lorcan', 'saoirse'];

        this.basePrices = {
            iron: 20, copper: 40, steel: 60, amethyst: 100,
            emerald: 150, magmastone: 200, quartz: 300, titanium: 500
        };

        this.uiElements = [];
    }

    create() {
        const villagerName = this.villagerNames[this.buildingIndex % this.villagerNames.length];

        // Dark overlay
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.55);

        // Panel
        this.add.rectangle(960, 510, 1400, 820, 0x1e1e2e, 0.97)
            .setStrokeStyle(4, 0xffcc44, 0.8);

        // Villager name title
        this.add.text(960, 135, `${villagerName}'s Request`, {
            fontSize: '52px', color: '#ffdd88', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Divider
        this.add.rectangle(960, 165, 1300, 3, 0xffcc44, 0.5);

        // Villager portrait — larger
        this.add.image(430, 350, `villager_${villagerName.toLowerCase()}`)
            .setScale(3.5).setOrigin(0.5);

        // Decorative portrait frame
        this.add.rectangle(430, 350, 220, 280, 0x2a2a1e, 0)
            .setStrokeStyle(4, 0xffcc44, 0.6);

        // Speech bubble background
        this.add.rectangle(1050, 350, 900, 140, 0x2a2a1e, 0.9)
            .setStrokeStyle(3, 0xffffaa, 0.6);

        // Villager speech
        this.add.text(1050, 350,
            `"Do you have any ${this.wants}?\n  I'll pay well!"`, {
            fontSize: '30px', color: '#ffffcc', fontFamily: 'Arial',
            align: 'center', lineSpacing: 8
        }).setOrigin(0.5);

        // Wanted item icon
        this.add.text(900, 465, 'Wants: ', {
            fontSize: '28px', color: '#aaaaaa', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.image(980, 465, this.wants).setScale(2.5).setOrigin(0.5);

        this.add.text(1025, 465, this.wants, {
            fontSize: '28px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Night bonus label
        if (this.isNight) {
            this.add.text(1000, 225, '🌙 Night Bonus Active! (1.5x)', {
                fontSize: '26px', color: '#88aaff', fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        // Sell buttons area
        this.drawInventoryInfo();

        // Back button
        const closeBtn = this.add.rectangle(960, 890, 380, 90, 0x8b0000, 1)
            .setStrokeStyle(3, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });

        this.add.text(960, 890, '← Leave', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xaa0000));
        closeBtn.on('pointerout',  () => closeBtn.setFillStyle(0x8b0000));
        closeBtn.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());
    }

    drawInventoryInfo() {
        this.uiElements.forEach(obj => obj.destroy());
        this.uiElements = [];

        const matchingItems = this.inventory.filter(item =>
            item.produces === this.wants || item === this.wants
        );
        
        // Price calculation????
        const basePrice = this.basePrices[this.wants] || 30;
        const bonusMoney = this.registry.get('upgrade_bonusSales') === true;
        const priceMultiplier = bonusMoney ? 1.25 : 1;
        const finalPrice = Math.floor((this.isNight ? basePrice * 1.5 : basePrice) * priceMultiplier);

        // Stock count
        const stockText = this.add.text(960, 570,
            matchingItems.length > 0
                ? `You have ${matchingItems.length}× ${this.wants}`
                : `You have no ${this.wants} to sell`, {
            fontSize: '34px',
            color: matchingItems.length > 0 ? '#aaffaa' : '#ff8888',
            fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.uiElements.push(stockText);

        if (matchingItems.length > 0) {
            const totalValue = finalPrice * matchingItems.length;

            // Sell One button
            const sellOneBtn = this.add.rectangle(700, 700, 420, 110, 0x1a7a1a, 1)
                .setStrokeStyle(3, 0x44ff44, 0.8)
                .setInteractive({ useHandCursor: true });

            const sellOneText = this.add.text(700, 700,
                `Sell 1\n$${finalPrice}`, {
                fontSize: '34px', color: '#ffffff', fontFamily: 'Arial',
                fontStyle: 'bold', align: 'center'
            }).setOrigin(0.5);

            sellOneBtn.on('pointerover', () => sellOneBtn.setFillStyle(0x22aa22));
            sellOneBtn.on('pointerout',  () => sellOneBtn.setFillStyle(0x1a7a1a));
            sellOneBtn.on('pointerdown', () => {
                const index = this.inventory.findIndex(item =>
                    item.produces === this.wants || item === this.wants
                );
                if (index !== -1) {
                    this.inventory.splice(index, 1);
                    this.money += finalPrice;
                    this.registry.set('inventory', this.inventory);
                    this.registry.set('money', this.money);
                    this.drawInventoryInfo();
                }
            });

            // Sell All button
            const sellAllBtn = this.add.rectangle(1220, 700, 420, 110, 0x1a4a8a, 1)
                .setStrokeStyle(3, 0x44aaff, 0.8)
                .setInteractive({ useHandCursor: true });

            const sellAllText = this.add.text(1220, 700,
                `Sell All (${matchingItems.length}×)\n$${totalValue}`, {
                fontSize: '34px', color: '#ffffff', fontFamily: 'Arial',
                fontStyle: 'bold', align: 'center'
            }).setOrigin(0.5);

            sellAllBtn.on('pointerover', () => sellAllBtn.setFillStyle(0x2266aa));
            sellAllBtn.on('pointerout',  () => sellAllBtn.setFillStyle(0x1a4a8a));
            sellAllBtn.on('pointerdown', () => {
                this.inventory = this.inventory.filter(item =>
                    !(item.produces === this.wants || item === this.wants)
                );
                this.money += totalValue;
                this.registry.set('inventory', this.inventory);
                this.registry.set('money', this.money);
                this.drawInventoryInfo();
            });

            this.uiElements.push(sellOneBtn, sellOneText, sellAllBtn, sellAllText);
        }
    }

    returnToMain() {
        this.registry.set('inventory', this.inventory);
        this.registry.set('money', this.money);
        this.scene.start('MainScene');
    }
}
