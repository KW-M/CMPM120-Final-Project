import { TileLoader } from "../prefabs/TileLoader"
import { RoadLoader } from "../prefabs/RoadLoader"
import { ObstacleSpawner } from "../prefabs/ObstacleSpawner"

let levelMaps = {
    "lvl1": {
        carStart: { x:-300, y: 50, angle: 80 },
        backgroundOffset: { longitudeX: 4315715, lattitudeY: -13000062 },
        gameBounds: { top: -1850, left: -5000, bottom: 200, right: 5000 },
        roadWidth: 90 * 3,
        obstacleLengthwiseSpacing: 200,
        intersections: [
            {
                x: 0,
                y: -1000,
                angle: 0,
                scaling: 3,
                textureName: "highway_y_intersection",
                sceneTransitionTargets: [
                    { x: 0, y: -100, radius: 100, label: "Alien_Encounter_1", alienStoryLeanAdjustment: 0, levelEpisodeAdjustemnt: 0 },
                    { x: 0, y: -300, radius: 200, label: "Level_2_Toward_Elevator", targetLvl: "lvl2", alienStoryLeanAdjustment: 1, levelEpisodeAdjustemnt: 1 },
                    { x: 290, y: -110, radius: 120, label: "Level_2_Toward_Home", targetLvl: "lvl2", alienStoryLeanAdjustment: -1, levelEpisodeAdjustemnt: 1 },
                ] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
            },
            {
                x: -380,
                y: 0,
                angle: 0,
                scaling: 0.84,
                textureName: "highway_house_intersection",
                sceneTransitionTargets: [] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
            },
        ],
        sceneTransitionTargets: [] // uses global position in map-scaled pixels
    },
    "lvl2": {
        carStart: { x: 0, y: 0, angle: -90 },
        backgroundOffset: { longitudeX: 4239215, lattitudeY: -13000062 }, // Only add or subtract increments of 153!!!!!!!!!!!!!
        gameBounds: { top: -2200, left: -5000, bottom: 200, right: 5000 },
        roadWidth: 90 * 3,
        obstacleLengthwiseSpacing: 180,
        intersections: [
            {
                x: 0,
                y: -2000,
                angle: 0,
                scaling: 0.84,
                textureName: "highway_y_intersection",
                sceneTransitionTargets: [
                    { x: 100, y: -120, radius: 50, label: "Alien_Encounter_2", alienStoryLeanAdjustment: 0, levelEpisodeAdjustemnt: 0 },
                    { x: 0, y: -300, radius: 200, label: "Level_3_Toward_Elevator", targetLvl: "lvl3", alienStoryLeanAdjustment: 1, levelEpisodeAdjustemnt: 1 },
                    { x: 290, y: -110, radius: 120, label: "Level_3_Toward_Home", targetLvl: "lvl3", alienStoryLeanAdjustment: -1, levelEpisodeAdjustemnt: 1 },
                ] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
            },
        ],
        sceneTransitionTargets: [
            { x: 0, y: 600, radius: 500, label: "back_to_lvl_1", targetLvl: "lvl1", alienStoryLeanAdjustment: 0, levelEpisodeAdjustemnt: -1 },
        ] // uses global position in map-scaled pixels
    },

    "lvl3": {
        carStart: { x: 0, y: 0, angle: -90 },
        backgroundOffset: { longitudeX: 4239215, lattitudeY: -13000062 }, // Only add or subtract increments of 153!!!!!!!!!!!!!
        gameBounds: { top: -3850, left: -5000, bottom: 200, right: 5000 },
        roadWidth: 90 * 3,
        obstacleLengthwiseSpacing: 70,
        intersections: [
            {
                x: 0,
                y: -3000,
                angle: 0,
                scaling: 0.84,
                textureName: "highway_y_intersection",
                sceneTransitionTargets: [
                    { x: 100, y: -120, radius: 50, label: "Alien_Encounter_3", alienStoryLeanAdjustment: 0, levelEpisodeAdjustemnt: 0 },
                    { x: 0, y: -300, radius: 200, label: "Level_4_Toward_Elevator", targetLvl: "lvl4", alienStoryLeanAdjustment: 1, levelEpisodeAdjustemnt: 1 },
                    { x: 290, y: -110, radius: 120, label: "Level_4_Toward_Home", targetLvl: "lvl4", alienStoryLeanAdjustment: -1, levelEpisodeAdjustemnt: 1 },
                ] // uses position relative to position/rotation of intersection origin in map-scaled pixels (built in)
            },
        ],
        sceneTransitionTargets: [
            { x: 0, y: 600, radius: 500, label: "back_to_lvl_2", targetLvl: "lvl2", alienStoryLeanAdjustment: 0, levelEpisodeAdjustemnt: -1 },
        ] // uses global position in map-scaled pixels
    }
}

