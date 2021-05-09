export default class AlienTopDown extends Phaser.GameObjects.Sprite {
    constructor(scene,x,y) {
        super(scene, x,y, "alien_top_down")
        scene.add.existing(this);   // add to existing scene
        this.setOrigin(0.5, 0.5)
        this.origninalX = 0
    }

    update(frameNum) {

    }

    reset() {
        // this.x = this.scene.gameSize.width / 3;
    }
}