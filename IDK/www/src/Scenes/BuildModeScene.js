/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class BuildModeScene extends Phaser.Scene {
    constructor() {
        super('BuildModeScene');
    }

    init(data) {
        this.placedMachines  = data.machines       || this.registry.get('placedMachines') || [];
        this.playerInventory = data.playerInventory || this.registry.get('inventory')      || [];
        this.money           = data.money          ?? this.registry.get('money')           ?? 100;
        this.isNight         = data.isNight        ?? this.registry.get('isNight')         ?? false;
        this.timeLeft        = data.timeLeft       ?? this.registry.get('timeLeft')        ?? 15000;
        this.villageRequests = data.villageRequests || this.registry.get('villageRequests') || [];

        this.selectedMachine = null;
        this.mode            = 'place'; // 'place' | 'destroy'

        this.gridStartX = 600;
        this.gridStartY = 400;
        this.gridCols   = 5;
        this.gridRows   = 3;
        this.cellSize   = 128;
        this.grid       = [];
        this.machineUI  = [];
        this.machineSprites = [];

        // Minerals only have { produces }. Machines have { texture, produces, name, price }
        this.getMachinesOnly = () =>
            this.playerInventory.filter(item => item.texture && item.texture.startsWith('machine_'));
    }

    create() {
        // Background
        for (let y = 0; y < 2160; y += 256)
            for (let x = 0; x < 3840; x += 256)
                this.add.image(x, y, 'land_1').setOrigin(0);
        for (let i = 0; i < 20; i++)
            this.add.image(Phaser.Math.Between(0, 3840), Phaser.Math.Between(0, 2160), 'land_2').setOrigin(0.5);

        this.createBuildGrid();

        this.placedMachines.forEach(machine => {
            const sprite = this.add.image(machine.x, machine.y, machine.texture).setScale(1.2);
            this.machineSprites.push({ machine, sprite });
        });

        // ── TOP HUD ──────────────────────────────────────────────────────────
        this.add.rectangle(200, 55, 360, 80, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(100).setStrokeStyle(2, 0xffff00, 0.5);
        this.moneyText = this.add.text(200, 55, `💰 $${this.money}`, {
            fontSize: '36px', fill: '#ffff00', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        this.add.rectangle(870, 55, 460, 80, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(100).setStrokeStyle(2, 0x44ff44, 0.5);
        this.modeLabel = this.add.text(870, 55, '🔨 Place Mode', {
            fontSize: '34px', color: '#44ff44', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        this.hintLabel = this.add.text(870, 130, 'Pick a machine below, then tap a green grid cell', {
            fontSize: '27px', color: '#cccccc', fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // ── MODE TOGGLE ───────────────────────────────────────────────────────
        this.placeBtn = this.add.rectangle(1300, 55, 210, 70, 0x1a5c1a, 1)
            .setScrollFactor(0).setDepth(101)
            .setStrokeStyle(3, 0x44ff44, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(1300, 55, '🔨 Place', {
            fontSize: '27px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.destroyBtn = this.add.rectangle(1550, 55, 230, 70, 0x2a2a2a, 1)
            .setScrollFactor(0).setDepth(101)
            .setStrokeStyle(3, 0x666666, 0.6)
            .setInteractive({ useHandCursor: true });
        this.destroyBtnLabel = this.add.text(1550, 55, '💥 Destroy', {
            fontSize: '27px', color: '#aaaaaa', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.placeBtn.on('pointerdown',   () => this.setMode('place'));
        this.destroyBtn.on('pointerdown', () => this.setMode('destroy'));

        // ── BACK BUTTON ───────────────────────────────────────────────────────
        const backBtn = this.add.rectangle(1800, 55, 220, 70, 0x8b0000, 1)
            .setScrollFactor(0).setDepth(101)
            .setStrokeStyle(2, 0xff4444, 0.8)
            .setInteractive({ useHandCursor: true });
        this.add.text(1800, 55, '← Back', {
            fontSize: '27px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        backBtn.on('pointerover', () => backBtn.setFillStyle(0xaa0000));
        backBtn.on('pointerout',  () => backBtn.setFillStyle(0x8b0000));
        backBtn.on('pointerdown', () => this.returnToMainScene());
        this.input.keyboard.on('keydown-ESC', () => this.returnToMainScene());

        // ── BOTTOM TRAY ───────────────────────────────────────────────────────
        this.trayTopY = 1000; // tray occupies 880–1080
        this.trayMidY = 980;

        this.add.rectangle(960, this.trayMidY, 1920, 300, 0x111122, 0.93)
            .setScrollFactor(0).setDepth(100)
            .setStrokeStyle(3, 0x4444aa, 0.7);

        this.trayLabel = this.add.text(40, this.trayTopY - 150, 'Machines in inventory:', {
            fontSize: '25px', color: '#aaaacc', fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(101);

        this.drawMachineSelection();

        this.cameras.main.setBounds(0, 0, 3840, 2160);
        this.enableCameraDrag();
    }

    // ── MODE SWITCHING ────────────────────────────────────────────────────────
    setMode(mode) {
        this.mode = mode;
        this.selectedMachine = null;

        if (mode === 'place') {
            this.placeBtn.setFillStyle(0x1a5c1a).setStrokeStyle(3, 0x44ff44, 1);
            this.destroyBtn.setFillStyle(0x2a2a2a).setStrokeStyle(3, 0x666666, 0.6);
            this.destroyBtnLabel.setColor('#aaaaaa');
            this.modeLabel.setText('🔨 Place Mode').setColor('#44ff44');
            this.hintLabel.setText('Pick a machine below, then tap a green grid cell');
            this.grid.forEach(row => row.forEach(cell => cell.setInteractive()));
        } else {
            this.placeBtn.setFillStyle(0x2a2a2a).setStrokeStyle(3, 0x666666, 0.6);
            this.destroyBtn.setFillStyle(0x7a1a1a).setStrokeStyle(3, 0xff4444, 1);
            this.destroyBtnLabel.setColor('#ffffff');
            this.modeLabel.setText('💥 Destroy Mode').setColor('#ff4444');
            this.hintLabel.setText('Tap a placed machine on the map to remove it');
            this.grid.forEach(row => row.forEach(cell => cell.disableInteractive()));
        }

        this.drawMachineSelection();
        this.refreshMachineSprites();
    }

    // ── BUILD GRID ────────────────────────────────────────────────────────────
    createBuildGrid() {
        for (let row = 0; row < this.gridRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridCols; col++) {
                const x = this.gridStartX + col * this.cellSize;
                const y = this.gridStartY + row * this.cellSize;
                const occupied = this.placedMachines.some(m => m.x === x && m.y === y);

                const cell = this.add.rectangle(x, y, this.cellSize - 6, this.cellSize - 6,
                    occupied ? 0xff2222 : 0x00ff00, occupied ? 0.18 : 0.15)
                    .setStrokeStyle(2, occupied ? 0xff4444 : 0x00ff00, 0.8)
                    .setOrigin(0.5).setInteractive().setDepth(5);

                cell.occupied = occupied;

                cell.on('pointerdown', () => {
                    if (this.mode !== 'place' || !this.selectedMachine || cell.occupied) return;

                    this.add.image(x, y, this.selectedMachine.texture).setScale(1.2);

                    const newMachine = {
                        x, y,
                        texture:      this.selectedMachine.texture,
                        produces:     this.selectedMachine.produces,
                        cooldown:     this.getCooldown(this.selectedMachine.produces),
                        lastProduced: Date.now()
                    };
                    this.placedMachines.push(newMachine);

                    const idx = this.playerInventory.indexOf(this.selectedMachine);
                    if (idx !== -1) this.playerInventory.splice(idx, 1);

                    this.registry.set('placedMachines', this.placedMachines);
                    this.registry.set('inventory', this.playerInventory);

                    this.selectedMachine = null;
                    cell.occupied = true;
                    cell.setFillStyle(0xff2222, 0.18).setStrokeStyle(2, 0xff4444, 0.8);
                    this.hintLabel.setText('Pick a machine below, then tap a green grid cell');
                    this.refreshMachineSelection();
                });

                this.grid[row][col] = cell;
            }
        }
    }

    // ── DESTROY ───────────────────────────────────────────────────────────────
    refreshMachineSprites() {
        this.machineSprites.forEach(({ machine, sprite }) => {
            sprite.setInteractive();
            sprite.removeAllListeners('pointerdown');
            sprite.removeAllListeners('pointerover');
            sprite.removeAllListeners('pointerout');
            sprite.clearTint();

            if (this.mode === 'destroy') {
                sprite.on('pointerover', () => sprite.setTint(0xff4444));
                sprite.on('pointerout',  () => sprite.clearTint());
                sprite.on('pointerdown', () => this.destroyMachine(machine, sprite));
            }
        });
    }

    destroyMachine(machine, sprite) {
        const idx = this.placedMachines.indexOf(machine);
        if (idx !== -1) this.placedMachines.splice(idx, 1);

        const produceName = machine.produces;
        this.playerInventory.push({
            name:     produceName.charAt(0).toUpperCase() + produceName.slice(1) + ' Machine',
            texture:  machine.texture,
            produces: machine.produces,
            price:    this.getMachinePrice(machine.produces)
        });

        this.registry.set('placedMachines', this.placedMachines);
        this.registry.set('inventory', this.playerInventory);

        // Re-open the grid cell
        this.grid.forEach(row => row.forEach(cell => {
            if (cell.x === machine.x && cell.y === machine.y) {
                cell.occupied = false;
                cell.setFillStyle(0x00ff00, 0.15).setStrokeStyle(2, 0x00ff00, 0.8);
                cell.setInteractive();
            }
        }));

        const spriteIdx = this.machineSprites.findIndex(s => s.machine === machine);
        if (spriteIdx !== -1) this.machineSprites.splice(spriteIdx, 1);
        sprite.destroy();

        this.hintLabel.setText('Machine returned to inventory!');
        this.refreshMachineSelection();
    }

    getMachinePrice(produces) {
        const p = { iron:50, copper:75, steel:100, amethyst:200, emerald:300, magmastone:450, quartz:700, titanium:1000 };
        return p[produces] || 50;
    }

    // ── TRAY ─────────────────────────────────────────────────────────────────
    drawMachineSelection() {
        this.machineUI.forEach(o => o.destroy());
        this.machineUI = [];

        if (this.mode === 'destroy') {
            const msg = this.add.text(960, this.trayMidY, '💥 Tap any placed machine on the map to destroy it', {
                fontSize: '29px', color: '#ff8888', fontFamily: 'Arial', fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
            this.machineUI.push(msg);
            return;
        }

        const machines = this.getMachinesOnly();

        if (machines.length === 0) {
            const msg = this.add.text(960, this.trayMidY, 'No machines in inventory — visit the Shop!', {
                fontSize: '29px', color: '#777788', fontFamily: 'Arial'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
            this.machineUI.push(msg);
            return;
        }

        const slotW  = 160;
        const slotH  = 160;
        const gap    = 10;
        const startX = 50 + slotW / 2;

        machines.forEach((item, i) => {
            const x = startX + i * (slotW + gap);
            const y = this.trayMidY;

            const isSelected = this.selectedMachine === item;

            const card = this.add.rectangle(x, y, slotW, slotH,
                isSelected ? 0x5533aa : 0x2a2a3e, 1)
                .setStrokeStyle(3, isSelected ? 0xcc88ff : 0x555577, isSelected ? 1 : 0.7)
                .setScrollFactor(0).setDepth(101).setInteractive();

            const icon = this.add.image(x, y - 22, item.texture)
                .setScale(0.85).setOrigin(0.5)
                .setScrollFactor(0).setDepth(102);

            const shortName = item.produces.charAt(0).toUpperCase() + item.produces.slice(1);
            const label = this.add.text(x, y + 52, shortName, {
                fontSize: '21px',
                color:    isSelected ? '#cc88ff' : '#aaaacc',
                fontFamily: 'Arial',
                fontStyle:  isSelected ? 'bold' : 'normal'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

            card.on('pointerdown', () => {
                this.selectedMachine = item;
                this.hintLabel.setText(`${shortName} selected — tap a green cell to place`);
                this.refreshMachineSelection();
            });
            card.on('pointerover', () => { if (this.selectedMachine !== item) card.setFillStyle(0x3a3a5e); });
            card.on('pointerout',  () => { if (this.selectedMachine !== item) card.setFillStyle(0x2a2a3e); });

            this.machineUI.push(card, icon, label);
        });
    }

    refreshMachineSelection() { this.drawMachineSelection(); }

    getCooldown(product) {
        const c = { iron:5000, copper:7000, steel:10000, amethyst:15000, emerald:20000, magmastone:25000, quartz:30000, titanium:40000 };
        return c[product] || 5000;
    }

    returnToMainScene() {
        this.scene.start('MainScene', {
            machines: this.placedMachines, inventory: this.playerInventory,
            money: this.money, isNight: this.isNight,
            timeLeft: this.timeLeft, villageRequests: this.villageRequests
        });
    }

    enableCameraDrag() {
        this.isDragging = false;
        this.input.on('pointerdown', (p) => {
            if (p.y > this.trayTopY) return;
            this.isDragging = true;
            this.dragStart = new Phaser.Math.Vector2(p.x, p.y);
        });
        this.input.on('pointerup', () => { this.isDragging = false; });
        this.input.on('pointermove', (p) => {
            if (!this.isDragging) return;
            const cam = this.cameras.main;
            cam.scrollX -= (p.x - this.dragStart.x) / cam.zoom;
            cam.scrollY -= (p.y - this.dragStart.y) / cam.zoom;
            this.dragStart.set(p.x, p.y);
        });
    }
}