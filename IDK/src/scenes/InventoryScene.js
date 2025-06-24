export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super('InventoryScene');
    }

    init(data) {
        // Load saved or incoming data
        this.playerInventory = data.inventory || this.registry.get('inventory') || [];
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.money = data.money ?? this.registry.get('money') ?? 0;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];
        this.uiElements = [];  // Dynamic UI cleanup list
    }

    create() {
        // Count each item type in inventory
        const itemCounts = {};
        this.playerInventory.forEach(item => {
            const key = item.produces || item;
            itemCounts[key] = (itemCounts[key] || 0) + 1;
        });

        // Inventory box resizes based on item count
        const visibleItems = Object.keys(itemCounts).length;
        const minHeight = 400;
        const dynamicHeight = 200 + visibleItems * 60;
        const panelHeight = Math.max(minHeight, dynamicHeight);

        const panel = this.add.rectangle(960, 540, 600, panelHeight, 0x2a2a2a, 0.95);
        panel.setStrokeStyle(4, 0xffffff, 0.6);

        this.add.text(780, 300, 'Your Inventory', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        });

        this.moneyText = this.add.text(780, 250, `$${this.money}`, {
            fontSize: '28px',
            color: '#ffff00'
        });

        // Close button at the bottom of the panel
        const closeButton = this.add.rectangle(960, 540 + panelHeight / 2 - 50, 160, 40, 0xaa0000, 1)
            .setInteractive({ useHandCursor: true });

        this.add.text(920, 540 + panelHeight / 2 - 62, 'Close', {
            fontSize: '20px',
            color: '#ffffff'
        });

        closeButton.on('pointerdown', () => this.returnToMain());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());

        this.drawInventory();

        // Refresh inventory every second
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.playerInventory = this.registry.get('inventory') || [];
                this.money = this.registry.get('money') ?? this.money;
                this.moneyText.setText(`$${this.money}`);
                this.drawInventory();
            }
        });
    }

    drawInventory() {
        // Clean old UI
        this.uiElements.forEach(e => e.destroy());
        this.uiElements = [];

        const itemCounts = {};
        this.playerInventory.forEach(item => {
            const key = item.produces || item;
            itemCounts[key] = (itemCounts[key] || 0) + 1;
        });

        let startY = 370;
        Object.entries(itemCounts).forEach(([type, count], index) => {
            const icon = this.add.image(800, startY + index * 60 + 10, type)
                .setOrigin(0.5)
                .setScale(2);

            const txt = this.add.text(840, startY + index * 60, `x${count}`, {
                fontSize: '28px',
                color: '#ffffff',
                fontFamily: 'Arial'
            });

            this.uiElements.push(icon, txt);
        });
    }

    // Back to main scene
    returnToMain() {
        this.scene.start('MainScene');
    }
}
