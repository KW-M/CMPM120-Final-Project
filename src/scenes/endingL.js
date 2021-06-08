var GetValue = Phaser.Utils.Objects.GetValue;


export default class IntroScene extends Phaser.Scene {
    constructor() {
      super("IntroScene")
        this.wasDown = false
    }

    PageTypingText(scene, x, y, text, config) {
      var text = scene.add.rexBBCodeText(x, y, text, config);
      text.page = scene.plugins.get('rextextpageplugin').add(text, GetValue(config, 'page', undefined));
      text.typing = scene.plugins.get('rextexttypingplugin').add(text, GetValue(config, 'type', undefined));

      text.start = function (text, speed) {
        this.page.setText(text);
        if (speed !== undefined) {
          this.typing.setTypeSpeed(speed);
        }
        this.typeNextPage();
      };

      text.typeNextPage = function (speed) {
        if (!this.page.isLastPage) {
          text.forceNextPage()
        } else {
          console.log('done!');

          this.emit('complete');

        }
      };

      text.forceNextPage = function() {
        var txt = this.page.getNextPage();
        this.typing.start(txt);
        console.log('getting next page!');
      };
      text.typing.on('complete', () => { this.scene.start('MenuScene'); }, text);
      return text;
    }

    
  create() {
    console.log("in intro scene")
    var content = `
    Upon entering the space elevator, Karen and her children shot into the air. They watched as the Earth grew further and further away from the car window. The further they got from it, the more Karen realized the weight of her decision. 
                                        [color=black].[/color]
    As they grew further from Earth, they turned their attention to the tiatnic space station looming over it. Several domes containing small cities connected to each other via large structures and tubes. However, it was clear that the construct was not yet finished. 



                      [color=black].[/color]
    In this moments before the end,[color=red] Karen wondered what would become of those left behind. [/color]`;

    this.text = this.PageTypingText(this, this.cameras.main.width / 2 - 300, this.cameras.main.height / 2 - 300, '', {
        fontSize: '24px',
        wrap: {
          mode: 'word',
          width: 600
        },
      maxLines: 8,
      type: {
        speed: 0.9 * 1000, // found the speed setting
      }
      });
    this.text.once('complete', () => {
        console.log('done');
        this.scene.start('MenuScene');
      }).start(content, 50);
    }

  update() {
    // console.log(this.wasDown)
    if (this.game.input.activePointer.isDown) {
      if (!this.wasDown) {
        this.text.typeNextPage()
      }
    this.wasDown = true
    } else {
      this.wasDown = false
    }
  }

  preload() {
    var url;

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js';
    this.load.plugin('rexbbcodetextplugin', url, true);

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextextpageplugin.min.js';
    this.load.plugin('rextextpageplugin', url, true);

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexttypingplugin.min.js';
    this.load.plugin('rextexttypingplugin', url, true);
  }
}