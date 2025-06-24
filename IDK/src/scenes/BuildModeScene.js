export default class BuildModeScene extends Phaser.Scene {
    constructor() {
        super('BuildModeScene');
    }

    init(data) {
        // Load player data
        this.placedMachines = data.machines || this.registry.get('placedMachines') || [];
        this.playerInventory = data.playerInventory || this.registry.get('inventory') || [];
        this.money = data.money ?? this.registry.get('money') ?? 100;
        this.isNight = data.isNight ?? this.registry.get('isNight') ?? false;
        this.timeLeft = data.timeLeft ?? this.registry.get('timeLeft') ?? 15000;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];

        // Grid and selection setup
        this.selectedMachine = null;
        this.gridStartX = 600;
        this.gridStartY = 400;
        this.gridCols = 5;
        this.gridRows = 3;
        this.cellSize = 128;
        this.grid = [];
        this.machineUI = [];
    }

    create() {
        // Background
        for (let y = 0; y < 2160; y += 256) {
            for (let x = 0; x < 3840; x += 256) {
                this.add.image(x, y, 'land_1').setOrigin(0);
            }
        }
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 3840);
            const y = Phaser.Math.Between(0, 2160);
            this.add.image(x, y, 'land_2').setOrigin(0.5);
        }

        this.createBuildGrid();

        // Existing machines
        this.placedMachines.forEach(machine => {
            this.add.image(machine.x, machine.y, machine.texture).setScale(1.2);
        });

        // Money UI
        this.moneyText = this.add.text(30, 30, `$${this.money}`, {
            fontSize: '28px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        // Machine selection box, adjusts height based on inventory
        const iconsPerRow = 6;
        const rowsNeeded = Math.ceil(this.playerInventory.length / iconsPerRow) || 1;
        const menuHeight = 120 + rowsNeeded * 100;

        this.add.rectangle(960, 960, 1000, menuHeight, 0x111111, 0.85)
            .setStrokeStyle(2, 0xffffff, 0.3)
            .setScrollFactor(0);

        this.add.text(480, 870, 'Select a machine to place:', {
            fontSize: '26px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        this.drawMachineSelection();

        // Cancel button
        const closeButton = this.add.rectangle(1800, 1000, 160, 40, 0xaa0000, 1)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);

        this.add.text(1760, 987, 'Cancel', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setScrollFactor(0);

        closeButton.on('pointerdown', () => this.returnToMainScene());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMainScene());

        this.cameras.main.setBounds(0, 0, 3840, 2160);
        this.enableCameraDrag();
    }

    // Grid creation with interactive cells
    createBuildGrid() {
        for (let row = 0; row < this.gridRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridCols; col++) {
                const x = this.gridStartX + col * this.cellSize;
                const y = this.gridStartY + row * this.cellSize;

                const cell = this.add.rectangle(x, y, this.cellSize - 4, this.cellSize - 4, 0x00ff00, 0.15)
                    .setStrokeStyle(2, 0x00ff00, 0.8)
                    .setOrigin(0.5)
                    .setInteractive()
                    .setDepth(5);

                cell.occupied = this.placedMachines.some(m => m.x === x && m.y === y);

                cell.on('pointerdown', () => {
                    if (!this.selectedMachine || cell.occupied) return;

                    // Place machine on grid
                    this.add.image(x, y, this.selectedMachine.texture).setScale(1.2);

                    const newMachine = {
                        x,
                        y,
                        texture: this.selectedMachine.texture,
                        produces: this.selectedMachine.produces,
                        cooldown: this.getCooldown(this.selectedMachine.produces),
                        maxStorage: 10,
                        storage: 0,
                        lastProduced: Date.now()
                    };

                    this.placedMachines.push(newMachine);

                    const index = this.playerInventory.indexOf(this.selectedMachine);
                    if (index !== -1) {
                        this.playerInventory.splice(index, 1);
                    }

                    this.registry.set('placedMachines', this.placedMachines);
                    this.registry.set('inventory', this.playerInventory);

                    this.selectedMachine = null;
                    cell.occupied = true;
                    this.refreshMachineSelection();
                });

                this.grid[row][col] = cell;
            }
        }
    }

    // Different cooldowns per product
    getCooldown(product) {
        switch (product) {
            case 'iron': return 5000;
            case 'copper': return 7000;
            case 'steel': return 10000;
            case 'amethyst': return 15000;
            case 'emerald': return 20000;
            case 'magmaston': return 25000;
            case 'quartz': return 30000;
            case 'titanium': return 40000;
            default: return 5000;
        }
    }

    // Display machine inventory at bottom of screen
    drawMachineSelection() {
        this.machineUI.forEach(obj => obj.destroy());
        this.machineUI = [];

        const iconsPerRow = 6;

        this.playerInventory.forEach((item, i) => {
            const col = i % iconsPerRow;
            const row = Math.floor(i / iconsPerRow);

            const x = 480 + col * 150;
            const y = 950 + row * 100;

            const preview = this.add.image(x, y, item.texture)
                .setScale(0.5)
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0);

            preview.on('pointerdown', () => {
                this.selectedMachine = item;
            });

            this.machineUI.push(preview);
        });
    }

    refreshMachineSelection() {
        this.drawMachineSelection();
    }

    // Return to main scene
    returnToMainScene() {
        this.scene.start('MainScene', {
            machines: this.placedMachines,
            inventory: this.playerInventory,
            money: this.money,
            isNight: this.isNight,
            timeLeft: this.timeLeft,
            villageRequests: this.villageRequests
        });
    }

    // Camera drag movement
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
