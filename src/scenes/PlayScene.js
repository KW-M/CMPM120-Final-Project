import Phaser from 'phaser'
// import ScoreOverlay from "/src/prefabs/scoreOverlay"
// import Obstacle from "/src/prefabs/obstacle"
import Car from "/src/prefabs/Car"
import CameraController from "/src/prefabs/CameraController"
import BackgroundLoader from "/src/prefabs/BackgroundLoader"
// import Wave from "/src/prefabs/Wave"
import CornerButton from "/src/prefabs/CornerButton"


export default class PlayScene extends Phaser.Scene {

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.script('rexdialogquest', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdialogquest.min.js');
        this.load.setCORS('anonymous')
        this.load.image('tile', "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/4/6/6");
    }

    constructor() {
        super({ key: "playScene" });
    }

    create() {
        this.gameOver = false;
        this.gameSize = this.game.scale.gameSize;
        this.matter.set30Hz();

        this.BackgroundLoader = new BackgroundLoader(this);
        this.BackgroundLoader.create();

        // setup variables

        // define keys
        window.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        window.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        window.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        window.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        window.keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        window.keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // An array to hold all the obstacle instances in play.
        this.obstacleGameObjects = []

        // this.add.sprite(0,0,"desert_bg").setOrigin(0,0).setScale(2,2)

        this.add.sprite(0, 0, "tile").setOrigin(0.5, 0.5).setScale(.1, .1)
        // place background tile sprite

        // add car (player)
        this.car = new Car(this, 0, 0);
        // this.CameraUpdater = new CameraController(this.cameras.main, this.car.x, this.car.y)
        this.cameras.main.startFollow(this.car);
        this.cameras.main.setDeadzone(40, 40);
        this.cameras.main.setLerp(0.8, 0.8)
        // high score is saved across games played
        this.hScore = localStorage.getItem("score") || 0;

        // Add the score overlay (Clock + Doom bar stuff)
        // this.scoreOverlay = new ScoreOverlay(this)

        // add fullscreen button
        this.fullscreenButton = new CornerButton(this, "top-right", 120, "⤢")
        this.fullscreenButton.on("pointerup", () => {
            this.scale.toggleFullscreen();
        })

        // handle when the screen size changes (device rotated, window resized, etc...)
        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            this.gameSize = gameSize;
            this.fullscreenButton.resize(gameSize)
            // this.scoreOverlay.resize(gameSize)
            // this.oceanBackground.height = this.gameSize.height
            // this.oceanBackground.width = this.gameSize.width;
        })

        var print = this.add.text(0, 0, '');

        var dialog = CreateDialog(this)
            .layout();
        dialog.clearChoices = function () {
            dialog.forEachChoice(function (choice) {
                choice.getElement('background').setStrokeStyle();
            });
            return dialog;
        }

        var quest = new rexdialogquest({
            dialog: dialog,
            questions: Questions,
            quest: {
                shuffleQuestions: true,
                shuffleOptions: true,
            },
        })
            .on('update-choice', function (choice, option, quest) {
                choice
                    .setText(option.key)
                    .setData('option', option);
            })
            .on('update-dialog', function (dialog, question, quest) {
                dialog.getElement('title').setText(question.key);
                quest
                    .setData('question', question)
                    .setData('option', undefined);
                dialog
                    .clearChoices()
                    .layout();

                print.text += `${question.key}:`;
            })
            .on('click-choice', function (choice, dialog, quest) {
                dialog.clearChoices();
                choice.getElement('background').setStrokeStyle(1, 0xffffff);
                quest.setData('option', choice.getData('option'));
            })
            .on('click-action', function (action, dialog, quest) {
                var question = quest.getData('question');
                var option = quest.getData('option');
                if (option === undefined) {
                    return;
                }
                var isCorrect = (question.answer === option.key);

                // Clear option reference
                quest
                    .setData('question', undefined)
                    .setData('option', undefined);
                dialog.forEachChoice(function (choice) {
                    choice.setData('option', undefined);
                });
                print.text += `${option.key} -> ${(isCorrect) ? 'O' : 'X'}\n`;

                if (!quest.isLast()) {
                    quest.next();
                } else {
                    print.text += 'Done\n';
                    quest.emit('complelte', quest);
                }
            })
            .start();


    }

    update() {

        // when game is over, don't do anything, just check for input.
        if (this.gameOver) {
            // check key input for restart
            if (Phaser.Input.Keyboard.JustDown(keyR) || this.input.activePointer.isDown) {
                this.registry.destroy();
                this.events.off();
                this.music.destroy();
                this.scene.restart();
                this.gameOver = false;
            }

            if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
                this.scene.start("menuScene");
                this.registry.destroy();
                this.events.off();
                this.music.destroy();
                this.scene.remove();
                this.gameOver = false;
            }
            return; // return here just ends the update function early.
        }

        // update wave and player sprites
        this.car.update();  // update car sprite
        if (this.game.getFrame() % 10 == 0) this.BackgroundLoader.update(this.cameras.main)
        // this.CameraUpdater.update(this.car.x, this.car.y, 0, 0)

    }

}
const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

var CreateDialog = function (scene) {
    return scene.rexUI.add.dialog({
        x: scene.cameras.main.width / 2,
        y: scene.cameras.main.height / 2,
        width: 250,

        background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, COLOR_PRIMARY),

        title: CreateTitle(scene, ' ', COLOR_DARK),

        content: scene.add.text(0, 0, ' ', {
            fontSize: '24px'
        }),

        choices: [
            CreateButton(scene, ' ', COLOR_LIGHT),
            CreateButton(scene, ' ', COLOR_LIGHT),
            CreateButton(scene, ' ', COLOR_LIGHT),
            CreateButton(scene, ' ', COLOR_LIGHT),
            CreateButton(scene, ' ', COLOR_LIGHT)
        ], // Support 5 choices

        actions: [
            CreateButton(scene, 'Next', COLOR_DARK),
        ],

        space: {
            title: 25,
            content: 25,
            choices: 20,
            choice: 15,
            action: 15,

            left: 25,
            right: 25,
            top: 25,
            bottom: 25,
        },

        expand: {
            content: false,  // Content is a pure text object
        }
    });
}

var CreateTitle = function (scene, text, backgroundColor) {
    return scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, backgroundColor),
        text: scene.add.text(0, 0, text, {
            fontSize: '24px'
        }),
        space: {
            left: 15,
            right: 15,
            top: 10,
            bottom: 10
        }
    });
};

var CreateButton = function (scene, text, backgroundColor) {
    return scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, backgroundColor),

        text: scene.add.text(0, 0, text, {
            fontSize: '24px'
        }),

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
}

const Questions = `type,key,answer
q,Q0,A0
,A0,
,A1,
,A2,
q,Q1,A0
,A0,
,A1,
,A2,
q,Q2,A0
,A0,
,A1,
,A2,`;
