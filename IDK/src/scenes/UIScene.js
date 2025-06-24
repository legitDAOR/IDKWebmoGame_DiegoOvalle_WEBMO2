export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Semi-transparent background covering whole screen
        this.background = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.5);

        const menuWidth = 700;
        const menuHeight = 500;

        // Main upgrade menu background
        this.menu = this.add.rectangle(960, 540, menuWidth, menuHeight, 0x333333, 0.95)
            .setStrokeStyle(4, 0xffffff, 0.8);

        // Menu Title
        this.add.text(960, 340, 'Upgrade Tree', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Upgrade list with prerequisites
        this.upgrades = [
            { name: 'Faster Production', price: 500, unlocked: false, prerequisite: null },
            { name: 'Extra Storage', price: 1000, unlocked: false, prerequisite: 0 },
            { name: 'Double Income', price: 2000, unlocked: false, prerequisite: 1 },
            { name: 'End of Game', price: 7000, unlocked: false, prerequisite: 2 }
        ];

        // Load unlocked upgrades and player money
        this.registryUpgrades = this.registry.get('unlockedUpgrades') || [];
        this.money = this.registry.get('money') || 0;

        this.drawUpgrades();

        // Money display
        this.moneyText = this.add.text(960, 310, `$${this.money}`, {
            fontSize: '28px',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Close menu on ESC
        this.input.keyboard.on('keydown-ESC', () => this.returnToMain());

        // Close menu if clicking outside the menu box
        this.input.on('pointerdown', (pointer) => {
            if (!this.menu.getBounds().contains(pointer.x, pointer.y)) {
                this.returnToMain();
            }
        });
    }

    drawUpgrades() {
        const startY = 390;
        const spacing = 80;

        // Loop through upgrades and render them
        this.upgrades.forEach((upg, index) => {
            const y = startY + index * spacing;

            const unlocked = this.registryUpgrades.includes(index);
            const prerequisiteMet = upg.prerequisite === null || this.registryUpgrades.includes(upg.prerequisite);
            const available = prerequisiteMet && !unlocked;

            const textColor = unlocked ? '#00ff00' : (available ? '#ffffff' : '#888888');

            // Upgrade label
            this.add.text(780, y, `${upg.name} - $${upg.price}`, {
                fontSize: '24px',
                color: textColor,
                fontFamily: 'Arial'
            });

            // If upgrade is available, show Buy button
            if (available) {
                const buyBtn = this.add.rectangle(1120, y + 10, 100, 40, 0x008800, 1)
                    .setInteractive({ useHandCursor: true });

                this.add.text(1090, y, 'Buy', {
                    fontSize: '20px',
                    color: '#ffffff'
                });

                buyBtn.on('pointerdown', () => {
                    if (this.money >= upg.price) {
                        this.money -= upg.price;
                        this.registryUpgrades.push(index);
                        this.registry.set('money', this.money);
                        this.registry.set('unlockedUpgrades', this.registryUpgrades);

                        // End of Game upgrade
                        if (index === 3) {
                            alert('Congratulations! You completed the game!');
                        }

                        // Refresh menu after purchase
                        this.scene.restart();
                    }
                });
            }
        });
    }

    returnToMain() {
        this.scene.start('MainScene');
    }
}
