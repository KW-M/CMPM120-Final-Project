/*
Tsurfnami
A game by Asher Lachoff, Yukai Liu, Kelly Leung & Kyle Worcester-Moore
May 2nd, 2021
Multiple input methods + tilt on mobile.
Realistic shark symulation(TM).
Layered audio gives an imersive experience.
*/


import Phaser from 'phaser';
import LoadingScene from "/src/scenes/loadingScene"
import MenuScene from "/src/scenes/MenuScene"
import PlayScene from "/src/scenes/PlayScene"
import ControlsScene from "/src/scenes/controlsScene"
import OptionsScene from "/src/scenes/optionsScene"
import dialogscene from "/src/scenes/dialogscene"
import Introscene from "/src/scenes/introscene"

// reserve vars
let game, keySPACE, keyR, keyLEFT, keyRIGHT, keyUP, keyDOWN;

const targetFPS = 20;

let gameConfig = {
  type: Phaser.AUTO,
  autoRound: true,
  fps: {
    target: targetFPS,
    forceSetTimeOut: true,
  },
  scale: {
    // zoom: 2,
    mode: Phaser.Scale.RESIZE,// Phaser.Scale.NONE, // we scale the game manually in resize()
    // width: window.innerWidth,
    // height: window.innerHeight
  },
  pixelArt: true,
  physics: {
    default: 'matter',
    matter: {
      enableSleeping: true,
      gravity: { y: 0 },
      // debug: {
      //   // showBody: true,
      //   // showStaticBody: true
      // }
    }
  },
  scene: [LoadingScene, MenuScene, Introscene, ControlsScene, OptionsScene, PlayScene, dialogscene]// EndScene
}

function newGame() {
  if (game) return;
  game = new Phaser.Game(gameConfig);
  console.log(game)
  Phaser.Display.Canvas.CanvasInterpolation.setCrisp(game.canvas);
}

// When the window has loaded fully, make the phaser game:
window.onload = () => {
  if (!game) newGame();
}

// This is for Parcel shenannagans that make reloading the website faster durring development.
function destroyGame() {
  if (!game) return;
  game.destroy(true);
  game.runDestroy();
  game = null;
}
if (module.hot) {
  module.hot.dispose(destroyGame);
  module.hot.accept(newGame);
}

