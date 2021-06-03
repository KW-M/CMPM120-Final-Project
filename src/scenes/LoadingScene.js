import Phaser from 'phaser'


// import images_menu_bg from 'url:/assets/menu.png';
// import images_key_bg from 'url:/assets/Key_BG.png';
import move_mouse_img from 'url:/assets/UI/cursor_graphicks1.png'
// import click_mouse_img from 'url:/assets/cursor_graphicks2.png'

import images_highway_tile from 'url:/assets/high_way_grunge1.png'
import images_highway_intersection_tile from 'url:/assets/high_way_intersection.png'
import images_tile_loading_icon from 'url:/assets/tile_loading_icon.png'
import images_car from 'url:/assets/car.png';
import image_dialogue from 'url:/assets/dialogue background.png';
//import image_dialoguebox from 'url:/assets/Dialogue box.png';
import image_dust_particle from 'url:/assets/dust_particle.png'

import images_left_crack_1 from 'url:/assets/left_crack_1.png';
import images_right_crack_1 from 'url:/assets/right_crack_1.png';
import images_crack_1 from 'url:/assets/crack1.png';
import images_crack_2 from 'url:/assets/crack2.png';
import images_crack_3 from 'url:/assets/crack3.png';
import images_crack_4 from 'url:/assets/crack4.png';
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
      var loading_bar_background = this.add.rectangle(0, 0, 400, 30, 0x666666).setOrigin(0.5, 0.5);
      var loading_bar = this.add.rectangle(loading_bar_background.x, loading_bar_background.y, loading_bar_background.width, loading_bar_background.height, 0xffffff).setScale(0, 1).setOrigin(0.5, 0.5);

      // this.load.image('key_bg', images_key_bg);
      // this.load.image('menu_bg', images_menu_bg);
      this.load.image('move_mouse_tutorial', move_mouse_img)
      // this.load.image('click_mouse_tutorial', click_mouse_img)

      this.load.image('highway_intersection_tile', images_highway_intersection_tile);
      this.load.image('highway_tile', images_highway_tile)
      this.load.image('car', images_car);
      this.load.image('tile_loading_icon', images_tile_loading_icon);
      this.load.image('dialogue background', image_dialogue);
      //this.load.image('Dialogue box', image_dialoguebox);
      this.load.image('dust_particle', image_dust_particle);

      this.load.image('left_crack_1', images_left_crack_1)
      this.load.image('right_crack_1', images_right_crack_1)
      this.load.image('crack_1', images_crack_1)
      this.load.image('crack_2', images_crack_2)
      this.load.image('crack_3', images_crack_3)
      this.load.image('crack_4', images_crack_4)

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

      // handle when the screen size changes (device rotated, window resized, etc...)
      this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
        this.cameras.main.width = gameSize.width
        this.cameras.main.height = gameSize.height
        this.cameras.main.centerOn(0, 0)
      }); this.cameras.main.centerOn(0, 0)
    }

    update() {
      this.events.off();
      this.scale.off('resize')
      this.scene.start('menuScene');
      // this.scene.start('playScene');

      console.log("removing loading scene")
      this.scene.remove();
    }
  }