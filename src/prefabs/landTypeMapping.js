export default class BackgroundLoader extends Phaser.GameObjects.GameObject {
    constructor(scene) {
        super(scene, 'background_loader')
        scene.add.existing(this);
        this.scene = scene
        this.scene.load.setCORS('anonymous');


        this.tileSize = 256;
        this.tileScaleFactor = 1;
        //16/25537/11844
        // 18/104297/47802
        // 16/25731/11511 // Badwatter Bason - Death Valley
        // this.tileZoomLevel = 18;
        // this.tileNumStartY = 25731 * 2 * 2;
        // this.tileNumStartX = 11511 * 2 * 2;


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

    }

    update(carX, carY, camera) {

    }
}