import Phaser from 'phaser'

export default class CameraController {
    constructor(camera, initx, inity) {
        camera.centerOn(initx, inity)
        this.camera = camera;
        this.targetPosition = new Phaser.Math.Vector2(initx, inity)
    }
    update(carX, carY, carVelocityX, carVelocityY) {
        let velocityScaling = 2;
        this.targetPosition.x = carX + (carVelocityX * velocityScaling)
        this.targetPosition.y = carY + (carVelocityY * velocityScaling)

        let cameraPosition = new Phaser.Math.Vector2(this.camera); // works cuz camera has an x & y property.
        // this.camera.centerOn(this.targetPosition.subtract(cameraPosition).normalize().scale(-1).add(cameraPosition))
        this.camera.centerOn(this.targetPosition.x, this.targetPosition.y)
    }
}