import Phaser from 'phaser'

let STORMFRONT_ANGLE = 20

export class SandStorm {
    constructor(scene, graphics) {
        this.scene = scene;
        this.graphics = graphics;
    }

    reset(y) {
        return this;
    }

    startStorm(x, y)

    update() {
        // if (this.x < -this.width) {
        //     this.done = true;
        // } else if (this.body.label == 'shark')
        //     this.setVelocity(speed, 0);
        // else
        //     this.setVelocity(-speed, 0);// move sprite left
    }
}