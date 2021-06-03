import Phaser from 'phaser'

const obstacleConfigs = {
    'right_crack_1': {
        "shape": {
            "type": "fromPhysicsEditor",
            "isStatic": true,
            "fixtures": [{
                "vertices": [
                    [{ "x": 40, "y": 5 }, { "x": 13, "y": 17 }, { "x": 20, "y": 16 }, { "x": 40, "y": 23 }],
                ]
            }]
        }
    },
    'left_crack_1': {
        "shape": {
            "type": "fromPhysicsEditor",
            "isStatic": true,
            "fixtures": [{
                "vertices": [ // An array, or an array of arrays, containing the vertex data in x/y object pairs },
                    [{ "x": 0, "y": 2 }, { "x": 33, "y": 16 }, { "x": 10, "y": 24 }, { "x": 0, "y": 21 }],
                ]
            }]
        }
    },
    'crack_1': {
        "isSensor": true,
        "isStatic": true,
        'shape': 'circle',
        'circleRadius': 10
    },
    'crack_2': {
        "isSensor": true,
        "isStatic": true,
        'shape': 'circle',
        'circleRadius': 10

    },
    'crack_3': {
        "isSensor": true,
        "isStatic": true,
        'shape': 'circle',
        'circleRadius': 10,
    },
    'crack_4': {
        "isSensor": true,
        "isStatic": true,
        'shape': 'circle',
        'circleRadius': 10,
    },
}

export class ObstacleSpawner {
    constructor(scene, graphics, roadWidth) {
        this.scene = scene
        this.obstacles = []
        this.roadWidth = roadWidth;
        this.colorIndex = 3;

        this.psudoRandomArraySize = 600;
        this.psudoRandomArray = new Array(this.psudoRandomArraySize)
        this.reset()
    }

    generateNewPsudoRandomArray() {
        this.psudoRandomArrayIndex = 0;

        let fillCounter = 0;
        let targetIndex = 0;

        this.psudoRandomArray.fill(-1)
        while (fillCounter < this.psudoRandomArraySize - 1) {
            targetIndex = Math.floor(Math.random() * (this.psudoRandomArraySize + 1));
            if (this.psudoRandomArray[targetIndex] !== -1 || targetIndex === this.psudoRandomArrayIndex || targetIndex === 0) continue
            // otherwise continue....
            this.psudoRandomArray[this.psudoRandomArrayIndex] = targetIndex;
            this.psudoRandomArrayIndex = targetIndex;
            fillCounter++;
        }
        this.psudoRandomArray[this.psudoRandomArrayIndex] = 0;
        console.log("New Psudo-Random Array: ", this.psudoRandomArray)
    }

    reset() {
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].destory();
        }
        this.obstacles = []
        this.currentlySpawedAreaTopBound = -800
        this.currentlySpawedAreaBottomBound = 400
        this.generateNewPsudoRandomArray()
    }

    drawObstacle(x, y, textureName) {
        let sprite = this.scene.matter.add.image(x, y, textureName, null, obstacleConfigs[textureName])
        sprite.setDepth(3);
        sprite.setStatic(true)
        this.obstacles.push(sprite)
        return sprite;
    }

    addCorrectObstacle(x, y) {
        let SideZonesWidth = 60

        let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]
        this.colorIndex += Math.ceil(Math.random() * 3)
        this.colorIndex = this.colorIndex % colors.length;

        if (x < -(this.roadWidth / 2) + SideZonesWidth) {
            x = -this.roadWidth / 2;
            this.scene.graphicsLayer.lineStyle(2, 0xdd55FF, 1);
            // this.scene.graphicsLayer.fillCircle(x, y, 10);
            let obst = this.drawObstacle(x, y, "left_crack_1").setScale(1.5 + Math.random())
            obst.x += obst.width / 2
        } else if (x > (this.roadWidth / 2) - SideZonesWidth) {
            x = this.roadWidth / 2;
            this.scene.graphicsLayer.lineStyle(2, 0xddFFdd, 1);
            // this.scene.graphicsLayer.fillCircle(x, y, 10);
            let obst = this.drawObstacle(x, y, "right_crack_1").setScale(1.5 + Math.random())
            obst.x -= obst.width / 2
        } else {
            this.scene.graphicsLayer.lineStyle(2, colors[this.colorIndex], 1);
            // this.scene.graphicsLayer.strokeCircle(x, y, 6);
            let crackNum = Math.floor(Math.random() * 4) + 1;
            this.drawObstacle(x, y, "crack_" + crackNum).setOrigin(0.5, 0.5).setScale(.5 + Math.random())
        }
    }



    update(topYBound, bottomYBound) {

        let obstacleYSpacing = 200

        let addObstacle = (yPx) => {
            if (Math.abs(yPx) % obstacleYSpacing !== 0) return;

            let yNumber = Math.ceil(Math.abs(yPx) / obstacleYSpacing) % this.psudoRandomArraySize

            let psudoRandomNumber = 0
            do {
                // "random" number generator between 0 & 1:
                psudoRandomNumber = this.psudoRandomArray[yNumber] / (this.psudoRandomArray.length - 1);
                if (this.psudoRandomArray[yNumber] % 3 === 0) return;

                yNumber += 4;
                yPx += 20;

                let xPx = Math.floor((psudoRandomNumber - 0.5) * (this.roadWidth - 40))
                this.addCorrectObstacle(xPx, yPx)

            } while (this.psudoRandomArray[yNumber] % 4 === 0);
        }

        // bottom y bound is always the (big or positive) number.
        if (bottomYBound > this.currentlySpawedAreaBottomBound) {
            for (let yPx = this.currentlySpawedAreaBottomBound; yPx < bottomYBound; yPx++) {
                addObstacle(yPx);
            }
            this.currentlySpawedAreaBottomBound = bottomYBound;
        }

        // top y bound is always the (small or negative) number.
        if (topYBound < this.currentlySpawedAreaTopBound) {
            for (let yPx = this.currentlySpawedAreaTopBound; yPx > topYBound; yPx--) {
                addObstacle(yPx);
            }
            this.currentlySpawedAreaTopBound = topYBound;
        }
    }
}