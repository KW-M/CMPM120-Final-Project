import Phaser from 'phaser'


// import images_menu_bg from 'url:/assets/menu.png';
// import images_key_bg from 'url:/assets/Key_BG.png';
// import move_mouse_img from 'url:/assets/cursor_graphicks1.png'
// import click_mouse_img from 'url:/assets/cursor_graphicks2.png'



import images_car from 'url:/assets/car.png';
import images_desert_bg from 'url:/assets/desert_bg.png';
import image_dialogue from 'url:/assets/dialogue background.png';
import image_dialoguebox from 'url:/assets/Dialogue box.png';

// import images_coconut_crash from 'url:/assets/coconut_crash.png';
// import images_wood_crash from 'url:/assets/wood_crash.png';
// import images_boat from 'url:/assets/boat_anim.png';
// import images_wave from 'url:/assets/wave_foreground.png';
// import images_wave_bg from 'url:/assets/wave_bg.png';
// import images_surfer from 'url:/assets/surfer_sm.png'
// import images_ocean_tile from 'url:/assets/ocean_tile.png';

import audioAccelerate from 'url:/assets/audio/accelerate.wav';
// import audioBrake from 'url:/assets/audio/brake.wav';
// import audioReverse from 'url:/assets/audio/reverse.wav';
// import audioHonk from 'url:/assets/audio/honk.wav';
import audioCrash from 'url:/assets/audio/collision.wav';

export default class LoadingScene extends Phaser.Scene {
    constructor() {
      super({ key: 'loadingScene' });
    }

    preload() {
      // draw the loading bar
      var loading_bar_background = this.add.rectangle(this.game.config.width / 2, this.game.config.height / 2, 400, 30, 0x666666).setOrigin(0.5, 0.5);
      var loading_bar = this.add.rectangle(loading_bar_background.x, loading_bar_background.y, loading_bar_background.width, loading_bar_background.height, 0xffffff).setScale(0, 1).setOrigin(0.5, 0.5);

      // this.load.image('key_bg', images_key_bg);
      // this.load.image('menu_bg', images_menu_bg);
      // this.load.image('move_mouse_tutorial', move_mouse_img)
      // this.load.image('click_mouse_tutorial', click_mouse_img)

      this.load.image('car', images_car);
      this.load.image('desert_bg', images_desert_bg);
      this.load.image('dialogue background', image_dialogue);
      this.load.image('Dialogue box', image_dialoguebox);
 

      // load spritesheets
      this.load.audio('accelSound', audioAccelerate);
      // this.load.audio('brakeSound', audioBrake);
      // this.load.audio('reverseSound', audioReverse);
      // this.load.audio('honkSound', audioHonk);
      // this.load.audio('crashSound', audioCrash);

      // this.load.audio('soundtrack', sounds_soundtrack);

      this.load.on('progress', function (progress) {
        loading_bar.setScale(progress, 1);
      });
    }

    update() {
      this.scene.start('menuScene');
      // this.scene.start('playScene');
      this.scene.remove();
    }
  }