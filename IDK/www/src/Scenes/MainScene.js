/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    init(data) {
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.playerInventory = data.inventory || this.registry.get('inventory') || [];
        this.money = data.money !== undefined ? data.money : this.registry.get('money') || 100;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];
    }

    create() {
        // Background
        for (let y = 0; y < 2160; y += 256) {
            for (let x = 0; x < 3840; x += 256) {
                this.add.image(x, y, 'land_1').setOrigin(0);
            }
        }
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 3840);
            const y = Phaser.Math.Between(0, 2160);
            this.add.image(x, y, 'land_2').setOrigin(0.5);
        }

        // Tower
        this.tower = this.add.image(300, 540, 'PlayerTower')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.tower.on('pointerdown', () => {
            this.scene.launch('UIScene');
            this.scene.pause();
        });

        // Village buildings
        const buildingPositions = [
            { x: 1300, y: 600 }, { x: 1500, y: 800 }, { x: 1700, y: 500 },
            { x: 1900, y: 700 }, { x: 2100, y: 900 }, { x: 2300, y: 600 }
        ];

        const possibleItems = ['iron', 'copper', 'steel', 'amethyst', 'emerald', 'magmastone', 'quartz', 'titanium'];
        if (this.villageRequests.length !== buildingPositions.length) {
            this.villageRequests = buildingPositions.map(() => Phaser.Utils.Array.GetRandom(possibleItems));
            this.registry.set('villageRequests', this.villageRequests);
        }

        buildingPositions.forEach((pos, i) => {
            const house = this.add.image(pos.x, pos.y, `building_${i + 1}`)
                .setOrigin(0.5).setScale(0.5).setInteractive({ useHandCursor: true });

            house.on('pointerdown', () => {
                this.scene.start('SellMenuScene', {
                    inventory: this.playerInventory,
                    money: this.money,
                    machines: this.placedMachines,
                    buildingIndex: i,
                    isNight: this.isNight,
                    villageRequests: this.villageRequests
                });
            });
        });

        // Placed machines
        this.placedMachines.forEach(machine => {
            this.add.image(machine.x, machine.y, machine.texture).setScale(1.2);
        });

        // ── TOP HUD ─────────────────────────────────────────────────────────
        // Money display — top left
        const moneyBg = this.add.rectangle(180, 50, 320, 80, 0x000000, 0.6)
            .setScrollFactor(0).setDepth(100).setStrokeStyle(2, 0xffff00, 0.6);

        this.moneyText = this.add.text(180, 50, `💰 $${this.money}`, {
            fontSize: '38px', fill: '#ffff00', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // Day/Night — top center
        this.dayText = this.add.text(960, 50, this.isNight ? '🌙 Night' : '☀️ Day', {
            fontSize: '38px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // Night overlay
        this.dayOverlay = this.add.rectangle(0, 0, 3840, 2160, 0x000033, 0.45)
            .setOrigin(0).setScrollFactor(0).setDepth(99).setVisible(this.isNight);

        // ── BOTTOM NAV BAR ───────────────────────────────────────────────────
        const btnY = 1020;
        const btnW = 520;
        const btnH = 100;
        const btnRadius = 16;

        // Bar background
        this.add.rectangle(960, btnY, 1920, btnH + 40, 0x111111, 0.85)
            .setScrollFactor(0).setDepth(100);

        // BUILD button
        const buildBtn = this.add.rectangle(270, btnY, btnW, btnH, 0x1a5c1a, 1)
            .setScrollFactor(0).setDepth(101)
            .setStrokeStyle(3, 0x44ff44, 0.9)
            .setInteractive({ useHandCursor: true });

        this.add.text(270, btnY, '🔨  Build', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        buildBtn.on('pointerdown', () => {
            this.scene.start('BuildModeScene', {
                machines: this.placedMachines,
                playerInventory: this.playerInventory,
                money: this.money,
                isNight: this.isNight,
                villageRequests: this.villageRequests
            });
        });

        // SHOP button
        const shopBtn = this.add.rectangle(960, btnY, btnW, btnH, 0x1a3d6e, 1)
            .setScrollFactor(0).setDepth(101)
            .setStrokeStyle(3, 0x4499ff, 0.9)
            .setInteractive({ useHandCursor: true });

        this.add.text(960, btnY, '🛒  Shop', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        shopBtn.on('pointerdown', () => {
            this.scene.start('ShopMenuScene', {
                playerInventory: this.playerInventory,
                placedMachines: this.placedMachines,
                money: this.money,
                isNight: this.isNight,
                villageRequests: this.villageRequests
            });
        });

        // INVENTORY button
        const invBtn = this.add.rectangle(1650, btnY, btnW, btnH, 0x6e3a1a, 1)
            .setScrollFactor(0).setDepth(101)
            .setStrokeStyle(3, 0xff9944, 0.9)
            .setInteractive({ useHandCursor: true });

        this.add.text(1650, btnY, '🎒  Inventory', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        invBtn.on('pointerdown', () => {
            this.scene.start('InventoryScene', {
                inventory: this.playerInventory,
                machines: this.placedMachines,
                money: this.money,
                isNight: this.isNight,
                villageRequests: this.villageRequests
            });
        });

        // Button press feedback
        [buildBtn, shopBtn, invBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setAlpha(0.75));
            btn.on('pointerout', () => btn.setAlpha(1));
        });

        // ── EVENTS & CAMERA ──────────────────────────────────────────────────
        this.events.on('wake', this.syncFromGameManager, this);
        this.syncFromGameManager();

        this.cameras.main.setBounds(0, 0, 3840, 2160);
        this.enableCameraDrag();
    }

    syncFromGameManager() {
        this.money = this.registry.get('money');
        this.playerInventory = this.registry.get('inventory') || [];
        this.placedMachines = this.registry.get('placedMachines') || [];
        this.isNight = this.registry.get('isNight');
        this.villageRequests = this.registry.get('villageRequests') || [];

        this.moneyText.setText(`💰 $${this.money}`);
        this.dayOverlay.setVisible(this.isNight);
        this.dayText.setText(this.isNight ? '🌙 Night' : '☀️ Day');
    }

    enableCameraDrag() {
        this.isDragging = false;
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y);
        });
        this.input.on('pointerup', () => { this.isDragging = false; });
        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;
            const cam = this.cameras.main;
            cam.scrollX -= (pointer.x - this.dragStart.x) / cam.zoom;
            cam.scrollY -= (pointer.y - this.dragStart.y) / cam.zoom;
            this.dragStart.set(pointer.x, pointer.y);
        });
    }
}
