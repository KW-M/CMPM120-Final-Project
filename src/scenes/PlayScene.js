import Phaser from 'phaser'
// import ScoreOverlay from "/src/prefabs/scoreOverlay"
// import Obstacle from "/src/prefabs/obstacle"
import { Car } from "../prefabs/Car"
import { FadeInOutImage } from "../prefabs/FadeInOutImage"
import { CornerButton } from "../prefabs/CornerButton"
import { LevelMap } from "../prefabs/levelMap"
import { ScoreOverlay } from "/src/prefabs/ScoreOverlay"

export default class PlayScene extends Phaser.Scene {

    constructor() {
        super({ key: "playScene" });
        this.dialogScriptsAlreadyCompleted = {}
    }
    create() {
        // this.add.image(x, y, textureName)
        // define keys
        window.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        window.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        window.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        window.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // add fullscreen button
        this.fullscreenButton = new CornerButton(this, "top-right", 120, "⤢")
        this.fullscreenButton.on("pointerup", () => {
            this.scale.toggleFullscreen();
        })

        this.gameOver = false;
        this.transitionInProgress = false;
        this.graphicsLayer = this.add.graphics(0, 0).setDepth(5)

        this.mouseTutorialImg = new FadeInOutImage(this, this.cameras.main.width / 2, this.cameras.main.height * (3 / 4), "move_mouse_tutorial", 0.01, console.log)
        this.mouseTutorialImg.setDepth(500).setScrollFactor(0, 0).fadeIn()

        // add car (player)
        this.car = new Car(this, 0, 0, 6)
        this.carCameraFollowOffsetVector = new Phaser.Math.Vector2(0, 0)
        this.cameras.main.startFollow(this.car);
        this.cameras.main.setLerp(0.8, 0.8)
        this.cameras.main.roundPixels = true;

        // setup variables
        this.lvlMap = new LevelMap(this)
        this.lvlMap.setupLevel("lvl1");

        // high score is saved across games played
        this.hScore = localStorage.getItem("score") || 0;
        this.ScoreOverlay = new ScoreOverlay(this, this.lvlMap.currentLvlConfig.roadWidth)
        this.cameras.main.setTint(0xffff00)
        // handle when the screen size changes (device rotated, window resized, etc...)
        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            if (this.cameras.main === undefined) return;
            this.cameras.resize(gameSize.width, gameSize.height);
            this.fullscreenButton.resize(gameSize);
            this.mouseTutorialImg.setPosition(this.cameras.main.width / 2, this.cameras.main.height * (3 / 4))
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
        } else


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

        if (this.scene.transitionProgress === 0 || this.scene.transitionProgress === 1) this.transitionInProgress = false;
        if (this.transitionInProgress) return; // ignore further update function code while transitioning

        // handle updating levelMap including obstacles, background tiles, road tiles and intersections
        if (this.game.getFrame() % 3 == 0) {
            this.lvlMap.update(this.cameras.main.worldView);
            let targetDetails = this.lvlMap.checkTargetEntry(this.car.x, this.car.y, true)
            if (targetDetails === null) { }
            else if (targetDetails.label.startsWith("Alien") && this.dialogScriptsAlreadyCompleted[targetDetails.label] === undefined) {
                this.fadeSceneTransition("dialogScene", { scriptName: "E2L1" })
                this.dialogScriptsAlreadyCompleted[targetDetails.label] = true;
            } else if (targetDetails.targetLvl !== undefined) {
                this.fadeLevelTransition(targetDetails.targetLvl)
            } else if (targetDetails.label != null) console.warn("No action programed for target (or target action Already Played once):", targetDetails.label);
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

    fadeLevelTransition(targetLevelName) {
        this.transitionInProgress = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.lvlMap.setupLevel(targetLevelName);
            this.cameras.main.fadeIn(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (cam, effect) => {
                this.transitionInProgress = false;
            })
        })
    }

    fadeSceneTransition(targetSceneName, data_to_pass) {
        console.log("switching to scene: " + targetSceneName, data_to_pass)
        this.transitionInProgress = true;
        this.scene.transition({ target: targetSceneName, duration: 1000, sleep: true, moveBelow: true, data: data_to_pass });
        let targetScene = this.scene.manager.scenes[this.scene.getIndex(targetSceneName)]
        this.cameras.main.fadeOut(500, 0, 0, 0);
        targetScene.cameras.main.fadeOut(0, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            targetScene.cameras.main.fadeIn(500, 0, 0, 0);
            this.scene.manager.bringToTop(targetSceneName);
            targetScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (cam, effect) => {
                this.transitionInProgress = false;
            })
        })
    }
}