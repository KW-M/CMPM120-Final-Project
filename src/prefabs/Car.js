// import Phaser from 'phaser'

// // includes driving code from: https://gitlab.com/grigoriytretyakov/phaser3-racing-car/-/blob/master/src/Game.js
// export default class Car extends Phaser.Physics.Matter.Image {
//     constructor(scene, x, y) {
//         super(scene.matter.world, x, y, "car", null,
//             {
//                 // 'vertices': [{ "x": 60, "y": 6 }, { "x": 38, "y": 48 }, { "x": 60, "y": 106 }, { "x": 43, "y": 48 }]// An array, or an array of arrays, containing the vertex data in x/y object pairs
//             }
//         );

//         scene.add.existing(this);   // add to existing scene
//         this.setRectangle(35, 20);
//         this.setOrigin(0.5, 0.3);
//         this.setFriction(0.5);
//         this.body.label = "car";
//         this.isJumping = false;
//         this.depth = 4; // z-depth in the rendering layers
//         this.velocity = 0;
//         this.accelSound = this.scene.sound.add('accelSound')

//         this.lastPosition = new Phaser.Math.Vector2(x, y)
//         this.stearingAngle = 0;
//         this.STEARING_RATE_MULTIPLIER = 0.0002
//         this.backupSteering = 1; // -1 when backing up
//         this.maxSteeringAngle = 10 // in degrees


//         this.MAX_SPEED_WHEN_DRIFTING = 0.00005;
//         this.MAX_SPEED_WHEN_DRIVING = 0.65;
//         this.currentSpeed = this.MAX_SPEED_WHEN_DRIVING;

//         this.FRICTION_WHEN_DRIFTING = 0.1
//         this.FRICTION_WHEN_DRIVING = 0.3
//         this.currentFriction = this.FRICTION_WHEN_DRIVING;

//         this.scene = scene;

//         this.setFrictionAir(0.5)
//             .setMass(100)

//             .setScale(0.9)
//             .setFixedRotation()
//             .setAngularVelocity(0)
//             .setVelocity(0, 0);

//         this.body.label = 'car';

//         this.cursors = this.scene.input.keyboard.createCursorKeys();

//         this.counterclockwise = this.scene.input.keyboard.addKey(
//             Phaser.Input.Keyboard.KeyCodes.A);

//         this.spaceBar = this.scene.input.keyboard.addKey(
//             Phaser.Input.Keyboard.KeyCodes.SPACE);

//         this.clockwise = this.scene.input.keyboard.addKey(
//             Phaser.Input.Keyboard.KeyCodes.D);

//         this.forward = this.scene.input.keyboard.addKey(
//             Phaser.Input.Keyboard.KeyCodes.W);

//         this.backward = this.scene.input.keyboard.addKey(
//             Phaser.Input.Keyboard.KeyCodes.S);


//     }

//     rotate(delta) {
//         this.setAngularVelocity(delta);
//     }

//     rotateClockwise() {
//         this.rotate(this.ANGLE_DELTA);
//     }

//     rotateCounterclockwise() {
//         this.rotate(-this.ANGLE_DELTA);
//     }

//     applyStearingAdjustement() {
//         let distanceTraveled = new Phaser.Math.Vector2(this).add(this.lastPosition.negate()).length()
//         this.setAngularVelocity(distanceTraveled * (this.stearingAngle + this.stearingAngle / this.currentSpeed) * this.backupSteering * this.STEARING_RATE_MULTIPLIER)
//         this.lastPosition = new Phaser.Math.Vector2(this);
//     }

//     goForward() {
//         this.thrust(this.currentSpeed);
//         let maxSpeed = this.spaceBar.isDown ? this.MAX_SPEED_WHEN_DRIFTING : this.MAX_SPEED_WHEN_DRIVING
//         if (this.currentSpeed > maxSpeed) this.currentSpeed -= 0.001
//         else if (this.currentSpeed < maxSpeed) this.currentSpeed += 0.000000001
//     }

//     goBackward() {
//         this.thrust(-1);
//     }


//     update() {

//         if (Phaser.Input.Keyboard.JustDown(keyUP) || Phaser.Input.Keyboard.JustDown(this.forward)) {
//             // this.accelSound.play();
//             console.log("CarPosition (map scaled): ", this.x / window.map_scaling, this.y / window.map_scaling)
//         }

//         if (this.spaceBar.isDown) {
//             // this.maxSteeringAngle = 20;
//             if (this.currentFriction > this.FRICTION_WHEN_DRIFTING) {
//                 this.currentFriction -= 0.01
//                 this.setFrictionAir(this.currentFriction)
//             }
//         } else {
//             // this.maxSteeringAngle = 10;
//             if (this.currentFriction < this.FRICTION_WHEN_DRIVING) {
//                 this.currentFriction += 0.05
//                 this.setFrictionAir(this.currentFriction)
//             }
//             if (this.currentSpeed < this.MAX_SPEED_WHEN_DRIVING) this.currentSpeed += 0.05
//         }

