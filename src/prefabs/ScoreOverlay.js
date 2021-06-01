import Phaser from 'phaser'

export class ScoreOverlay {
    constructor(scene, roadWidth) {
        this.scene = scene

        // create a game clock counter that will count up.
        this.clock = 60 * 1000;

        // create an object to populate the text configuration members
        this.textConfig = {
            fontFamily: "Courier",
            fontSize: "30px",
            backgroundColor: "#88111185",
            color: "#FFFFFF",
            align: "center",
            fixedWidth: roadWidth,
            padding: { top: 5, bottom: 5, left: 5, right: 5 },
        };

        // add the text to the screen
        this.clockText = this.scene.add.text(
            0, // x-coord
            0, // y-coord
            this.formatTime(this.clock), // text to display
            this.textConfig // text style config object
        );
        this.clockText.depth = 200;
        this.clockText.scrollFactorY = 0;
        this.clockText.setOrigin(0.5, 0)

        // add the event to increment the clock;
        this.timedEvent = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                this.clock -= 10;
                this.clockText.text = this.formatTime(this.clock);
            },
            scope: this,
            loop: true
        });

        // this.resize(this.scene.cameras.width)
    }

    resize(gameWidth) {
        // this.clockText.setOrigin(0.5, 0).setPosition(gameWidth / 2, 0)
    }

    // FORMAT TIME function
    formatTime(decisseconds) {
        let s = Math.floor(decisseconds / 100);
        let min = Math.floor(s / 60);
        let seconds = s % 60;
        decisseconds = (decisseconds % 100).toString().padStart(2, "0");
        seconds = seconds.toString().padStart(2, "0");
        return `${min}:${seconds}.${decisseconds}`;
    };


}