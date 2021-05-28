export default class EndIntersection extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, angle, sprite_texture) {
        super(scene, x, y, sprite_texture)
        scene.add.existing(this);   // add to existing scene
        this.setAngle(angle);
        this.setOrigin(0.5, 1);
    }

    checkCarExit(carX, CarY) {
        let intersectionOriginToCarVec = new Phaser.Math.Vector2(this.x, this.y).scale(-1).add(new Phaser.Math.Vector2(carX, carY)) // - IntersectionPos + carPos
        let intersectionAngleToVectorAngleDelta = (intersectionOriginToCarVec.angle - this.angle) % 360;
        console.log(intersectionAngleToVectorAngleDelta)
    }

    reset() {
        // this.x = this.scene.gameSize.width / 3;
    }
}