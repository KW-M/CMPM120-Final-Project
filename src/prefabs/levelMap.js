import { TileLoader } from "../prefabs/TileLoader"
import { RoadLoader } from "../prefabs/RoadLoader"
import { ObstacleSpawner } from "../prefabs/ObstacleSpawner"

let levelMaps = {
    "lvl1": {
        carStart: { x: 0 * window.map_scaling, y: 0 * window.map_scaling, angle: 180 },
        backgroundOffset: { longitudeX: 4315715, lattitudeY: -13000062 },
        gameBounds: { top: -5000 * window.map_scaling, left: -5000 * window.map_scaling, width: 10000 * window.map_scaling, height: 6000 * window.map_scaling },
        roadWidth: 90 * 3,
        intersection: {
            x: -5 * window.map_scaling,
            y: -10 * window.map_scaling,
            angle: 0,
            scaling: .5 * window.map_scaling,
            spriteName: "highway_intersection_tile",
            sceneTransitionTargets: [
                { x: 0, y: -100, radius: 10 * window.map_scaling, lvlName: "I1" },
            ] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
        },
        sceneTransitionTargets: [
            { x: -2 * window.map_scaling, y: -5 * window.map_scaling, radius: 10 * window.map_scaling, lvlName: "G1" },
            { x: -800 * window.map_scaling, y: -50 * window.map_scaling, radius: 20 * window.map_scaling, lvlName: "G2" },
        ] // uses global position in map-scaled pixels
    }
}

export class LevelMap {
    constructor(scene) {
        this.scene = scene
        this.currentLvlConfig = levelMaps["lvl1"];
        this.intersectionImages = [];

        this.BackgroundTileLoader = new TileLoader(this.scene, "background", 256, 153, 2, 18, -13000062, 4315715, 1, -1, 0, 1,
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
            this.scene.add.image(x, y, textureName).setOrigin(0.5, 1).setAngle(angle).setDepth(4).setScale(scaling)
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

    setupLevel(levelName) {
        let lvl = this.currentLvlConfig = levelMaps[levelName];
        this.scene.cameras.main.setBounds(lvl.gameBounds.top, lvl.gameBounds.left, lvl.gameBounds.width, lvl.gameBounds.height, false)

        for (const intersectionImage of this.intersectionImages) {
            intersectionImage.destory()
        }
        this.addIntersection(lvl.intersection.textureName, lvl.intersection.x)
        this.drawDebugCircleZones(lvl)
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