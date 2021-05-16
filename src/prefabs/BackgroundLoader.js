export default class BackgroundLoader extends Phaser.GameObjects.GameObject {
    constructor(scene) {
        super(scene, 'background_loader')
        scene.add.existing(this);
        this.scene = scene
        this.scene.load.setCORS('anonymous');


        this.tileSize = 256;
        this.tileScaleFactor = 9;
        //16/25537/11844
        // 18/104297/47802
        this.tileZoomLevel = 18;
        this.tileNumStartY = 104297;
        this.tileNumStartX = 47802;


        this.visibleMapTiles = {}
    }

    addTile(tileNumX, tileNumY, worldX, worldY) {
        let tileName = `${tileNumX},${tileNumY}`
        if (this.visibleMapTiles[tileName] != undefined) return false;

        console.log("loadingTile", tileNumX, tileNumY, worldX, worldY)
        // texture needs to be loaded to create a placeholder card
        const tile = this.scene.add.image(worldX, worldY, 'car')
        tile.setScale(this.tileScaleFactor)

        // ask the LoaderPlugin to load the texture
        // this.scene.load.image(tileName, `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${this.tileZoomLevel}/${tileNumY}/${tileNumX}`)
        this.scene.load.image(tileName, `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${this.tileZoomLevel}/${tileNumY}/${tileNumX}`) // For testing, Don't use in production!!!!
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            // texture loaded so use instead of the placeholder
            tile.setTexture(tileName)
        })
        this.scene.load.start()
        this.visibleMapTiles[tileName] = tile;

        return tile;
    }

    create() {
        for (let xIndx = 0; xIndx < 5; xIndx++) {
            for (let yIndx = 0; yIndx < 5; yIndx++) {
                let posX = xIndx * this.tileSize * this.tileScaleFactor;
                let posY = yIndx * this.tileSize * this.tileScaleFactor;
                let tileNumX = xIndx + this.tileNumStartX
                let tileNumY = yIndx + this.tileNumStartY
                this.addTile(tileNumX, tileNumY, posX, posY);

            }
        }
    }

    update(camera) {
        let tileSize = this.tileSize * this.tileScaleFactor;
        let worldView = camera.worldView;
        var leftBound = worldView.left - tileSize;  // x
        var rightBound = worldView.right + tileSize * 2;  // x + width
        var topBound = worldView.top - tileSize;  // y
        var bottomBound = worldView.bottom + tileSize * 2;  // y + height

        let leftBoundTileNumX = Math.floor(leftBound / tileSize);
        let topBoundTileNumY = Math.floor(topBound / tileSize);
        let rightBoundTileNumX = Math.floor(rightBound / tileSize);
        let bottomBoundTileNumY = Math.floor(bottomBound / tileSize);

        for (let xIndx = leftBoundTileNumX; xIndx < rightBoundTileNumX; xIndx++) {
            for (let yIndx = topBoundTileNumY; yIndx < bottomBoundTileNumY; yIndx++) {
                let posX = xIndx * this.tileSize * this.tileScaleFactor;
                let posY = yIndx * this.tileSize * this.tileScaleFactor;
                let tileNumX = xIndx + this.tileNumStartX
                let tileNumY = yIndx + this.tileNumStartY
                if (this.addTile(tileNumX, tileNumY, posX, posY)) break;

            }
        }

    }
}