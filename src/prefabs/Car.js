import Phaser from 'phaser'

const ROAD_FRICTION = 0.5;
const STEARING_RATE_MULTIPLIER = 0.7;
const ACCELERATION_RATE_MULTIPLIER = .5;
const DEG_TO_RAD = Math.PI / 180;
const MAX_HEALTH = 5

// includes driving code from: https://gitlab.com/grigoriytretyakov/phaser3-racing-car/-/blob/master/src/Game.js
export class Car extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, depth) {
        super(scene.matter.world, x, y, "car", null,
            {

                // 'vertices': [{ "x": 60, "y": 6 }, { "x": 38, "y": 48 }, { "x": 60, "y": 106 }, { "x": 43, "y": 48 }]// An array, or an array of arrays, containing the vertex data in x/y object pairs
            }
        );
        scene.add.existing(this);   // add to existing scene

        // Sprite Settings
        this.depth = depth; // z-depth in the rendering layers
        this.setScale(0.9); // size scale factor of the car sprite;
        this.setOrigin(0.3, 0.5); //

        // Physics Settings
        this.body.label = "car";
        this.setRectangle(35, 20); // Physics Colider Rectangle;
        this.setMass(10000)
        this.setFrictionAir(ROAD_FRICTION)
        this.setFixedRotation()
        this.setAngle(-90)

        //keep track of current acceleration for lerp
        this.accelAmount = 0;

        this.debugRect1 = this.scene.add.rectangle(0, 0, 2, 2, 0xFF00FF).setDepth(100)
        this.debugRect0 = this.scene.add.rectangle(this.x, this.y, 2, 2, 0xFFFF00).setDepth(100)
        this.debugRect2 = this.scene.add.rectangle(0, 0, 2, 2, 0x00FFFF).setDepth(100)

        // Constants
        this.carHealth = MAX_HEALTH

        // particles
        this.dustConfig = {
            x: 0,
            y: 0,
            particleFriction: 0.2,
            quantitiy: 0,
            alpha: { start: 0.5, end: 0 },
            scale: { start: .3, end: 1 },
            lifespan: { min: 600, max: 800 },
        }
        this.dustParticles = this.scene.add.particles('dust_particle').setDepth(this.depth - 1)
        this.offroadDust1 = this.dustParticles.createEmitter(this.dustConfig)
        this.offroadDust2 = this.dustParticles.createEmitter(this.dustConfig)
        this.isOffroad = false;

        this.skidConfig = {
            x: 0,
            y: 0,
            quantitiy: 1,
            tint: { onEmit: () => { return this.isOffroad ? 0x885500 : 0x000000; } },
            alpha: .5,
            scale: .2,
            lifespan: 10000,
        }
        this.skidParticles = this.scene.add.particles('dust_particle').setDepth(this.depth - 2)
        this.skidMarks1 = this.skidParticles.createEmitter(this.skidConfig)
        this.skidMarks2 = this.skidParticles.createEmitter(this.skidConfig)