//         if (this.clockwise.isDown || this.cursors.right.isDown) {
//             // this.rotateClockwise();
//             if (this.stearingAngle < this.maxSteeringAngle)
//                 this.stearingAngle += 3;
//         } else if (this.counterclockwise.isDown || this.cursors.left.isDown) {
//             // this.rotateCounterclockwise();
//             if (this.stearingAngle > -this.maxSteeringAngle)
//                 this.stearingAngle -= 3;
//         } else {
//             this.stearingAngle = 0;
//         }

//         if (this.forward.isDown || this.cursors.up.isDown) {
//             this.goForward();
//             this.backupSteering = 1;
//         }
//         else if (this.backward.isDown || this.cursors.down.isDown) {
//             this.goBackward();
//             this.backupSteering = -1;
//         } else if (this.currentSpeed > 0) {
//             this.currentSpeed -= 0.1;
//         }
//         this.applyStearingAdjustement()
//     }

//     reset() {
//         this.y = 0;
//         this.x = 0;
//     }
// }


import Phaser from 'phaser'

const STEARING_RATE_MULTIPLIER = 0.1;
const ACCELERATION_RATE_MULTIPLIER = 10;
const DEG_TO_RAD = Math.PI / 180;

// includes driving code from: https://gitlab.com/grigoriytretyakov/phaser3-racing-car/-/blob/master/src/Game.js
export default class Car extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, depth) {
        super(scene.matter.world, x, y, "car", null,
            {

                // 'vertices': [{ "x": 60, "y": 6 }, { "x": 38, "y": 48 }, { "x": 60, "y": 106 }, { "x": 43, "y": 48 }]// An array, or an array of arrays, containing the vertex data in x/y object pairs
            }
        );
        scene.add.existing(this);   // add to existing scene
        this.scene = scene;

        // Sprite Settings
        this.depth = depth; // z-depth in the rendering layers
        this.setScale(0.9); // size scale factor of the car sprite;
        this.setOrigin(0.3, 0.5); //

        // Physics Settings
        this.body.label = "car";
        this.setRectangle(35, 20); // Physics Colider Rectangle;
        this.setMass(100000)
        this.body.inertia = 10000000
        this.body.inverseInertia = 1 / this.body.inertia

        this.setFrictionAir(0.5)
        this.setFixedRotation()
        this.setAngularVelocity(3)
        // this.setVelocity(5, 3)

        this.debugRect1 = this.scene.add.rectangle(0, 0, 2, 2, 0xFF00FF).setDepth(100)
        this.debugRect0 = this.scene.add.rectangle(this.x, this.y, 2, 2, 0xFFFF00).setDepth(100)

        // Constants
        // this.backupSteering = 1; // -1 when backing up
        // this.maxSteeringAngle = 10 // in degrees

        // Sounds
        this.accelSound = this.scene.sound.add('accelSound')
    }

    update(mouseWorldPositionVector) {
        const carToMouseVector = new Phaser.Math.Vector2(this).scale(-1).add(mouseWorldPositionVector);
        const carForwardVector = new Phaser.Math.Vector2(1, 0).setAngle(this.rotation);
        const carVelocityVector = new Phaser.Math.Vector2(this.body.velocity);

        this.debugRect0.setPosition(this.x, this.y)
        this.debugRect1.setPosition(carForwardVector.x * 100, carForwardVector.y * 100)
        this.debugRect1.setPosition(carVelocityVector.x + this.x, carVelocityVector.y + this.y)

        const carToMouseCarForwardComponent = carToMouseVector.clone().rotate(0).dot(carForwardVector);

        let carForwardToMouseVectorAngle = (carForwardVector.angle() - carToMouseVector.angle()) * 1 / DEG_TO_RAD
        carForwardToMouseVectorAngle = (carForwardToMouseVectorAngle + 180) % 360 - 180

        let AccelAmount;
        if (Math.abs(carForwardToMouseVectorAngle) < 160) {
            AccelAmount = ACCELERATION_RATE_MULTIPLIER * Phaser.Math.Clamp(carToMouseCarForwardComponent, 10, 200)
        } else {
            AccelAmount = ACCELERATION_RATE_MULTIPLIER * Phaser.Math.Clamp(carToMouseCarForwardComponent * 0.2, -200, -5)
            carForwardToMouseVectorAngle = (carForwardToMouseVectorAngle + 180) % 360
        }

        this.thrust(AccelAmount)
        this.setAngularVelocity(STEARING_RATE_MULTIPLIER * -carForwardToMouseVectorAngle * DEG_TO_RAD / ((carVelocityVector.length() / 100) + 1) * Phaser.Math.Clamp(carVelocityVector.length(), 0, 5) / 5)

        // console.log(a, carToMouseVector.angle() * 1 / DEG_TO_RAD, carForwardVector.angle() * 1 / DEG_TO_RAD);
        // console.log(carToMouseCarForwardComponent, carToMouseVector, carForwardVector, carVelocityVector)

        // this.setAngularVelocity(delta);
    }

    reset() {
        this.y = 0;
        this.x = 0;
    }
}
