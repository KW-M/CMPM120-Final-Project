import Phaser from 'phaser'


// import images_menu_bg from 'url:/assets/menu.png';
// import images_key_bg from 'url:/assets/Key_BG.png';
import move_mouse_img from 'url:/assets/UI/cursor_graphicks1.png'
import game_title_img from 'url:/assets/game_title.png'


import images_highway_tile from 'url:/assets/high_way_grunge1.png'
import images_highway_t_intersection_tile from 'url:/assets/high_way_intersection.png'
import images_highway_y_intersection_tile from 'url:/assets/high_way_3_way.png'
import images_highway_house_intersection from 'url:/assets/high_way_house_intersection.png'
import images_space_elevator from 'url:/assets/space_elevator.gif'

import images_tile_loading_icon from 'url:/assets/tile_loading_icon.png'
import images_car from 'url:/assets/car.png';
import image_dust_particle from 'url:/assets/dust_particle.png'

import image_dialogue from 'url:/assets/dialogue background.png';
import image_dialoguebox from 'url:/assets/Dialogue box.png';
import image_speech_bubble_left from 'url:/assets/Speech_Bubble_Left.png';
import image_speech_bubble_right from 'url:/assets/Speech_Bubble_Right.png';

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

import audioAccelerateOgg from 'url:/assets/audio/accelerate.ogg';
import audioAccelerateWav from 'url:/assets/audio/accelerate.wav';
// import audioBrake from 'url:/assets/audio/brake.wav';
// import audioReverse from 'url:/assets/audio/reverse.wav';
// import audioHonk from 'url:/assets/audio/honk.wav';
import audioCrash from 'url:/assets/audio/collision.wav';

import xml_bitmap_font from 'url:/assets/font/gem.xml'
import bitmap_font_image from 'url:/assets/font/gem.png'
import json_dialog_script from 'url:/assets/json/dialog.json'

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    // draw the loading bar
    var loading_bar_background = this.add.rectangle(0, 0, 400, 30, 0x666666).setOrigin(0.5, 0.5);
    var loading_bar = this.add.rectangle(loading_bar_background.x, loading_bar_background.y, loading_bar_background.width, loading_bar_background.height, 0xffffff).setScale(0, 1).setOrigin(0.5, 0.5);

    // load the images
    this.load.image('game_title', game_title_img)
    this.load.image('move_mouse_tutorial', move_mouse_img)

    this.load.image('highway_house_intersection', images_highway_house_intersection)
    this.load.image('highway_t_intersection', images_highway_t_intersection_tile);
    this.load.image('highway_y_intersection', images_highway_y_intersection_tile)
    this.load.image('highway_tile', images_highway_tile)
    this.load.image('tile_loading_icon', images_tile_loading_icon);
    this.load.image('space_elevator', images_space_elevator)

    this.load.image('car', images_car);
    this.load.image('dust_particle', image_dust_particle);

    this.load.image('speech_bubble_left', image_speech_bubble_left)
    this.load.image('speech_bubble_right', image_speech_bubble_right)
    this.load.image('dialog_background', image_dialogue);
    this.load.image('dialog_box', image_dialoguebox);

    this.load.image('left_crack_1', images_left_crack_1)
    this.load.image('right_crack_1', images_right_crack_1)
    this.load.image('crack_1', images_crack_1)
    this.load.image('crack_2', images_crack_2)
    this.load.image('crack_3', images_crack_3)
    this.load.image('crack_4', images_crack_4)

    // load spritesheets
    this.load.audio('accelSound', [audioAccelerateOgg, audioAccelerateWav]);
    this.load.audio('crashSound', audioCrash);

    // this.load.audio('soundtrack', sounds_soundtrack);

    // load bitmap font
    this.load.bitmapFont('gem_font', bitmap_font_image, xml_bitmap_font);

    // load JSON (dialog)
    this.load.json('dialog', json_dialog_script);

    // move the progress bar as things load:
    this.load.on('progress', function (progress) {
      loading_bar.setScale(progress, 1);
    });

    // handle when the screen size changes (device rotated, window resized, etc...)
    this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
      if (this.cameras.main === undefined) return;
      this.cameras.resize(gameSize.width, gameSize.height);
      this.cameras.main.centerOn(0, 0)
    }); this.cameras.main.centerOn(0, 0)
  }

  update() {
    this.events.off();
    this.scene.start('IntroScene');
    // this.scene.start('PlayScene');
    this.scene.stop(this.scene.key)
    this.scene.remove(this.scene.key);
  }
}