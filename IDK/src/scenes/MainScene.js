export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    init(data) {
        // Load or set up game state
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.playerInventory = data.inventory || this.registry.get('inventory') || [];
        this.money = data.money !== undefined ? data.money : this.registry.get('money') || 100;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];
    }

    create() {
        // Place background
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

        // Tower setup
        this.tower = this.add.image(300, 540, 'PlayerTower')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.tower.on('pointerdown', () => {
            this.scene.launch('UIScene'); 
            this.scene.pause();
        });

        // Village houses with random requests
        const buildingPositions = [
            { x: 1300, y: 600 },
            { x: 1500, y: 800 },
            { x: 1700, y: 500 },
            { x: 1900, y: 700 },
            { x: 2100, y: 900 },
            { x: 2300, y: 600 }
        ];

        const possibleItems = ['iron', 'copper', 'steel', 'amethyst', 'emerald', 'magmastone', 'quartz', 'titanium'];
        if (this.villageRequests.length !== buildingPositions.length) {
            this.villageRequests = buildingPositions.map(() =>
                Phaser.Utils.Array.GetRandom(possibleItems)
            );
            this.registry.set('villageRequests', this.villageRequests);
        }

        buildingPositions.forEach((pos, i) => {
            const house = this.add.image(pos.x, pos.y, `building_${i + 1}`)
                .setOrigin(0.5)
                .setScale(0.5)
                .setInteractive({ useHandCursor: true });

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

        // Place existing machines
        this.placedMachines.forEach(machine => {
            this.add.image(machine.x, machine.y, machine.texture).setScale(1.2);
        });

        // HUD Panel
        const hudPanel = this.add.rectangle(160, 80, 300, 160, 0x000000, 0.5);
        hudPanel.setStrokeStyle(2, 0xffffff, 0.4);

        // Build Mode Button
        this.add.text(60, 30, 'Build', { fontSize: '24px', fill: '#ffffff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('BuildModeScene', {
                    machines: this.placedMachines,
                    playerInventory: this.playerInventory,
                    money: this.money,
                    isNight: this.isNight,
                    villageRequests: this.villageRequests
                });
            });

        // Shop Button
        this.add.text(60, 60, 'Shop', { fontSize: '24px', fill: '#ffffff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('ShopMenuScene', {
                    playerInventory: this.playerInventory,
                    placedMachines: this.placedMachines,
                    money: this.money,
                    isNight: this.isNight,
                    villageRequests: this.villageRequests
                });
            });

        // Inventory Button
        this.add.text(60, 90, 'Inventory', { fontSize: '24px', fill: '#ffffff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('InventoryScene', {
                    inventory: this.playerInventory,
                    machines: this.placedMachines,
                    money: this.money,
                    isNight: this.isNight,
                    villageRequests: this.villageRequests
                });
            });

        // Money Display
        this.moneyText = this.add.text(60, 120, `Money: $${this.money}`, {
            fontSize: '24px',
            fill: '#ffff00'
        });

        // Night Overlay and Day/Night Text
        this.dayOverlay = this.add.rectangle(0, 0, 3840, 2160, 0x000000, 0.4)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(999)
            .setVisible(this.isNight);

        this.dayText = this.add.text(1700, 30, this.isNight ? '🌙 Night' : '☀️ Day', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(1000);

        // Listen for registry updates when scene wakes
        this.events.on('wake', this.syncFromGameManager, this);
        this.syncFromGameManager();

        // Enable world drag
        this.cameras.main.setBounds(0, 0, 3840, 2160);
        this.enableCameraDrag();
    }

    // Sync values from GameManager when resuming
    syncFromGameManager() {
        this.money = this.registry.get('money');
        this.playerInventory = this.registry.get('inventory') || [];
        this.placedMachines = this.registry.get('placedMachines') || [];
        this.isNight = this.registry.get('isNight');
        this.villageRequests = this.registry.get('villageRequests') || [];

        this.moneyText.setText(`Money: $${this.money}`);
        this.dayOverlay.setVisible(this.isNight);
        this.dayText.setText(this.isNight ? '🌙 Night' : '☀️ Day');
    }

    // Drag to move camera around the map
    enableCameraDrag() {
        this.isDragging = false;
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y);
        });
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;
            const cam = this.cameras.main;
            cam.scrollX -= (pointer.x - this.dragStart.x) / cam.zoom;
            cam.scrollY -= (pointer.y - this.dragStart.y) / cam.zoom;
            this.dragStart.set(pointer.x, pointer.y);
        });
    }
}