        this.collisionInProgressCount = 0
        this.justCollided = false;
        this.setOnCollide(() => {
            this.justCollided = true;
            this.collisionInProgressCount++
        })
        this.setOnCollideEnd(() => {
            this.collisionInProgressCount--
        })
        // Sounds
        this.accelSound = this.scene.sound.add('accelSound')
        this.accelSoundConfig = {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        }
        this.accelSound.play(this.accelSoundConfig);


    }

    drawSkidMarks(carForwardVector, carVelocityLength) {
        let backLeftWheelPosition = new Phaser.Math.Vector2(-20, -10).rotate(this.rotation).add(new Phaser.Math.Vector2(this))
        let backRightWheelPosition = new Phaser.Math.Vector2(-20, 10).rotate(this.rotation).add(new Phaser.Math.Vector2(this))
        this.skidMarks1.setPosition(backLeftWheelPosition.x, backLeftWheelPosition.y);
        this.skidMarks2.setPosition(backRightWheelPosition.x, backRightWheelPosition.y);

        if (this.isOffroad) {
            let carAngle = carForwardVector.angle() / DEG_TO_RAD
            let dustDirectionMin = (carAngle - 60) % 360
            let dustDirectionMax = (carAngle + 60) % 360

            let speed = carVelocityLength * 5
            this.offroadDust1.setPosition(backLeftWheelPosition.x, backLeftWheelPosition.y).setAngle({ min: dustDirectionMin, max: dustDirectionMax }).setSpeed(speed).setQuantity(10);
            this.offroadDust2.setPosition(backRightWheelPosition.x, backRightWheelPosition.y).setAngle({ min: dustDirectionMin, max: dustDirectionMax }).setSpeed(speed).setQuantity(10);
        } else {
            this.offroadDust1.setQuantity(0);
            this.offroadDust2.setQuantity(0);
        }
    }

    clearSkidMarks() {
        this.dustParticles.destroy();
        this.skidParticles.destroy();
        this.dustParticles = this.scene.add.particles('dust_particle').setDepth(this.depth - 1)
        this.skidParticles = this.scene.add.particles('dust_particle').setDepth(this.depth - 2)
        this.offroadDust1 = this.dustParticles.createEmitter(this.dustConfig)
        this.offroadDust2 = this.dustParticles.createEmitter(this.dustConfig)
        this.skidMarks1 = this.skidParticles.createEmitter(this.skidConfig)
        this.skidMarks2 = this.skidParticles.createEmitter(this.skidConfig)
    }

    takeDamage(ammount) {
        this.carHealth -= ammount;
        this.setTint(Phaser.Display.Color.HSLToColor(0.1, 1, this.carHealth / MAX_HEALTH / 2 + 0.5).color)
    }

    update(mouseWorldPositionVector) {
        const carToMouseVector = new Phaser.Math.Vector2(this).scale(-1).add(mouseWorldPositionVector);
        const carForwardVector = new Phaser.Math.Vector2(1, 0).setAngle(this.rotation);
        const carVelocityVector = new Phaser.Math.Vector2(this.body.velocity);

        const carToMouseCarForwardComponent = carToMouseVector.clone().rotate(0).dot(carForwardVector);

        let carForwardToMouseVectorAngle = (carForwardVector.angle() - carToMouseVector.angle()) / DEG_TO_RAD
        carForwardToMouseVectorAngle = (carForwardToMouseVectorAngle + 540) % 360 - 180 // handle wraparound of degrees 0->360

        let offroadSpeedMultiplier = 1;
        if (this.isOffroad) {
            offroadSpeedMultiplier = 1 / 4;
        }

        if (this.collisionInProgressCount > 0) {
            offroadSpeedMultiplier /= 1
            // this.setFrictionAir(ROAD_FRICTION * 3.5)
        } else this.setFrictionAir(ROAD_FRICTION)
        if (this.justCollided === true) {
            this.justCollided = false;
            this.takeDamage(1)
            carForwardToMouseVectorAngle = (carForwardToMouseVectorAngle * Math.PI) % 360;
            let newVelocity = carVelocityVector.clone().scale(0.01)
            this.setVelocity(newVelocity.x, newVelocity.y)
        }

        let carIsMovingBackward = carForwardVector.clone().add(carVelocityVector.normalize()).length() < 1;
        let carVelocityLength = carVelocityVector.length();
        this.drawSkidMarks(carForwardVector, carVelocityLength)

        if (carVelocityLength < 0.1) this.accelAmount = 0; // handle instant stop from cracks.
        if (Math.abs(carForwardToMouseVectorAngle) > 150 || (carIsMovingBackward === true && Math.abs(carForwardToMouseVectorAngle) > 90)) {
            // car accelerates backward
            this.accelAmount = Phaser.Math.Linear(
                this.accelAmount,
                ACCELERATION_RATE_MULTIPLIER * offroadSpeedMultiplier * Phaser.Math.Clamp(carToMouseCarForwardComponent * 0.2, -200, -5),
                0.1
            )
        } else {
            // car accelerates forward
            this.accelAmount = Phaser.Math.Linear(
                this.accelAmount,
                ACCELERATION_RATE_MULTIPLIER * offroadSpeedMultiplier * Phaser.Math.Clamp(carToMouseCarForwardComponent, 10, 200),
                0.1
            )
        }
        if (carIsMovingBackward) {
            carForwardToMouseVectorAngle = (carForwardToMouseVectorAngle + 360) % 360 - 180
        }

        if (this.accelAmount != 0) {
            // updates accelSound pitch relative to velocity
            this.accelSound.setDetune(this.accelAmount * 10);
        } else {
            this.accelSound.setDetune(10);
        }


        this.applyForce(carForwardVector.clone().scale(this.accelAmount))
        // this.thrust(this.accelAmount)
        this.setAngularVelocity(STEARING_RATE_MULTIPLIER * (1 / offroadSpeedMultiplier) * -carForwardToMouseVectorAngle * DEG_TO_RAD / ((carVelocityLength / 100) + 1) * Phaser.Math.Clamp(carVelocityLength, 0, 5) / 5)

        this.debugRect0.setPosition(carForwardVector.x * this.accelAmount + this.x, carForwardVector.y * this.accelAmount + this.y)
        this.debugRect1.setPosition(carVelocityVector.x + this.x, carVelocityVector.y + this.y)
        let angleVector = new Phaser.Math.Vector2(100, 0).setAngle(carForwardToMouseVectorAngle * DEG_TO_RAD)
        this.debugRect2.setPosition(angleVector.x + this.x, angleVector.y + this.y)
    }

    reset() {
        this.y = 0;
        this.x = 0;
    }
}
