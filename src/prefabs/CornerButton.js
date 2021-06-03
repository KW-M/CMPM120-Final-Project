import Phaser from 'phaser';

let scoreConfig = {
    fontFamily: 'Courier',
    fontSize: '38px',
    color: '#ffffff',
    align: 'center',
};

export default class CornerButton extends Phaser.GameObjects.Rectangle {
    constructor(scene, corner, size, label) {
        super(scene, 0, 0, size, size / 2, 0x000000, 0.5)
        scene.add.existing(this);
        this.setOrigin(0.5, 0)
        this.corner = corner
        this.size = size;
        this.txt = scene.add.text(0, 0, label, scoreConfig).setOrigin(0.5, 0.5);
        this.txt.scrollFactorX = 0;
        this.txt.scrollFactorY = 0;
        this.depth = 100;
        this.txt.depth = 101;
        this.resize(this.scene.scale.gameSize)
        this.scrollFactorX = 0;
        this.scrollFactorY = 0;
        this.setInteractive()
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState());

        this.depth = 100;
    }

    enterButtonHoverState() {
        this.setAlpha(1)
    }

    enterButtonRestState() {
        this.setAlpha(0.5)
    }

    resize(gameSize) {
        console.log(gameSize)
        let offset = this.size / 6
        if (this.corner == "top-right") {
            this.x = gameSize.width
            this.y = 0;
            this.setAngle(45)
            this.txt.setPosition(this.x - offset, this.y + offset)
        } else if (this.corner == "bottom-right") {
            this.x = gameSize.width
            this.y = gameSize.height;
            this.setAngle(-135)
            this.txt.setPosition(this.x - offset, this.y - offset)
        } else if (this.corner == "top-left") {
            this.x = 0;
            this.y = 0;
            this.setAngle(-45)
            this.txt.setPosition(this.x + offset, this.y + offset)
        } else if (this.corner == "bottom-left") {
            this.x = 0;
            this.y = gameSize.height;
            this.setAngle(-135)
            this.txt.setPosition(this.x + offset, this.y - offset)
        }
    }
}