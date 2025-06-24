export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Backgrounds
        this.load.image('land_1', 'assets/images/background/land_1.png');
        this.load.image('land_2', 'assets/images/background/land_2.png');

        // Buildings
        for (let i = 1; i <= 6; i++) {
            this.load.image(`building_${i}`, `assets/images/buildings/building_${i}.png`);
        }

        this.load.image('PlayerTower', 'assets/images/tower/PlayerTower.png');

        // Machine Images by Product
        const machineProducts = ['iron', 'copper', 'steel', 'amethyst', 'emerald', 'magmastone', 'quartz', 'titanium'];
        machineProducts.forEach(name => {
            this.load.image(`machine_${name}`, `assets/images/machines/machine_${name}.png`);
        });

        // Mineral Icons
        const minerals = ['iron', 'copper', 'steel', 'amethyst', 'emerald', 'magmastone', 'quartz', 'titanium'];
        minerals.forEach(name => {
            this.load.image(name, `assets/images/minerals/${name}.png`);
        });

        // Villager Portraits
        const villagers = ['aeron', 'branna', 'cael', 'eira', 'lorcan', 'saoirse'];
        villagers.forEach(name => {
            this.load.image(`villager_${name}`, `assets/images/villagers/${name}.png`);
        });
    }

    create() {
        this.scene.launch('GameManagerScene');
        this.scene.start('MainScene');
    }
}