export class LevelMap {
    constructor(scene) {

        this.scene = scene
        this.debugRect1 = this.scene.add.rectangle(0, 0, 20, 20, 0xFF00FF).setDepth(100)
        this.currentTargetLabel = null;
        this.currentLvlConfig = null;
        this.intersectionImages = [];

        this.offroadRenderTexture = this.scene.add.renderTexture(0, 0, 1000, 1000).setDepth(200).setScrollFactor(0, 0)

        this.alienStoryLean = 0; // number is more positive the more you align with the right alien and more negative if you align with the left alien.
        this.alienStoryLeanHistory = [0];
        this.levelEpisodeValue = 0; // number counts up for each new level and down if you go backward.

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

        this.HighwayTileLoader = new RoadLoader(this.scene, "road", 116, 1, 3, 18, 0, 0, 1, -1, 1, .98, this.offroadRenderTexture);
        this.obstacleSpawner = new ObstacleSpawner(this.scene, this.scene.graphicsLayer, 0)
    }

    addIntersection(textureName, x, y, scaling, angle) {
        this.intersectionImages.push(
            this.scene.add.image(x, y, textureName).setDepth(2).setScale(scaling)
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
        for (const intersection of lvl.intersections) {
            for (let i = 0; i < intersection.sceneTransitionTargets.length; i++) {
                const target = intersection.sceneTransitionTargets[i];
                let targetVector = new Phaser.Math.Vector2(target.x, target.y).rotate(intersection.angle / (180 / Math.PI)).scale(intersection.scaling).add(intersection)
                this.scene.graphicsLayer.lineStyle(2, colors[i], 1);
                this.scene.graphicsLayer.strokeCircle(targetVector.x, targetVector.y, target.radius);
            }
        }
    }

    clearCurrentLevel() {
        for (const intersectionImage of this.intersectionImages) {
            intersectionImage.destroy()
        }
        this.scene.graphicsLayer.clear()
        this.obstacleSpawner.reset();
        this.scene.car.clearSkidMarks();
    }

    setupLevel(levelName) {
        if (this.currentLvlConfig) {
            this.currentLvlConfig.carStart = { x: this.scene.car.x, y: this.scene.car.y, angle: (this.scene.car.angle + 180 % 360) }
            this.clearCurrentLevel();
        }

        let lvl = this.currentLvlConfig = levelMaps[levelName];
        if (lvl === undefined) console.warn("Level NOT FOUND:" + levelName)
        else console.log("New Level:" + levelName, lvl, "current lean:" + this.alienStoryLean + " current level episode:" + this.levelEpisodeValue)

        this.scene.car.setPosition(lvl.carStart.x, lvl.carStart.y).setAngle(lvl.carStart.angle)

        this.BackgroundTileLoader.tileNumStartX = lvl.backgroundOffset.lattitudeY;
        this.BackgroundTileLoader.tileNumStartY = lvl.backgroundOffset.longitudeX;

        this.HighwayTileLoader.roadEndTopBound = lvl.intersections[0].y;
        this.obstacleSpawner.roadWidth = this.currentLvlConfig.roadWidth;
        this.obstacleSpawner.obstacleLengthwiseSpacing = this.currentLvlConfig.obstacleLengthwiseSpacing
        // sets the bounds of the level to the point of
        this.scene.cameras.main.setBounds(lvl.gameBounds.left, lvl.gameBounds.top, lvl.gameBounds.right - lvl.gameBounds.left, lvl.gameBounds.bottom - lvl.gameBounds.top, false)

        for (const intersection of lvl.intersections) {
            this.addIntersection(intersection.textureName, intersection.x, intersection.y, intersection.scaling, intersection.angle)
        }
        this.drawDebugCircleZones(lvl)

        this.checkTargetEntry(this.scene.car.x, this.scene.car.y, false)

        return lvl
    }

    checkTargetEntry(carX, carY, doLogTransition) {
        let targetDetails = this.checkTargetOverlap(carX, carY)
        if (targetDetails === null) {
            this.currentTargetLabel = null;
            return null;
        }
        if (targetDetails.label !== this.currentTargetLabel) {
            this.currentTargetLabel = targetDetails.label
            if (doLogTransition) {
                if (targetDetails.levelEpisodeAdjustemnt >= 1) {
                    //if we're going forwards in episode levels.
                    this.alienStoryLeanHistory[this.levelEpisodeValue] = this.alienStoryLean;
                    this.alienStoryLean += targetDetails.alienStoryLeanAdjustment;
                    this.levelEpisodeValue += targetDetails.levelEpisodeAdjustemnt;
                } else if (targetDetails.levelEpisodeAdjustemnt <= -1) {
                    //if we're going backwards in episode levels.
                    this.levelEpisodeValue += targetDetails.levelEpisodeAdjustemnt;
                    this.alienStoryLean = this.alienStoryLeanHistory[this.levelEpisodeValue];
                }
            }
            return targetDetails
        } else return null;
    }

    checkTargetOverlap(carX, carY) {
        let lvl = this.currentLvlConfig
        for (let i = 0; i < lvl.sceneTransitionTargets.length; i++) {
            const target = lvl.sceneTransitionTargets[i];
            let carTargetDistance = new Phaser.Math.Vector2(target.x, target.y).scale(-1).add(new Phaser.Math.Vector2(carX, carY)).length()
            if (carTargetDistance < target.radius) return target;
        }
        for (const intersection of lvl.intersections) {
            for (let i = 0; i < intersection.sceneTransitionTargets.length; i++) {
                const target = intersection.sceneTransitionTargets[i];
                let targetVector = new Phaser.Math.Vector2(target.x, target.y).rotate(intersection.angle / (180 / Math.PI)).scale(intersection.scaling).add(intersection)
                let carTargetDistance = targetVector.scale(-1).add(new Phaser.Math.Vector2(carX, carY)).length()
                if (carTargetDistance < target.radius) return target;
            }
        }
        return null;
    }

    drawIntersectionsOnRenderTexture() {
        this.offroadRenderTexture.beginDraw();
        for (const intersectionImg of this.intersectionImages) {
            this.offroadRenderTexture.batchDraw(intersectionImg, intersectionImg.x, intersectionImg.y)
        }
        this.offroadRenderTexture.endDraw();
    }

    update(cameraWorldView) {
        this.offroadRenderTexture.clear();
        this.offroadRenderTexture.camera.setScroll(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY);
        // Call once:
        this.offroadRenderTexture.fill(0x000000, .2);
        this.drawIntersectionsOnRenderTexture();
        this.BackgroundTileLoader.update(cameraWorldView.left, cameraWorldView.right, cameraWorldView.top, cameraWorldView.bottom)
        this.HighwayTileLoader.update(cameraWorldView.left, cameraWorldView.right, cameraWorldView.top, cameraWorldView.bottom)
        this.obstacleSpawner.update(cameraWorldView.top - 500, cameraWorldView.bottom + 500)
        this.offroadRenderTexture.draw('car', Math.floor(this.scene.car.x - this.scene.cameras.main.scrollX), Math.floor(this.scene.car.y - this.scene.cameras.main.scrollY))
        this.offroadRenderTexture.snapshotPixel(Math.floor(this.scene.car.x - this.scene.cameras.main.scrollX), Math.floor(this.scene.car.y - this.scene.cameras.main.scrollY), (color) => {
            this.debugRect1.setDepth(10000).setFillStyle(color.color, 1).setScrollFactor(0, 0)
            this.scene.car.isOffroad = (color.g === 0 && color.b === 0 && color.r === 0);
        })
        this.offroadRenderTexture.visible = false;
    }
}