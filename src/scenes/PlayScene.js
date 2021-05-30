import Phaser from 'phaser'
// import ScoreOverlay from "/src/prefabs/scoreOverlay"
// import Obstacle from "/src/prefabs/obstacle"
import Car from "/src/prefabs/Car"
import CameraController from "/src/prefabs/CameraController"
import BackgroundTileLoader from "/src/prefabs/BackgroundTileLoader"
import { TileLoader } from "../prefabs/TileLoader"
import { RoadLoader } from "../prefabs/RoadLoader"
import { ObstacleSpawner } from "../prefabs/ObstacleSpawner"
// import Wave from "/src/prefabs/Wave"
import CornerButton from "/src/prefabs/CornerButton"
import levelMap from "/src/prefabs/levelMap"
import highwayTileImage from "url:/assets/high_way_grunge.png"


export default class PlayScene extends Phaser.Scene {

    preload() {
    }

    constructor() {
        super({ key: "playScene" });
    }

    create() {
        this.gameOver = false;
        this.gameSize = this.game.scale.gameSize;
        this.matter.set30Hz();

        this.graphicsLayer = this.add.graphics(0, 0);
        this.graphicsLayer.setDepth(5)

        window.map_scaling = 1;
        // this.tileURLGenerator(this.tileZoomLevel, tileNumX, tileNumY, this.tilePxSize, this.tileWorldSize)
        // this.BackgroundTileLoader = new TileLoader(this, "background", 256, 1, 1, 18, 46089, 102621,
        //     (tileZoomLevel, tileNumX, tileNumY, tilePxSize, tileWorldUnitSize) => {
        //         return `./ImageMapTiles/${tileZoomLevel}/${tileNumX}/${tileNumY}.png`; // For use in production.
        //     }
        // );
        this.BackgroundTileLoader = new TileLoader(this, "background", 256, 153, 2, 18, -13000061.5, 4326425.7, 1, -1, 0, 1,
            (tileZoomLevel, tileNumX, tileNumY, tilePxSize, tileWorldUnitSize) => {
                // return `./ImageMapTiles/${tileZoomLevel}/${tileNumX}/${tileNumY}.png`; // For use in production.
                return `./mapTiles/background/[${tileWorldUnitSize}=${tilePxSize}]${tileNumX},${tileNumY}.png`
            },
            (tileZoomLevel, tileNumX, tileNumY, tilePxSize, tileWorldUnitSize) => {
                // return `./ImageMapTiles/${tileZoomLevel}/${tileNumX}/${tileNumY}.png`; // For use in production.
                let tileImageUrl = `https://services.nationalmap.gov/arcgis/rest/services/USGSNAIPPlus/MapServer/export?bbox=${tileNumX},${tileNumY},${tileNumX + tileWorldUnitSize},${tileNumY + tileWorldUnitSize}&size=${tilePxSize},${tilePxSize}&dpi=96&transparent=true&format=png32&layers=show:0,4,8,12,16,20,24,28,32&bboxSR=102100&imageSR=102100&f=image`
                let filePath = `./dist/mapTiles/background/[${tileWorldUnitSize}=${tilePxSize}]${tileNumX},${tileNumY}.png`
                fetch(`http://127.0.0.1:3000?url=${window.encodeURIComponent(tileImageUrl)}&filePath=${filePath}`).then()
                return tileImageUrl;
            }
        );

        this.HighwayTileLoader = new RoadLoader(this, "road", 116, 1, 3, 18, 0, 0, 1, -1, 1, .98);
        // this.load.image().once('')

        // this.RoadTileLoader = new TileLoader(this, "roads", 256 * 3, 153 * 3, 3, 18, -12998684.5, 4326425.7, 1, -1,
        //     (tileZoomLevel, tileNumX, tileNumY, tilePxSize, tileWorldUnitSize) => {
        //         // return `./ImageMapTiles/${tileZoomLevel}/${tileNumX}/${tileNumY}.png`; // For use in production.
        //         //      https://carto.nationalmap.gov/arcgis/rest/services/transportation/MapServer/export?dpi=96&transparent=true&format=png32&layers=show:2,3,4,7,8,9,13,14,15,16,25,26,27,28,29&bbox=-13440162.299691577,4469437.195388993,-13117598.040328287,4687741.3481713515&bboxSR=102100&imageSR=102100&size=1055,714&f=image
        //         return `https://carto.nationalmap.gov/arcgis/rest/services/transportation/MapServer/export?bbox=${tileNumX},${tileNumY},${tileNumX + tileWorldUnitSize},${tileNumY + tileWorldUnitSize}&size=${tilePxSize},${tilePxSize}&dpi=96&transparent=true&format=png32&layers=show:2,3,4,7,8,9,13,14,15,16,25,26,27,28,29&bboxSR=102100&imageSR=102100&f=image`
        //     },
        // );
        // this.RoadTileLoader = new TileLoader(this, "roads", 256, 1, 1, 18, this.BackgroundTileLoader.tileNumStartX, this.BackgroundTileLoader.tileNumStartY,
        //     (tileZoomLevel, tileNumX, tileNumY, tilePxSize, tileWorldSize) => {
        //         return `./RoadMapTiles/${tileZoomLevel}/${tileNumX}/${tileNumY}.png`; // For use in production.
        //     }
        // );

        //`./RoadMapTiles/${this.tileZoomLevel}/${tileNumX}/${tileNumY}.png`

        // setup variables
        levelMap.setupLevel(this, "lvl1")

        this.obstacleSpawner = new ObstacleSpawner(this)
        // this.obstacleSpawner.update(0, 2000)
        // define keys
        window.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        window.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        window.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        window.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        window.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        window.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // An array to hold all the obstacle instances in play.
        this.obstacleGameObjects = []

        // this.add.sprite(0,0,"desert_bg").setOrigin(0,0).setScale(2,2)

        this.add.sprite(0, 0, "tile").setOrigin(0.5, 0.5).setScale(.1, .1)
        // place background tile sprite



        // add car (player)
        this.car = new Car(this, 0, 0);

        // this.CameraUpdater = new CameraController(this.cameras.main, this.car.x, this.car.y)
        this.cameras.main.startFollow(this.car);
        this.cameras.main.setDeadzone(40, 40);
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
        this.car.update();  // update car sprite

        if (this.game.getFrame() % 3 == 0) {
            let worldView = this.cameras.main.worldView;
            this.BackgroundTileLoader.update(worldView.left, worldView.right, worldView.top, worldView.bottom)
            this.HighwayTileLoader.update(worldView.left, worldView.right, worldView.top, worldView.bottom)
            // this.RoadTileLoader.update(this.car.x, this.car.y, this.car.x, this.car.y)
            this.obstacleSpawner.update(worldView.top - 500, worldView.bottom + 500)
        }
        // this.CameraUpdater.update(this.car.x, this.car.y, 0, 0)
        let newLevelName = levelMap.checkTargetOverlap("lvl1", this.car.x, this.car.y)
        if (newLevelName != null) console.count(newLevelName);
    }

}