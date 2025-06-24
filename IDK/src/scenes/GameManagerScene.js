export default class GameManagerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameManagerScene', active: true });
    }

    init() {
        this.isNight = this.registry.get('isNight') || false;
        this.timeLeft = 15000;

        // Init registry defaults
        if (!this.registry.has('money')) this.registry.set('money', 100);
        if (!this.registry.has('inventory')) this.registry.set('inventory', []);
        if (!this.registry.has('placedMachines')) this.registry.set('placedMachines', []);

        // Generate random requests for villagers
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

        // Day/night switch
        this.time.addEvent({
            delay: this.timeLeft,
            loop: true,
            callback: () => {
                this.isNight = !this.isNight;
                this.registry.set('isNight', this.isNight);

                // New requests at night
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
        const increasedStorage = this.registry.get('upgrade_increasedStorage') === true;

        machines.forEach(machine => {
            // Patch old machines
            if (!('cooldown' in machine)) {
                machine.cooldown = this.getCooldown(machine.produces);
                machine.maxStorage = 10;
                machine.storage = 0;
                machine.lastProduced = now;
            }

            let cooldown = machine.cooldown;
            let maxStorage = machine.maxStorage;

            if (fasterProduction) cooldown *= 0.7;
            if (increasedStorage) maxStorage += 5;

            // Produce resource if ready
            if (now - machine.lastProduced >= cooldown) {
                if (machine.storage < maxStorage) {
                    machine.storage += 1;
                    machine.lastProduced = now;
                    inventory.push({ produces: machine.produces });
                }
            }
        });

        this.registry.set('inventory', inventory);
        this.registry.set('placedMachines', machines);
    }

    getCooldown(product) {
        switch (product) {
            case 'iron': return 5000;
            case 'copper': return 7000;
            case 'steel': return 10000;
            case 'amethyst': return 12000;
            case 'emerald': return 15000;
            case 'magmastone': return 18000;
            case 'quartz': return 22000;
            case 'titanium': return 30000;
            default: return 5000;
        }
    }
}
