import images_box from 'url:/assets/grey_box.png';
import images_checkbox from 'url:/assets/desert_bg.png';
import button02 from 'url:/assets/blue_button02.png'
import button03 from 'url:/assets/blue_button02.png'


export default class MenuScene extends Phaser.Scene {
  constructor () {
    super('menuScene');
  }

  preload() {
    this.load.image('box', images_box);
    this.load.image('checkedBox', images_checkbox);
    this.load.image('blueButton1', button02);
    this.load.image('blueButton2', button03);
    console.log("heree")
  }

  create () {
    this.gameButton = this.add.sprite(100, 200, 'blueButton1').setInteractive();
    this.centerButton(this.gameButton, 1);

    this.gameText = this.add.text(0, 0, 'Play', { fontSize: '32px', fill: '#fff' });
    this.centerButtonText(this.gameText, this.gameButton);

    this.gameButton.on('pointerdown', function (pointer) {
      this.scene.start('playScene');
      this.scene.start('playScene');
    }.bind(this));

    this.optionsButton = this.add.sprite(300, 200, 'blueButton1').setInteractive();
    this.centerButton(this.optionsButton);

    this.optionsText = this.add.text(0, 0, 'Options', { fontSize: '32px', fill: '#fff' });
    this.centerButtonText(this.optionsText, this.optionsButton);

    this.optionsButton.on('pointerdown', function (pointer) {
      this.scene.start('dialogscene');
      // this.scene.start('optionsScene');
    }.bind(this));

    this.controlsButton = this.add.sprite(300, 200, 'blueButton1').setInteractive();
    this.centerButton(this.controlsButton, -1);

    this.controlsText = this.add.text(0, 0, 'Controls', { fontSize: '32px', fill: '#fff' });
    this.centerButtonText(this.controlsText, this.controlsButton);

    this.controlsButton.on('pointerdown', function (pointer) {
      this.scene.start('introscene');
    }.bind(this));

    this.input.on('pointerover', function (event, gameObjects) {
      gameObjects[0].setTexture('blueButton2');
    });

    this.input.on('pointerout', function (event, gameObjects) {
      gameObjects[0].setTexture('blueButton1');
    });
  }

  centerButton (gameObject, offset = 0) {
    Phaser.Display.Align.In.Center(
      gameObject,
      this.add.zone(this.game.config.width / 2, this.game.config.height / 2 - offset * 100, this.game.config.width, this.game.config.height)
    );
  }

  centerButtonText (gameText, gameButton) {
    Phaser.Display.Align.In.Center(
      gameText,
      gameButton
    );
  }
};
