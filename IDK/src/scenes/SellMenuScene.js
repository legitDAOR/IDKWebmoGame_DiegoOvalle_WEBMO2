export default class SellMenuScene extends Phaser.Scene {
    constructor() {
        super('SellMenuScene');
    }

    init(data) {
        // Basic data handling
        this.inventory = data.inventory || this.registry.get('inventory') || [];
        this.money = data.money ?? this.registry.get('money') ?? 0;
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.timeLeft = data.timeLeft ?? this.registry.get('timeLeft') ?? 15000;
        this.buildingIndex = data.buildingIndex ?? 0;

        this.villageRequests = this.registry.get('villageRequests') || [];
        this.wants = this.villageRequests[this.buildingIndex] || 'iron';

        this.villagerNames = ['Aeron', 'Branna', 'Cael', 'Eira', 'Lorcan', 'Saoirse'];

        this.basePrices = {
            iron: 20, copper: 40, steel: 60, amethyst: 100,
            emerald: 150, magmastone: 200, quartz: 300, titanium: 500
        };

        this.uiElements = [];
    }

    create() {
        // Request box and basic layout
        const panel = this.add.rectangle(960, 540, 600, 360, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff, 0.5);

        const villagerName = this.villagerNames[this.buildingIndex % this.villagerNames.length];

        this.add.text(780, 420, `${villagerName}'s Request`, {
            fontSize: '32px', color: '#ffffff', fontFamily: 'Arial'
        });

        this.add.image(750, 480, `villager_${villagerName.toLowerCase()}`).setScale(1.5);

        this.add.text(800, 480, `"Do you have any ${this.wants}? I'll pay well!"`, {
            fontSize: '24px', color: '#ffffaa', fontFamily: 'Arial'
        });

        this.drawInventoryInfo();

        // Close button
        const closeButton = this.add.rectangle(960, 660, 160, 40, 0xaa0000, 1)
            .setInteractive({ useHandCursor: true });

        this.add.text(920, 647, 'Leave', {
            fontSize: '20px', color: '#ffffff'
        });

        closeButton.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());
    }

    drawInventoryInfo() {
        // Clean up previous UI
        this.uiElements.forEach(obj => obj.destroy());
        this.uiElements = [];

        const matchingItems = this.inventory.filter(item =>
            item.produces === this.wants || item === this.wants
        );

        const basePrice = this.basePrices[this.wants] || 30;
        const bonusMoney = this.registry.get('upgrade_bonusSales') === true;
        const priceMultiplier = bonusMoney ? 1.25 : 1;
        const finalPrice = Math.floor((this.isNight ? basePrice * 1.5 : basePrice) * priceMultiplier);

        if (matchingItems.length > 0) {
            // Sell one item
            const sellOneBtn = this.add.rectangle(850, 550, 150, 50, 0x00aa00, 1)
                .setInteractive({ useHandCursor: true });
            const sellOneText = this.add.text(810, 537, `Sell 1 for $${finalPrice}`, {
                fontSize: '20px', color: '#ffffff'
            });

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

            // Sell all items
            const totalValue = finalPrice * matchingItems.length;
            const sellAllBtn = this.add.rectangle(1070, 550, 150, 50, 0x0077cc, 1)
                .setInteractive({ useHandCursor: true });
            const sellAllText = this.add.text(1020, 537, `Sell All ($${totalValue})`, {
                fontSize: '20px', color: '#ffffff'
            });

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

        } else {
            const noItemsText = this.add.text(860, 550, 'You have none to sell!', {
                fontSize: '22px', color: '#ff6666'
            });
            this.uiElements.push(noItemsText);
        }
    }

    returnToMain() {
        // Save changes and go back
        this.registry.set('inventory', this.inventory);
        this.registry.set('money', this.money);
        this.scene.start('MainScene');
    }
}
