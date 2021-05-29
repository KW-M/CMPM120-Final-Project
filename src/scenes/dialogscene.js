export default class Dialogscene extends Phaser.Scene {
    constructor() {
        super("dialogscene")
    }

    preload() { 
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });      
    }

    create() {

        //Background
        // var image = scene.add.image(x, y, key, frame);
        var image_dialogue = this.add.image(1, 1, 'dialogue background');
        image_dialogue.setOrigin (0,0)
        image_dialogue.setScale (3,3.2) 
        
        var image_dialoguebox = this.add.image(1, 1, 'Dialogue box');
        image_dialoguebox.setposition
        image_dialoguebox.setOrigin (0,0)
        image_dialoguebox.setScale (1.5,1.5)


        //rectangle
        //this.add.rectangle(1, 1, 1000, 1000, 0x000000)
        
        

        var scene = this;
        Alert(scene, '11', 'Alien: Hello')
            .then(function () {
                return Alert(scene, '22', 'Hello again');
            })
            .then(function () {
                return Alert(scene, '33', 'OKKKKK');
            })
            .then(function () {
                return Alert(scene, '44', 'Goodbye');    
                
            })
    }

    update() { }
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
            title: 25,
            content: 25,
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
        x = 750;
    }
    if (y === undefined) {
        y = 400;
    }
    if (!AlertDialog) {
        AlertDialog = CreateAlertDialog(scene)
    }
    SetAlertDialog(AlertDialog, title, content);
    AlertDialog
        .setPosition(x, y)
        .setVisible(true)
        .layout();

    return AlertDialog
        .moveFromPromise(1000, undefined, '-=800', 'Bounce')
        .then(function () {
            return scene.rexUI.waitEvent(AlertDialog, 'button.click');
        })
        .then(function () {
            return AlertDialog.moveToPromise(1000, undefined, '-=600', 'Back');
        })
        .then(function () {
            AlertDialog.setVisible(false);
            return Promise.resolve();
        })
}
