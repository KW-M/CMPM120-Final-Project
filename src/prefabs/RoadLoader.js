export class RoadLoader {
    constructor(scene, tileMapName, tilePxSize, tileWorldSize, tileScaleFactor, tileZoomLevel, tileNumStartX, tileNumStartY, xTilingDirection, yTilingDirection, tileDepth, tileOpacity, tileURLGenerator, backupTileURLGenerator) {
        this.scene = scene

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

        this.tileMapId = tileMapName;
        this.visibleTiles = {}
        this.placedTiles = {}
    }

    addTile(tileNumX, tileNumY, gameX, gameY) {
        this.visibleTiles[tileNumY] = true;
        if (this.tileNumStartX != tileNumX || this.placedTiles[tileNumY] != undefined) return false;

        // texture needs to be loaded to create a placeholder card
        const tile = this.scene.add.image(gameX, gameY, 'highway_tile')
        tile.setScale(this.tileScaleFactor)
        tile.setAlpha(this.tileOpacity)
        tile.depth = this.tileDepth;

        // add the tile to the list of known tiles
        this.placedTiles[tileNumY] = tile;
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
                this.addTile(tileNumX, tileNumY, gamePosX, gamePosY);
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