import Phaser from 'phaser'

export default class Car extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, "car", null,
            {
                // 'vertices': [{ "x": 60, "y": 6 }, { "x": 38, "y": 48 }, { "x": 60, "y": 106 }, { "x": 43, "y": 48 }]// An array, or an array of arrays, containing the vertex data in x/y object pairs
            }
        );

        scene.add.existing(this);   // add to existing scene
        this.setRectangle(35, 20);
        this.setOrigin(0.5, 0.5);
        this.setFriction(0.5);
        this.body.label = "car";
        this.isJumping = false;
        this.depth = 4; // z-depth in the rendering layers
        this.velocity = 0;

        this.ANGLE_DELTA = 0.1;

        this.SPEED = 0.1;

        this.scene = scene;

        this.setFrictionAir(0.15)
            .setMass(30)
            .setScale(0.9)
            .setFixedRotation()
            .setAngularVelocity(0)
            .setVelocity(0, 0);

        this.body.label = 'car';
    }

    update() {
        // Adapted from:
        if (keyUP.isDown && this.velocity <= 400) {
            this.velocity += 3;
            // console.log("this.velocity", this.velocity);
        } else {
            if (this.velocity >= 3)
                this.velocity -= 3;
        }

        this.setVelocityX(this.velocity * Math.cos((this.angle - 90) * 0.01345));
        this.setVelocityY(this.velocity * Math.sin((this.angle - 90) * 0.01345));

        if (keyLEFT.isDown)
            this.setAngularVelocity(-5 * (this.velocity / 1000));
        else if (keyRIGHT.isDown)
            this.setAngularVelocity(5 * (this.velocity / 1000));
        else
            this.setAngularVelocity(0);
    }

    reset() {
        this.y = 0;
        this.x = 0;
    }
}
