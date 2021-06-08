import Phaser from 'phaser'
import { Car } from "../prefabs/Car"
import { FadeInOutImage } from "../prefabs/FadeInOutImage"
import { CornerButton } from "../prefabs/CornerButton"
import { LevelMap } from "../prefabs/levelMap"
import { ScoreOverlay } from "/src/prefabs/ScoreOverlay"
import { GameOverOverlay } from '../prefabs/GameOverOverlay'

const scriptList = ["encounter_1", "encounter_2", "encounter_3"]

export default class PlayScene extends Phaser.Scene {

    constructor() {
        super({ key: "PlayScene" });
        this.dialogScriptsAlreadyCompleted = {}
        this.currentScriptIndex = 0;
    }
    create() {

        // define keys
        window.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        window.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        window.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        window.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // define variables
        this.gameOver = false;
        this.transitionInProgress = false;
        this.graphicsLayer = this.add.graphics(0, 0).setDepth(5)

        // add fullscreen button
        this.fullscreenButton = new CornerButton(this, "top-right", 120, "⤢")
        this.fullscreenButton.on("pointerup", () => {
            this.scale.toggleFullscreen();
        })

        // add tutorial image.
        this.mouseTutorialImg = new FadeInOutImage(this, this.cameras.main.width / 2, this.cameras.main.height * (3 / 4), "move_mouse_tutorial", 0.01, console.log)
        this.mouseTutorialImg.setDepth(500).setScrollFactor(0, 0).fadeIn()

        // add car (player)
        this.car = new Car(this, 0, 0, 6)
        this.carCameraFollowOffsetVector = new Phaser.Math.Vector2(0, 0)
        this.cameras.main.startFollow(this.car);
        this.cameras.main.setLerp(0.8, 0.8)
        this.cameras.main.roundPixels = true;

        // setup map
        this.lvlMap = new LevelMap(this)
        this.lvlMap.setupLevel("lvl1");

        // high score is saved across games played
        this.hScore = localStorage.getItem("score") || 0;
        this.ScoreOverlay = new ScoreOverlay(this, this.lvlMap.currentLvlConfig.roadWidth)

        // handle when the screen size changes (device rotated, window resized, etc...)
        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            if (this.cameras.main === undefined) return;
            this.cameras.resize(gameSize.width, gameSize.height);
            this.fullscreenButton.resize(gameSize);
            this.mouseTutorialImg.setPosition(this.cameras.main.width / 2, this.cameras.main.height * (3 / 4))
        })
        console.log(this.scale.gameSize.width)

    }

    playNextScript() {
        this.fadeSceneTransition("DialogScene", { scriptName: scriptList[this.currentScriptIndex] })
        this.currentScriptIndex++;
    }

    update() {
        // when game is over, don't do anything, just check for input.
        if (this.gameOver) {
            this.gameOverOverlay.update()
            return; // return here just ends the update function early.
        } else if (this.ScoreOverlay.clock < 0 || this.car.carHealth <= 0) {
            this.gameOver = true;
            this.gameOverOverlay = new GameOverOverlay(this).create()
        }

        this.cameras.main.setTint(Phaser.Display.Color.HSLToColor(0.1, 1, this.ScoreOverlay.clock / this.ScoreOverlay.STARTING_COUNTDOWN_TIME / 2 + 0.5).color)

        // update car driving controller only when mouse button is down (physics runs regardless).
        if (this.game.input.activePointer.isDown) {
            // let isOffroad = this.car.x > this.lvlMap.currentLvlConfig.roadWidth / 2 || this.car.x < -this.lvlMap.currentLvlConfig.roadWidth / 2
            let mouseCoords = this.cameras.main.getWorldPoint(this.game.input.activePointer.x, this.game.input.activePointer.y)
            this.car.update(mouseCoords);  // update car sprite
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
            else if (this.dialogScriptsAlreadyCompleted[targetDetails.label] !== undefined) { }
            else if (targetDetails.label === "Alien_Encounter_1" || targetDetails.label === "Alien_Encounter_2") {
                this.playNextScript()
                this.dialogScriptsAlreadyCompleted[targetDetails.label] = true;

            } else if (targetDetails.label === "Alien_Encounter_3") {
                if (LevelMap.alienStoryLean == 0) {
                    // play 3-1
                    this.fadeSceneTransition("DialogScene", { scriptName: "Alien_Encounter_3-1" });
                } else if (LevelMap.alienStoryLean < 0) {
                    // play 3-2
                    this.fadeSceneTransition("DialogScene", { scriptName: "Alien_Encounter_3-2" });
                } else {
                    // play 3-3
                    this.fadeSceneTransition("DialogScene", { scriptName: "Alien_Encounter_3-3" });
                }
            } else if (targetDetails.label === "House_exit") {
                this.fadeSceneTransition("EndingR", {})
            } else if (targetDetails.label === "Elevator_exit") {
                this.fadeSceneTransition("EndingL", {})
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