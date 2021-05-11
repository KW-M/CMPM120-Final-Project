class controls extends Phaser.Scene {
  constructor () {
    super('controls');
  }

  create () {
    //when we have the controls we can change the text below 
    this.controlsText = this.add.text(0, 0, 'Controls', { fontSize: '32px', fill: '#fff' });
    this.zone = this.add.zone(config.width/2, config.height/2, config.width, config.height);

    Phaser.Display.Align.In.Center(
      this.controlsText,
      this.zone
    );
  }
};
