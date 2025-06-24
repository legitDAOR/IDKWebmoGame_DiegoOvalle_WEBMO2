export default class ShopMenuScene extends Phaser.Scene {
    constructor() {
        super('ShopMenuScene');
    }

    init(data) {
        // Load player data
        this.playerInventory = this.registry.get('inventory') || [];
        this.placedMachines = data.placedMachines || this.registry.get('placedMachines') || [];
        this.money = data.money ?? this.registry.get('money') ?? 0;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.timeLeft = data.timeLeft ?? this.registry.get('timeLeft') ?? 15000;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];
    }

    create() {
        // Available machines to purchase
        const machinesForSale = [
            { name: 'Iron Machine', texture: 'machine_iron', produces: 'iron', price: 50 },
            { name: 'Copper Machine', texture: 'machine_copper', produces: 'copper', price: 75 },
            { name: 'Steel Machine', texture: 'machine_steel', produces: 'steel', price: 100 },
            { name: 'Amethyst Machine', texture: 'machine_amethyst', produces: 'amethyst', price: 200 },
            { name: 'Emerald Machine', texture: 'machine_emerald', produces: 'emerald', price: 300 },
            { name: 'MagmaStone Machine', texture: 'machine_magmastone', produces: 'magmastone', price: 450 },
            { name: 'Quartz Machine', texture: 'machine_quartz', produces: 'quartz', price: 700 },
            { name: 'Titanium Machine', texture: 'machine_titanium', produces: 'titanium', price: 1000 }
        ];

        // Shop panel
        this.add.rectangle(960, 540, 900, 800, 0x333333, 0.95).setStrokeStyle(4, 0xffffff, 0.5);

        // Shop title
        this.add.text(720, 180, 'Shop - Buy Machines', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });

        // Money display
        this.moneyText = this.add.text(720, 130, `$${this.money}`, {
            fontSize: '26px',
            color: '#ffff00',
            fontFamily: 'Arial'
        });

        // List all machines for sale
        machinesForSale.forEach((machine, i) => {
            const y = 260 + i * 80;

            // Machine icon
            const icon = this.add.image(680, y, machine.texture)
                .setScale(0.7)
                .setOrigin(0.5);

            // Machine label and price
            this.add.text(740, y - 15, `${machine.name} - $${machine.price}`, {
                fontSize: '22px',
                color: '#ffffff'
            });

            // Buy button
            const buyBtn = this.add.rectangle(1120, y, 100, 40, 0x008800, 1)
                .setInteractive({ useHandCursor: true });

            this.add.text(1090, y - 12, 'Buy', {
                fontSize: '20px',
                color: '#ffffff'
            });

            buyBtn.on('pointerdown', () => {
                if (this.money >= machine.price) {
                    this.money -= machine.price;
                    this.playerInventory.push({ ...machine });
                    this.moneyText.setText(`$${this.money}`);

                    // Save updated inventory and money
                    this.registry.set('money', this.money);
                    this.registry.set('inventory', this.playerInventory);
                }
            });
        });

        // Back button
        const closeButton = this.add.rectangle(960, 900, 160, 40, 0xaa0000, 1)
            .setInteractive({ useHandCursor: true });

        this.add.text(920, 888, 'Back', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });

        closeButton.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());
    }

    // Return to MainScene
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
