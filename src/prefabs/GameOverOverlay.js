import Phaser from 'phaser'

let STORMFRONT_ANGLE = 20

export class GameOverOverlay {//extends Phaser.GameObjects.GameObject
    constructor(scene) {
        this.scene = scene;
        this.gameOver = false;
        this.gameOverTxt = null;
        this.gameOverBg = null;
        this.alpha = 0;
        this.eventsSetup = false;
    }

    create() {
        this.gameOverTxt = this.scene.add.bitmapText(this.scene.scale.gameSize.width / 2, this.scene.scale.gameSize.height / 2, 'gem_font', 'Game Over!\n\nThe aliens\' gifts were fruitless.\n\n\n> Click to Restart <', 58, 1).setOrigin(0.5, 0.5);
        this.gameOverBg = this.scene.add.rectangle(0, 0, this.scene.scale.gameSize.width, this.scene.scale.gameSize.height, 0x000000).setOrigin(0, 0).setScrollFactor(0, 0).setDepth(51);
        this.gameOverTxt.setAlpha(this.alpha).setDepth(53).setScrollFactor(0, 0)
        this.gameOverBg.setAlpha(this.alpha).setDepth(52).setScrollFactor(0, 0)

        // handle when the screen size changes (device rotated, window resized, etc...)
        this.scene.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            if (this.scene.cameras.main === undefined) return;
            this.scene.cameras.resize(gameSize.width, gameSize.height);
            this.gameOverBg.setSize(this.scene.scale.gameSize.width, this.scene.scale.gameSize.height)
            this.gameOverTxt.setPosition(this.scene.scale.gameSize.width / 2, this.scene.scale.gameSize.height / 2)
        })

        return this;
    }

    restartGame() {
        this.scene.registry.destroy();
        this.scene.events.off();
        // this.scene.music.destroy();
        this.scene.scene.restart();
        this.gameOver = false;
        this.destroy();
    }

    update() {
        // fade in overlay
        if (this.alpha < 1) {
            this.alpha += 0.02
            this.gameOverTxt.setAlpha(this.alpha)
            this.gameOverBg.setAlpha(this.alpha / 4 * 3)
        } else if (!this.eventsSetup) {
            this.scene.input.once(Phaser.Input.Keyboard.JustDown(Phaser.Input.Keyboard.KeyCodes.R), this.restartGame, this)
            this.scene.input.once(Phaser.Input.Events.POINTER_DOWN, this.restartGame, this)
            this.eventsSetup = true;
        }
    }
}