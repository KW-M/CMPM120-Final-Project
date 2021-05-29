import images_intersection_1 from 'url:/assets/intersection_1.png';

let levelMaps = {
    "lvl1": {
        carStart: { x: 0 * window.map_scaling, y: 0 * window.map_scaling },
        gameBounds: { top: -5000 * window.map_scaling, left: -5000 * window.map_scaling, width: 10000 * window.map_scaling, height: 10000 * window.map_scaling },
        intersection: {
            x: -5.5967792042944 * window.map_scaling,
            y: -10.4765104327641 * window.map_scaling,
            angle: -30,
            scaling: .5 * window.map_scaling,
            spriteUrl: images_intersection_1,
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



export default {
    setupLevel:
        function (scene, levelName) {
            let lvl = levelMaps[levelName];
            scene.cameras.main.setBounds(lvl.gameBounds.top, lvl.gameBounds.left, lvl.gameBounds.width, lvl.gameBounds.height, false)

            const intersectionImage = scene.add.image(lvl.intersection.x, lvl.intersection.y, '')
            intersectionImage.setOrigin(0.5, 1)
            intersectionImage.setAngle(lvl.intersection.angle)
            intersectionImage.setPosition(lvl.intersection.x, lvl.intersection.y)
            intersectionImage.depth = 10;
            intersectionImage.setScale(lvl.intersection.scaling)

            let spriteName = levelName + "_intersection"
            scene.load.image(spriteName, lvl.intersection.spriteUrl);
            scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                // texture loaded so use instead of the placeholder
                intersectionImage.setTexture(spriteName)
            })
            scene.load.start()

            console.log(scene.graphicsLayer)
            // for debugging targets
            let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]
            for (let i = 0; i < lvl.sceneTransitionTargets.length; i++) {
                const target = lvl.sceneTransitionTargets[i];
                scene.graphicsLayer.lineStyle(2, colors[i], 1);
                scene.graphicsLayer.strokeCircle(target.x, target.y, target.radius);
            }
            for (let i = 0; i < lvl.intersection.sceneTransitionTargets.length; i++) {
                const target = lvl.intersection.sceneTransitionTargets[i];
                let targetVector = new Phaser.Math.Vector2(target.x, target.y).rotate(lvl.intersection.angle / (180 / Math.PI)).scale(lvl.intersection.scaling).add(lvl.intersection)
                scene.graphicsLayer.lineStyle(2, colors[i], 1);
                scene.graphicsLayer.strokeCircle(targetVector.x, targetVector.y, target.radius);
            }
        },

    checkTargetOverlap:
        function (currentLvlName, carX, carY) {
            let lvl = levelMaps[currentLvlName];
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
}