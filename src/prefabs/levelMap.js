import { TileLoader } from "../prefabs/TileLoader"
import { RoadLoader } from "../prefabs/RoadLoader"
import { ObstacleSpawner } from "../prefabs/ObstacleSpawner"

let levelMaps = {
    "lvl1": {
        carStart: { x: 0, y: 0, angle: 180 },
        backgroundOffset: { longitudeX: 4315715, lattitudeY: -13000062 },
        gameBounds: { top: -1550, left: -5000, bottom: 100, right: 5000 },
        roadWidth: 90 * 3,
        obstacleLengthwiseSpacing: 200,
        intersection: {
            x: 0,
            y: -1000,
            angle: 0,
            scaling: 1.52,
            textureName: "highway_intersection_tile",
            sceneTransitionTargets: [
                { x: 100, y: -120, radius: 50, lvlName: "Alien_Encounter_1" },
                { x: 0, y: -300, radius: 200, lvlName: "Level_2_Toward_Elevator" },
                { x: 290, y: -110, radius: 120, lvlName: "Level_2_Toward_Home" },
            ] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
        },
        sceneTransitionTargets: [
            { x: -2, y: -5, radius: 10, lvlName: "G1" },
            { x: -800, y: -50, radius: 20, lvlName: "G2" },
        ] // uses global position in map-scaled pixels
    },
    "lvl2": {
        carStart: { x: 200, y: 0, angle: 90 },
        backgroundOffset: { longitudeX: 4239215, lattitudeY: -13000062 }, // Only add or subtract increments of 153!!!!!!!!!!!!!
        gameBounds: { top: -1350, left: -5000, bottom: 100, right: 5000 },
        roadWidth: 90 * 3,
        obstacleLengthwiseSpacing: 70,
        intersection: {
            x: 0,
            y: 100,
            angle: 0,
            scaling: 1.52,
            textureName: "highway_intersection_tile",
            sceneTransitionTargets: [
                { x: 100, y: -120, radius: 50, lvlName: "Alien_Encounter_1" },
                { x: 0, y: -300, radius: 200, lvlName: "Level_2_Toward_Elevator" },
                { x: 290, y: -110, radius: 120, lvlName: "Level_1_Toward_Home" },
            ] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
        },
        sceneTransitionTargets: [
            { x: 0, y: 0, radius: 2, lvlName: "G1" },
        ] // uses global position in map-scaled pixels
    }
}

export class LevelMap {
    constructor(scene) {
        this.scene = scene
        this.currentTargetLvlName = null;
        this.currentLvlConfig = levelMaps["lvl1"];
        this.intersectionImages = [];

        this.BackgroundTileLoader = new TileLoader(this.scene, "background", 256, 153, 2, 18, 0, 0, 1, -1, 0, 1,
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

        this.HighwayTileLoader = new RoadLoader(this.scene, "road", 116, 1, 3, 18, 0, 0, 1, -1, 1, .98);
        this.obstacleSpawner = new ObstacleSpawner(this.scene, this.scene.graphicsLayer, this.currentLvlConfig.roadWidth)
    }

    addIntersection(textureName, x, y, scaling, angle) {
        this.intersectionImages.push(
            this.scene.add.image(x, y, textureName).setOrigin(0.5, 1).setAngle(angle).setDepth(2).setScale(scaling)
        )
    }

    drawDebugCircleZones() {
        // for debugging targets
        let lvl = this.currentLvlConfig
        let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]
        for (let i = 0; i < lvl.sceneTransitionTargets.length; i++) {
            const target = lvl.sceneTransitionTargets[i];
            this.scene.graphicsLayer.lineStyle(2, colors[i], 1);
            this.scene.graphicsLayer.strokeCircle(target.x, target.y, target.radius);
        }
        for (let i = 0; i < lvl.intersection.sceneTransitionTargets.length; i++) {
            const target = lvl.intersection.sceneTransitionTargets[i];
            let targetVector = new Phaser.Math.Vector2(target.x, target.y).rotate(lvl.intersection.angle / (180 / Math.PI)).scale(lvl.intersection.scaling).add(lvl.intersection)
            this.scene.graphicsLayer.lineStyle(2, colors[i], 1);
            this.scene.graphicsLayer.strokeCircle(targetVector.x, targetVector.y, target.radius);
        }
    }

    clearCurrentLevel() {
        for (const intersectionImage of this.intersectionImages) {
            console.log(intersectionImage)
            intersectionImage.destroy()
        }
        this.scene.graphicsLayer.clear()
        this.obstacleSpawner.reset();
        this.scene.car.clearSkidMarks();
    }

    setupLevel(levelName) {
        this.clearCurrentLevel();

        let lvl = this.currentLvlConfig = levelMaps[levelName];
        console.log("newLevel:", levelName, lvl)

        this.scene.car.setPosition(lvl.carStart.x, lvl.carStart.y).setAngle(lvl.carStart.angle)

        this.BackgroundTileLoader.tileNumStartX = lvl.backgroundOffset.lattitudeY;
        this.BackgroundTileLoader.tileNumStartY = lvl.backgroundOffset.longitudeX;

        this.HighwayTileLoader;
        this.obstacleSpawner.roadWidth = this.currentLvlConfig.roadWidth;
        this.obstacleSpawner.obstacleLengthwiseSpacing = this.currentLvlConfig.obstacleLengthwiseSpacing

        // this.scene.cameras.main.setBounds(lvl.gameBounds.left, lvl.gameBounds.top, lvl.gameBounds.right - lvl.gameBounds.left, lvl.gameBounds.bottom - lvl.gameBounds.top, false)
        this.addIntersection(lvl.intersection.textureName, lvl.intersection.x, lvl.intersection.y, lvl.intersection.scaling, lvl.intersection.angle)
        this.drawDebugCircleZones(lvl)

        return lvl
    }

    checkTargetEntry(carX, carY) {
        let targetLvlName = this.checkTargetOverlap(carX, carY)
        if (targetLvlName !== this.currentTargetLvlName) {
            this.currentTargetLvlName = targetLvlName
            return targetLvlName
        } else return null;
    }

    checkTargetOverlap(carX, carY) {
        let lvl = this.currentLvlConfig
        for (let i = 0; i < lvl.sceneTransitionTargets.length; i++) {
            const target = lvl.sceneTransitionTargets[i];
            let carTargetDistance = new Phaser.Math.Vector2(target.x, target.y).scale(-1).add(new Phaser.Math.Vector2(carX, carY)).length()
            if (carTargetDistance < target.radius) return target.lvlName;
        }
        for (let i = 0; i < lvl.intersection.sceneTransitionTargets.length; i++) {
            const target = lvl.intersection.sceneTransitionTargets[i];
            let targetVector = new Phaser.Math.Vector2(target.x, target.y).rotate(lvl.intersection.angle / (180 / Math.PI)).scale(lvl.intersection.scaling).add(lvl.intersection)
            let carTargetDistance = targetVector.scale(-1).add(new Phaser.Math.Vector2(carX, carY)).length()
            if (carTargetDistance < target.radius) return target.lvlName;
        }
        return null;
    }

    update(cameraWorldView) {
        this.BackgroundTileLoader.update(cameraWorldView.left, cameraWorldView.right, cameraWorldView.top, cameraWorldView.bottom)
        this.HighwayTileLoader.update(cameraWorldView.left, cameraWorldView.right, cameraWorldView.top, cameraWorldView.bottom)
        this.obstacleSpawner.update(cameraWorldView.top - 500, cameraWorldView.bottom + 500)
    }
}