import Phaser from 'phaser'
// import ScoreOverlay from "/src/prefabs/scoreOverlay"
// import Obstacle from "/src/prefabs/obstacle"
import Car from "/src/prefabs/Car"
// import Wave from "/src/prefabs/Wave"
import CornerButton from "/src/prefabs/CornerButton"

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: "playScene" });
    }

    create() {
        this.gameOver = false;
        this.gameSize = this.game.scale.gameSize;
        this.matter.set30Hz();

        // setup variables

        // define keys
        window.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        window.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        window.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        window.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        window.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        window.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // An array to hold all the obstacle instances in play.
        this.obstacleGameObjects = []

        this.add.sprite(0,0,"desert_bg").setOrigin(0,0).setScale(2,2)

        // place background tile sprite

        // add car (player)
        this.car = new Car(this, this.gameSize.width / 2, this.gameSize.height / 2);

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
            this.gameSize = gameSize;
            this.fullscreenButton.resize(gameSize)
            // this.scoreOverlay.resize(gameSize)
            // this.oceanBackground.height = this.gameSize.height
            // this.oceanBackground.width = this.gameSize.width;
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

        // update wave and player sprites
        this.car.update();  // update surfer sprite
    }

}
