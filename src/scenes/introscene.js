var GetValue = Phaser.Utils.Objects.GetValue;


export default class IntroScene extends Phaser.Scene {
    constructor() {
      super("introScene")
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
          // this.emit('complete');
          this.scene.start('menuScene');
        }
      };

      text.forceNextPage = function() {
        var txt = this.page.getNextPage();
        this.typing.start(txt);
        console.log('getting next page!');
      };
      text.typing.on('complete', text.typeNextPage, text);
      return text;
    }

  create() {
    console.log("in intro scene")
    var content = `
    In the year 20XX, Earth has become inhospitable to the human race.
    Aliens from Planet Nowhere have descended to intervene. The Nowherians have two heads, each making different claims and promising different things.
                                        [color=black].[/color]
    They say there's a space elevator down Highway 51, and something about eforts to terraform the Earth. [b] They say we don't have much time.[/b]



                      [color=black].[/color]
    You burst into the living room where the kids are playing JortFite and you tell them it's time to go. Everybody gets in the car and you drive off towards the highway. You'll get your answers the only way you know how: [color=red] you will speak to their manager. [/color]`;

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
      this.text.once('complete', function () {
        console.log('done');
      }).start(content, 50);
    }

  update() {
    console.log(this.wasDown)
    if (this.game.input.activePointer.isDown) {
      if (!this.wasDown) {
        this.text.forceNextPage()
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