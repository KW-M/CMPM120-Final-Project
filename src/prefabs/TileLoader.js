export class TileLoader {


    constructor(scene, tileMapName, tilePxSize, tileWorldSize, tileScaleFactor, tileZoomLevel, tileNumStartX, tileNumStartY, xTilingDirection, yTilingDirection, tileURLGenerator) {
        this.scene = scene
        this.scene.load.setCORS('anonymous');

        this.tilePxSize = tilePxSize;
        this.tileWorldSize = tileWorldSize;
        this.tileScaleFactor = window.map_scaling * tileScaleFactor;
        this.tileZoomLevel = tileZoomLevel;
        this.tileNumStartX = Math.floor(tileNumStartX);
        this.tileNumStartY = Math.floor(tileNumStartY);
        this.xTilingDirection = xTilingDirection;
        this.yTilingDirection = yTilingDirection
        this.tileURLGenerator = tileURLGenerator;

        this.tileMapId = tileMapName;
        this.visibleMapTiles = {}
    }

    addTile(tileNumX, tileNumY, gameX, gameY) {
        let tileName = `${this.tileMapId}|${tileNumX},${tileNumY}`
        if (this.visibleMapTiles[tileName] != undefined) return false;

        console.log(`loadingTile (Map=${this.tileMapId}) x:${tileNumX} y:${tileNumY} worldx:${gameX} worldy:${gameY}`)
        // texture needs to be loaded to create a placeholder card
        const tile = this.scene.add.image(gameX, gameY, '')
        tile.setScale(this.tileScaleFactor)
        tile.setAlpha(0.8)
        tile.depth = 1;

        // ask the LoaderPlugin to load the texture
        let tileImageUrl = this.tileURLGenerator(this.tileZoomLevel, tileNumX, tileNumY, this.tilePxSize, this.tileWorldSize)
        this.scene.load.image(tileName, tileImageUrl) // For use in production.
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            // texture loaded so use instead of the placeholder
            tile.setTexture(tileName)
        })
        this.scene.load.start()

        // add the tile to the list of known tiles
        this.visibleMapTiles[tileName] = tile;
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

        let xRange, yRange;
        if (this.xTilingDirection > 0) {
            xRange = range(leftBoundTileNumX, rightBoundTileNumX, this.xTilingDirection)
        } else {
            xRange = range(rightBoundTileNumX, leftBoundTileNumX, this.xTilingDirection)
        }
        if (this.yTilingDirection > 0) {
            yRange = range(topBoundTileNumY, bottomBoundTileNumY, this.yTilingDirection)
        } else {
            yRange = range(bottomBoundTileNumY, topBoundTileNumY, this.yTilingDirection)
        }

        for (const xIndx of xRange) {
            for (const yIndx of yRange) {
                let gamePosX = xIndx * this.tilePxSize * this.tileScaleFactor;
                let gamePosY = yIndx * this.tilePxSize * this.tileScaleFactor;
                let tileNumX = xIndx * this.tileWorldSize + this.tileNumStartX
                let tileNumY = yIndx * this.tileWorldSize + this.tileNumStartY
                if (this.addTile(tileNumX, tileNumY, gamePosX, gamePosY)) break;
                console.log(xIndx, yIndx)
            }
        }
        console.log(leftXBound, rightXBound)
        console.log("xIndx, yIndx")
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