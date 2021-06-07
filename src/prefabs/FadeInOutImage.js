import Phaser from 'phaser';

export class FadeInOutImage extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture, fadeSpeed, fadeOutCallback) {
        super(scene, x, y, texture)
        scene.add.existing(this);
        this.setOrigin(0.5, 0.5)
        this.fadeOutCallback = fadeOutCallback;
        this.currentAlpha = 0;
        this.fadeDirection = 1; // 1 for fade in -1 for fade out;
        this.fadeSpeedMultipler = fadeSpeed; // must be  between 9 and 1;
    }
    fadeChange() {
        this.currentAlpha += this.fadeDirection * this.fadeSpeedMultipler
        if (this.currentAlpha >= 1) {
            this.currentAlpha = 1
        } else if (this.currentAlpha <= 0) {
            this.currentAlpha = 0;
            if (this.fadeOutCallback) this.fadeOutCallback();
        } else {
            window.setTimeout(() => { this.fadeChange() }, 50)
        }
        this.setAlpha(this.currentAlpha);
    }
    fadeOut() {
        this.fadeDirection = -1;
        this.fadeChange()
    }
    fadeIn() {
        this.fadeDirection = 1;
        this.fadeChange()
    }
}