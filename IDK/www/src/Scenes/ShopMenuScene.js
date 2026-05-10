/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class ShopMenuScene extends Phaser.Scene {
    constructor() {
        super('ShopMenuScene');
    }

    init(data) {
        this.playerInventory = this.registry.get('inventory') || [];
        this.placedMachines = data.placedMachines || this.registry.get('placedMachines') || [];
        this.money = data.money ?? this.registry.get('money') ?? 0;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.timeLeft = data.timeLeft ?? this.registry.get('timeLeft') ?? 15000;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];
    }

    create() {
        const machinesForSale = [
            { name: 'Iron Machine',       texture: 'machine_iron',       produces: 'iron',       price: 50   },
            { name: 'Copper Machine',     texture: 'machine_copper',     produces: 'copper',     price: 75   },
            { name: 'Steel Machine',      texture: 'machine_steel',      produces: 'steel',      price: 100  },
            { name: 'Amethyst Machine',   texture: 'machine_amethyst',   produces: 'amethyst',   price: 200  },
            { name: 'Emerald Machine',    texture: 'machine_emerald',    produces: 'emerald',    price: 300  },
            { name: 'MagmaStone Machine', texture: 'machine_magmastone', produces: 'magmastone', price: 450  },
            { name: 'Quartz Machine',     texture: 'machine_quartz',     produces: 'quartz',     price: 700  },
            { name: 'Titanium Machine',   texture: 'machine_titanium',   produces: 'titanium',   price: 1000 }
        ];

        // Dark overlay
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.5);

        // Panel — large, centered
        const panelW = 1500;
        const panelH = 900;
        this.add.rectangle(960, 520, panelW, panelH, 0x1e1e2e, 0.97)
            .setStrokeStyle(4, 0x4499ff, 0.8);

        // Title
        this.add.text(960, 105, '🛒  Machine Shop', {
            fontSize: '52px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Money
        this.moneyText = this.add.text(960, 170, `💰  $${this.money}`, {
            fontSize: '40px', color: '#ffff00', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Divider
        this.add.rectangle(960, 205, 1400, 3, 0x4499ff, 0.5);

        // Machine rows — two columns
        const colX = [550, 1370];
        machinesForSale.forEach((machine, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = colX[col];
            const y = 350 + row * 150;

            // Row background
            this.add.rectangle(x, y, 625, 130, 0x2a2a3e, 1)
                .setStrokeStyle(2, 0x444466, 0.8);

            // Machine icon
            this.add.image(x - 270, y, machine.texture).setScale(0.85).setOrigin(0.5);

            // Name & price
            this.add.text(x - 190, y - 28, machine.name, {
                fontSize: '28px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
            });
            this.add.text(x - 190, y + 10, `$${machine.price}`, {
                fontSize: '28px', color: '#ffdd44', fontFamily: 'Arial'
            });

            // Buy button
            const buyBtn = this.add.rectangle(x + 225, y, 140, 80, 0x1a7a1a, 1)
                .setStrokeStyle(2, 0x44ff44, 0.7)
                .setInteractive({ useHandCursor: true });

            this.add.text(x + 240, y, 'BUY', {
                fontSize: '30px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
            }).setOrigin(0.5);

            buyBtn.on('pointerover', () => buyBtn.setFillStyle(0x22aa22));
            buyBtn.on('pointerout',  () => buyBtn.setFillStyle(0x1a7a1a));
            buyBtn.on('pointerdown', () => {
                if (this.money >= machine.price) {
                    this.money -= machine.price;
                    this.playerInventory.push({ ...machine });
                    this.moneyText.setText(`💰  $${this.money}`);
                    this.registry.set('money', this.money);
                    this.registry.set('inventory', this.playerInventory);
                }
            });
        });

        // Back button
        const closeBtn = this.add.rectangle(960, 965, 380, 90, 0x8b0000, 1)
            .setStrokeStyle(3, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });

        this.add.text(960, 965, '← Back', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xaa0000));
        closeBtn.on('pointerout',  () => closeBtn.setFillStyle(0x8b0000));
        closeBtn.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());
    }

    returnToMain() {
        this.scene.start('MainScene', {
            machines: this.placedMachines,
            money: this.money,
            isNight: this.isNight,
            timeLeft: this.timeLeft,
            villageRequests: this.villageRequests
        });
    }
}
