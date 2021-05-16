import Phaser from 'phaser'

// includes driving code from: https://gitlab.com/grigoriytretyakov/phaser3-racing-car/-/blob/master/src/Game.js
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
        this.accelSound = this.scene.sound.add('accelSound')

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

        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.counterclockwise = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A);

        this.clockwise = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D);

        this.forward = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.W);

        this.backward = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S);


    }

    rotate(delta) {
        this.setAngularVelocity(delta);
    }

    rotateClockwise() {
        this.rotate(this.ANGLE_DELTA);
    }

    rotateCounterclockwise() {
        this.rotate(-this.ANGLE_DELTA);
    }

    goForward() {
        this.thrust(this.SPEED);
    }

    goBackward() {
        this.thrust(-this.SPEED);
    }


    update() {

        if (Phaser.Input.Keyboard.JustDown(keyUP) || Phaser.Input.Keyboard.JustDown(this.forward)) {
            this.accelSound.play();
        }

        if (this.clockwise.isDown || this.cursors.right.isDown) {
            this.rotateClockwise();
        }
        else if (this.counterclockwise.isDown || this.cursors.left.isDown) {
            this.rotateCounterclockwise();
        }

        if (this.forward.isDown || this.cursors.up.isDown) {
            this.goForward();
        }
        else if (this.backward.isDown || this.cursors.down.isDown) {
            this.goBackward();
        }

    }

    reset() {
        this.y = 0;
        this.x = 0;
    }
}
