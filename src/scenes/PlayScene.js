import Phaser from 'phaser'
// import ScoreOverlay from "/src/prefabs/scoreOverlay"
// import Obstacle from "/src/prefabs/obstacle"
import Car from "/src/prefabs/Car"
import { FadeInOutImage } from "../prefabs/FadeInOutImage"
import CornerButton from "/src/prefabs/CornerButton"
import { LevelMap } from "/src/prefabs/levelMap"
import { ScoreOverlay } from "/src/prefabs/ScoreOverlay"


export default class PlayScene extends Phaser.Scene {

    preload() {
    }

    constructor() {
        super({ key: "playScene" });
    }

    create() {
        this.gameOver = false;

        this.graphicsLayer = this.add.graphics(0, 0);
        this.graphicsLayer.setDepth(5)

        window.map_scaling = 1;

        // setup variables
        this.lvlMap = new LevelMap(this)
        this.lvlMap.setupLevel("lvl1")

        // this.obstacleSpawner.update(0, 2000)
        // define keys
        window.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        window.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        window.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        window.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        this.ScoreOverlay = new ScoreOverlay(this, this.lvlMap.currentLvlConfig.roadWidth)

        // console.log(this.matter.add.image(0, 0, "move_mouse_tutorial", null, {}).body)

        this.mouseTutorialImg = new FadeInOutImage(this, this.cameras.main.width / 2, this.cameras.main.height * (3 / 4), "move_mouse_tutorial", 0.01, console.log)
        this.mouseTutorialImg.setDepth(500).setScrollFactor(0, 0).fadeIn()

        // add car (player)
        this.car = new Car(this, 0, 0, 6)
        this.carCameraFollowOffsetVector = new Phaser.Math.Vector2(0, 0)
        this.cameras.main.startFollow(this.car);
        this.cameras.main.setLerp(0.8, 0.8)
        this.cameras.main.roundPixels = true;
        // high score is saved across games played
        this.hScore = localStorage.getItem("score") || 0;

        // Add the score overlay (Clock + Doom bar stuff)
        // this.scoreOverlay = new ScoreOverlay(this)

        // add fullscreen button
        this.fullscreenButton = new CornerButton(this, "top-right", 120, "⤢")
        this.fullscreenButton.on("pointerup", () => {
            this.scale.toggleFullscreen();
        })

        // handle when the screen size changes (device rotated, window resized, etc...)
        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            this.fullscreenButton.resize(gameSize)
        })
    }

    update() {
        // when game is over, don't do anything, just check for input.
        if (this.gameOver) {
            // check key input for restart
            if (Phaser.Input.Keyboard.JustDown(keyR) || this.input.activePointer.isDown) {
                this.registry.destroy();
                this.events.off();
                this.music.destroy();
                this.scene.restart();
                this.gameOver = false;
            }

            if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
                this.scene.start("menuScene");
                this.registry.destroy();
                this.events.off();
                this.music.destroy();
                this.scene.remove();
                this.gameOver = false;
            }
            return; // return here just ends the update function early.
        }


        // update car driving controller only when mouse button is down (physics runs regardless).
        if (this.game.input.activePointer.isDown) {
            let isOffroad = this.car.x > this.lvlMap.currentLvlConfig.roadWidth / 2 || this.car.x < -this.lvlMap.currentLvlConfig.roadWidth / 2
            let mouseCoords = this.cameras.main.getWorldPoint(this.game.input.activePointer.x, this.game.input.activePointer.y)
            this.car.update(mouseCoords, isOffroad);  // update car sprite
        } else {
            // if the mouse isn't down (Ie: car isn't driving) stop emmiting dust particles
            this.car.offroadDust1.setQuantity(0);
            this.car.offroadDust2.setQuantity(0);
        }

        // handle fading in/out of mouse movement tutorial hint image
        if (this.mouseTutorialImg.currentAlpha > 0.8 && Math.abs(this.car.y) > 100) this.mouseTutorialImg.fadeOut()
        else if (window.keyUP.isDown || window.keyW.isDown) this.mouseTutorialImg.fadeIn()

        // handle updating levelMap including obstacles, background tiles, road tiles and intersections
        if (this.game.getFrame() % 3 == 0) {
            this.lvlMap.update(this.cameras.main.worldView);
            let newLevelName = this.lvlMap.checkTargetOverlap(this.car.x, this.car.y)
            if (newLevelName != null) console.count(newLevelName);
        }

        // handle camera velocity forward push
        let cameraVelocityOffsetMultiplier = 10;
        let targetVector = new Phaser.Math.Vector2(this.car.body.velocity.x * cameraVelocityOffsetMultiplier, this.car.body.velocity.y * cameraVelocityOffsetMultiplier)
        let targetDist = targetVector.length()
        if (targetDist > 150) {
            targetVector.normalize().scale(200);
            this.carCameraFollowOffsetVector.lerp(targetVector, 0.01)
        }
        this.cameras.main.setFollowOffset(-this.carCameraFollowOffsetVector.x, -this.carCameraFollowOffsetVector.y)
    }

}