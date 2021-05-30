export class TileLoader {
    constructor(scene, tileMapName, tilePxSize, tileWorldSize, tileScaleFactor, tileZoomLevel, tileNumStartX, tileNumStartY, xTilingDirection, yTilingDirection, tileDepth, tileOpacity, tileURLGenerator, backupTileURLGenerator) {
        this.scene = scene
        this.scene.load.setCORS('anonymous');

        this.tilePxSize = tilePxSize;
        this.tileWorldSize = tileWorldSize;
        this.tileScaleFactor = window.map_scaling * tileScaleFactor;
        this.tileZoomLevel = tileZoomLevel;
        this.tileNumStartX = Math.floor(tileNumStartX);
        this.tileNumStartY = Math.floor(tileNumStartY);
        this.xTilingDirection = xTilingDirection;
        this.yTilingDirection = yTilingDirection;
        this.tileDepth = tileDepth;
        this.tileOpacity = tileOpacity;
        this.tileURLGenerator = tileURLGenerator;
        this.backupTileURLGenerator = backupTileURLGenerator;

        this.tileMapId = tileMapName;
        this.visibleTiles = {}
        this.placedTiles = {}
    }

    loadTile(tileName, tileImageUrl, callback, errorCallback) {
        if (tileImageUrl === null) return;
        this.scene.load.image(tileName, tileImageUrl)
        this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => { errorCallback() })
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            if (this.scene.textures.get(tileName).key !== "__MISSING") callback();
            else errorCallback();
        })
        this.scene.load.start()
    }

    addTile(tileNumX, tileNumY, gameX, gameY) {
        let tileName = `${this.tileMapId}|${tileNumX},${tileNumY}`
        this.visibleTiles[tileName] = true;
        if (this.placedTiles[tileName] != undefined) return false;

        // console.log(`loadingTile (Map=${this.tileMapId}) x:${tileNumX} y:${tileNumY} worldx:${gameX} worldy:${gameY} |` + this.tilePxSize + " {}" + this.tileWorldSize)
        // texture needs to be loaded to create a placeholder card
        const tile = this.scene.add.image(gameX, gameY, 'tile_loading_icon')
        tile.setScale(this.tileScaleFactor)
        tile.setAlpha(this.tileOpacity)
        tile.depth = this.tileDepth;

        if (this.scene.textures.get(tileName).key !== "__MISSING") {
            tile.setTexture(tileName)
        } else {
            // get the url for the texture
            let tileImageUrl = this.tileURLGenerator(this.tileZoomLevel, tileNumX, tileNumY, this.tilePxSize, this.tileWorldSize)
            this.loadTile(tileName, tileImageUrl, () => {
                // texture loaded sucssfully so use instead of the placeholder
                if (tile !== undefined && tile.scene !== undefined) tile.setTexture(tileName)
            }, () => {
                // Here means Tile Load Failed so try the backup url:
                tileImageUrl = this.backupTileURLGenerator(this.tileZoomLevel, tileNumX, tileNumY, this.tilePxSize, this.tileWorldSize)
                this.loadTile(tileName, tileImageUrl, () => {
                    // backup texture loaded sucssfully so use instead of the placeholder
                    if (tile !== undefined && tile.scene !== undefined) tile.setTexture(tileName)
                })
            })
        }

        // add the tile to the list of known tiles
        this.placedTiles[tileName] = tile;
        return tile;
    }

    update(leftXBound, rightXBound, topYBound, bottomYBound) {
        let tileScaledGameSize = this.tilePxSize * this.tileScaleFactor;
        var leftBound = leftXBound - tileScaledGameSize;  // x
        var rightBound = rightXBound + tileScaledGameSize * 2;  // x + width
        var topBound = topYBound - tileScaledGameSize;  // y
        var bottomBound = bottomYBound + tileScaledGameSize * 2;  // y + height

        let leftBoundTileNumX = Math.floor(leftBound / tileScaledGameSize);
        let topBoundTileNumY = Math.floor(topBound / tileScaledGameSize);
        let rightBoundTileNumX = Math.floor(rightBound / tileScaledGameSize);
        let bottomBoundTileNumY = Math.floor(bottomBound / tileScaledGameSize);

        this.visibleTiles = {}

        let xRange = range(leftBoundTileNumX, rightBoundTileNumX, 1);
        let yRange = range(topBoundTileNumY, bottomBoundTileNumY, 1);
        for (const xIndx of xRange) {
            for (const yIndx of yRange) {
                let gamePosX = xIndx * this.tilePxSize * this.tileScaleFactor;
                let gamePosY = yIndx * this.tilePxSize * this.tileScaleFactor;
                let tileNumX = xIndx * this.tileWorldSize * this.xTilingDirection + this.tileNumStartX
                let tileNumY = yIndx * this.tileWorldSize * this.yTilingDirection + this.tileNumStartY
                if (this.addTile(tileNumX, tileNumY, gamePosX, gamePosY)) continue;
            }
        }

        // delete tiles that have moved offscreen (not in visibleTiles object)
        for (const tileName in this.placedTiles) {
            if (this.visibleTiles[tileName] === undefined) {
                this.placedTiles[tileName].destroy();
                delete this.placedTiles[tileName];
            }
        }
    }
}

function range(start, stop, step) { // from https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};