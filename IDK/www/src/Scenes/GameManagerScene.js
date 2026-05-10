/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class GameManagerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameManagerScene', active: true });
    }

    init() {
        this.isNight = this.registry.get('isNight') || false;
        this.timeLeft = 15000;

        if (!this.registry.has('money'))          this.registry.set('money', 100);
        if (!this.registry.has('inventory'))       this.registry.set('inventory', []);
        if (!this.registry.has('placedMachines'))  this.registry.set('placedMachines', []);

        if (!this.registry.has('villageRequests')) {
            const items = ['iron', 'copper', 'steel', 'amethyst', 'emerald', 'magmastone', 'quartz', 'titanium'];
            this.registry.set('villageRequests', Array.from({ length: 6 }, () =>
                Phaser.Utils.Array.GetRandom(items)
            ));
        }
    }

    create() {
        // Machine production tick every second
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.runMachineProduction()
        });

        // Day/night cycle
        this.time.addEvent({
            delay: this.timeLeft,
            loop: true,
            callback: () => {
                this.isNight = !this.isNight;
                this.registry.set('isNight', this.isNight);

                if (this.isNight) {
                    const items = ['iron', 'copper', 'steel', 'amethyst', 'emerald', 'magmastone', 'quartz', 'titanium'];
                    this.registry.set('villageRequests', Array.from({ length: 6 }, () =>
                        Phaser.Utils.Array.GetRandom(items)
                    ));
                }
            }
        });
    }

    runMachineProduction() {
        const machines = this.registry.get('placedMachines');
        const inventory = this.registry.get('inventory');
        const now = Date.now();

        const fasterProduction = this.registry.get('upgrade_fasterProduction') === true;

        machines.forEach(machine => {
            // Patch old machines that are missing fields
            if (!('cooldown' in machine)) {
                machine.cooldown    = this.getCooldown(machine.produces);
                machine.lastProduced = now;
            }
            if (!('lastProduced' in machine)) {
                machine.lastProduced = now;
            }

            const cooldown = fasterProduction
                ? machine.cooldown * 0.7
                : machine.cooldown;

            // Produce one item into inventory when ready
            // NOTE: no per-machine storage cap — inventory itself is the storage.
            // Machines previously stopped because machine.storage filled to 10
            // and was never drained when items were sold. Removed that cap entirely.
            if (now - machine.lastProduced >= cooldown) {
                machine.lastProduced = now;
                inventory.push({ produces: machine.produces });
            }
        });

        this.registry.set('inventory', inventory);
        this.registry.set('placedMachines', machines);
    }

    getCooldown(product) {
        switch (product) {
            case 'iron':       return 5000;
            case 'copper':     return 7000;
            case 'steel':      return 10000;
            case 'amethyst':   return 12000;
            case 'emerald':    return 15000;
            case 'magmastone': return 18000;
            case 'quartz':     return 22000;
            case 'titanium':   return 30000;
            default:           return 5000;
        }
    }
}