export default class VillagePrefab extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "village");
    this.setInteractive();
    this.on("pointerdown", () => {
      scene.scene.get("UIScene").events.emit("openShopMenu");
    });
  }
}
