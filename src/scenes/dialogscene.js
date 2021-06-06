export default class Dialogscene extends Phaser.Scene {
    constructor() {
        super("dialogscene")
    }

    preload() {
        // this.load.script('rexdialogquest', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdialogquest.min.js');

    }

    create() {

        //Background
        // var image = scene.add.image(x, y, key, frame);
        var image_dialogue = this.add.image(0, 0, 'dialogue background');
        image_dialogue.setOrigin(0.5, 0.5)
        image_dialogue.setScale(3, 3.2)

        //var image_dialoguebox = this.add.image(1, 1, 'Dialogue box');
        //image_dialoguebox.setposition
        //image_dialoguebox.setOrigin (0,0)
        //image_dialoguebox.setScale (1.5,1.5)

        //rectangle
        //this.add.rectangle(1, 1, 1000, 1000, 0x000000)

        this.input.keyboard.on('keydown-SPACE', () => { this.fadeSceneTransition("playScene") });

        let scene = this;
        console.log(scene)
        Alert(scene, '“Good”: \nLook Karen, we both know the world\n has been unjust to your needs,\n but can you for once in your life\n think about others instead of yourself? ')
            .then(() => {
                return Alert(scene, ' I know you like asking to speak to the manager, \nbut have you ever thought about \nwhy people make fun of you for that?');
            }).then(() => {
                return Alert(scene, '“Bad”: \nLook Karen, I have been watching you for a while \nand we both know that saving others won’t make them respect you.');
            }).then(() => {
                return Alert(scene, '33 OKKKKK');
            }).then(() => {
                return Alert(scene, '44 Goodbye');
            }).then(() => {
                this.fadeSceneTransition("playScene")
            })

        // handle when the screen size changes (device rotated, window resized, etc...)
        let resizeHandler = (gameSize, baseSize, displaySize, resolution) => {
            if (this.cameras.main === undefined) return;
            this.cameras.resize(gameSize.width, gameSize.height);
            this.cameras.main.centerToSize().setZoom(Math.min(gameSize.width / (image_dialogue.width * image_dialogue.scaleX), gameSize.height / (image_dialogue.height * image_dialogue.scaleY)))
            this.cameras.main.centerOn(0, 0)
        }; resizeHandler(this.game.scale.gameSize)
        this.scale.on('resize', resizeHandler)
    }

    update() { }

    fadeSceneTransition(targetSceneName) {
        this.transitionInProgress = true;
        this.scene.transition({ target: targetSceneName, duration: 2000, sleep: true, moveBelow: true });
        let targetScene = this.scene.manager.scenes[this.scene.getIndex(targetSceneName)]
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        targetScene.cameras.main.fadeOut(0, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            targetScene.cameras.main.fadeIn(1000, 0, 0, 0);
            this.scene.manager.bringToTop(targetSceneName);
            targetScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (cam, effect) => {
                this.transitionInProgress = false;
            })
        })
    }
}

var CreateAlertDialog = function (scene) {
    var dialog = scene.rexUI.add.dialog({
        width: 300,
        background: scene.rexUI.add.roundRectangle(1, 1, 100, 100, 20, 0x1565c0),

        title: scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
            text: scene.add.text(0, 0, '', {
                fontSize: '50px'
            }),
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            }

        }),
        x: scene.cameras.main.width / 2,
        y: scene.cameras.main.height / 2,
        content: scene.add.text(0, 0, '', {
            fontSize: '50px'
        }),

        actions: [
            scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

                text: scene.add.text(0, 0, 'OK', {
                    fontSize: '50px'
                }),

                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            })
        ],

        space: {
            title: 0,
            content: 0,
            action: 15,

            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
        },

        align: {
            actions: 'center', // 'center'|'left'|'right'
        },

        expand: {
            content: false,  // Content is a pure text object
        }
    })
        .on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle();
        });

    return dialog;
}

var SetAlertDialog = function (dialog, title, content) {
    if (title === undefined) {
        title = '';
    }
    if (content === undefined) {
        content = '';
    }
    dialog.getElement('title').text = title;
    dialog.getElement('content').text = content;
    return dialog;
}

var AlertDialog;
var Alert = function (scene, title, content, x, y) {
    if (x === undefined) {
        x = 0;
    }
    if (y === undefined) {
        y = 650;
    }
    if (!AlertDialog) {
        AlertDialog = CreateAlertDialog(scene)
    }
    SetAlertDialog(AlertDialog, title, content);
    AlertDialog
        .setPosition(x, y).setOrigin(0.5, 1)
        .setVisible(true)
        .layout();

    return scene.rexUI.waitEvent(AlertDialog, 'button.click').then(function () {
        AlertDialog.setVisible(false);
        return Promise.resolve();
    })
}
