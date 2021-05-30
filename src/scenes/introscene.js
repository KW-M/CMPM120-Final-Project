var GetValue = Phaser.Utils.Objects.GetValue;


export default class Introscene extends Phaser.Scene {
    constructor() {
        super("Introscene")
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
        var txt = this.page.getNextPage();
        this.typing.start(txt);
      } else {
        this.emit('complete');
      }
    };

    text.typing.on('complete', text.typeNextPage, text);
    return text;
    }

  create() {
    console.log("in intro scene")
    var content = `[b][i][size=24][color=red]Phaser[/color] is a [color=yellow]fast[/color], [color=pink]free[/color], and [color=green]fun[/color] open source HTML5 game framework[/size][/b][/i] [size=18]that offers WebGL and Canvas rendering across desktop and mobile web browsers. Games can be compiled to iOS, Android and native apps by using 3rd party tools. You can use JavaScript or TypeScript for development.

    [color=red]Phaser[/color] is available in two versions: [color=yellow]Phaser 3[/color] and [color=blue]Phaser CE[/color] - The Community Edition. [color=blue]Phaser CE[/color] is a community-lead continuation of the [color=blue]Phaser 2[/color] codebase and is hosted on a separate repo. [color=yellow]Phaser 3[/color] is the next generation of [color=red]Phaser[/color].

    Along with the fantastic open source community, [color=red]Phaser[/color] is actively developed and maintained by Photon Storm. As a result of rapid support, and a developer friendly API, [color=red]Phaser[/color] is currently one of the most starred game frameworks on GitHub.

    Thousands of developers from indie and multi-national digital agencies, and universities worldwide use [color=red]Phaser[/color]. You can take a look at their incredible games.

    Visit: The [color=red]Phaser[/color] website and follow on Twitter (#phaserjs)
    Learn: API Docs, Support Forum and StackOverflow
    Code: 700+ Examples (source available in this repo)
    Read: Weekly [color=red]Phaser[/color] World Newsletter
    Chat: Slack and Discord
    Extend: With [color=red]Phaser[/color] Plugins
    Be awesome: Support the future of [color=red]Phaser[/color]

    Grab the source and join the fun!`;

    var text = this.PageTypingText(this, 100, 100, '', {
        fontSize: '24px',
        wrap: {
          mode: 'word',
          width: 600
        },
        maxLines: 7
      });
      text.once('complete', function () {
        console.log('done');
      }).start(content, 50);
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
        var txt = this.page.getNextPage();
        this.typing.start(txt);
      } else {
        this.emit('complete');
      }
    }
    text.typing.on('complete', text.typeNextPage, text);
    return text;
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