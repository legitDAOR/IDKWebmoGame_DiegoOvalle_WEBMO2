/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

export default class TowerPrefab extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "PlayerTower"); // Make sure the texture key matches your loaded image
        this.setInteractive({ useHandCursor: true });
        this.on("pointerdown", () => {
            scene.scene.get("UIScene").events.emit("openUpgradeMenu");
        });
    }
}
