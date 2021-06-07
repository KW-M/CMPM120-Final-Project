export default class DialogScene extends Phaser.Scene {
    constructor() {
        super("DialogScene")

        // dialog constants
        this.DBOX_X = 0;			    // dialog box x-position
        this.DBOX_Y = 240;			    // dialog box y-position
        this.DBOX_FONT = 'gem_font';	// dialog box font key

        this.TEXT_X = -600;			// text w/in dialog box x-position
        this.TEXT_Y = 296;			// text w/in dialog box y-position
        this.TEXT_SIZE = 48;		// text font size (in pixels)
        this.TEXT_MAX_WIDTH = 1200;	// max width of text within box

        this.NEXT_TEXT = '[CLICK or SPACE]';	// text to display for next prompt
        this.NEXT_X = 640;			// next text prompt x-position
        this.NEXT_Y = 610;			// next text prompt y-position

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen

        // dialog variables
        this.dialogConvo = 0;			// current "conversation"
        this.dialogLine = 0;			// current line of conversation
        this.dialogSpeaker = null;		// current speaker
        this.dialogLastSpeaker = null;	// last speaker
        this.dialogTyping = false;		// flag to lock player input while text is "typing"
        this.dialogText = null;			// the actual dialog text
        this.nextText = null;			// player prompt text to continue typing

        // character variables
        this.tweenDuration = 200;
    }


    create() {
        this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        // parse dialog from JSON file
        this.allDialogs = this.cache.json.get('dialog');

        // add background image
        let backgroundImage = this.add.image(0, 0, 'dialog_background');
        backgroundImage.setOrigin(0.5, 0.5)
        backgroundImage.setScale(3, 3.2)

        // add dialog box sprite
        this.dialogbox = this.add.sprite(this.DBOX_X, this.DBOX_Y, 'dialog_box').setScale(15).setOrigin(0.5, 0);

        // initialize dialog text objects (with no text)
        this.dialogText = this.add.bitmapText(this.TEXT_X, this.TEXT_Y, this.DBOX_FONT, '', this.TEXT_SIZE);
        this.nextText = this.add.bitmapText(this.NEXT_X, this.NEXT_Y, this.DBOX_FONT, '', this.TEXT_SIZE);

        // ready the speechbuble images in a hidden state
        this.janus_left = this.add.sprite(-360, -280, 'speech_bubble_right').setScale(6.5).setOrigin(0, 1).setAlpha(0);
        this.janus_right = this.add.sprite(150, -280, 'speech_bubble_left').setScale(6.5).setOrigin(0, 1).setAlpha(0);
        this.karen = this.add.sprite(-480, -80, 'speech_bubble_left').setScale(8).setOrigin(0, 1).setAlpha(0);

        // this.input.keyboard.on('keydown-SPACE', () => {  });

        // handle when the screen size changes (device rotated, window resized, etc...)
        let resizeHandler = (gameSize, baseSize, displaySize, resolution) => {
            if (this.cameras.main === undefined) return;
            this.cameras.resize(gameSize.width, gameSize.height);
            this.cameras.main.centerToSize().setZoom(Math.min(gameSize.width / (backgroundImage.width * backgroundImage.scaleX), gameSize.height / (backgroundImage.height * backgroundImage.scaleY)))
            this.cameras.main.centerOn(0, 0)
        }; resizeHandler(this.game.scale.gameSize)
        this.scale.on('resize', resizeHandler)

        this.events.on(Phaser.Scenes.Events.WAKE, () => {
            this.wake();
        }, this);
        this.wake();
    }

    wake() {
        let script_name_to_play = this.sys.getData().scriptName;
        this.dialog = this.allDialogs[script_name_to_play] || [[{ "speaker": "karen", "dialog": "Uh Ohhhhhhhhh. There is no script called:" + script_name_to_play, "newSpeaker": "true" }]]

        //clear all speachbubbles
        this.janus_left.setAlpha(0);
        this.janus_right.setAlpha(0);
        this.karen.setAlpha(0);

        this.wasDown = this.game.input.activePointer.isDown;

        // start dialog
        this.typeText();
    }

    update() {
        // check for spacebar press
        if (this.game.input.activePointer.isDown) {
            if (!this.wasDown && !this.dialogTyping) {
                // trigger next page of dialog
                this.typeText();
            }
            this.wasDown = true
        } else {
            this.wasDown = false
        }
        if (Phaser.Input.Keyboard.JustDown(this.keySPACE) && !this.dialogTyping) {
            // trigger next page of dialog
            this.typeText();
        }
    }

    typeText() {
        // lock input while typing
        this.dialogTyping = true;

        // clear text
        this.dialogText.text = '';
        this.nextText.text = '';

        /* Note: In my conversation data structure:
                - each array within the main JSON array is a "conversation"
                - each object within a "conversation" is a "line"
                - each "line" can have 3 properties:
                    1. a speaker (required)
                    2. the dialog text (required)
                    3. an (optional) flag indicating if this speaker is new -- disabled for now.
        */

        // make sure there are lines left to read in this convo, otherwise jump to next convo
        if (this.dialogLine > this.dialog[this.dialogConvo].length - 1) {
            this.dialogLine = 0;
            // I increment conversations here, but you could create logic to exit the dialog here
            this.dialogConvo++;
        }

        // make sure we haven't run out of conversations...
        if (this.dialogConvo >= this.dialog.length) {
            // here I'm simply "exiting" the last speaker and removing the dialog box,
            // but you could build other logic to change game states here

            /* --- end of conversation ---  */

            // reset text counters
            this.dialogConvo = 0;
            this.dialogLine = 0;
            // go back to play scene (and stop this scene)
            this.fadeSceneTransition("PlayScene")
        } else {
            // if not, set current speaker
            this.dialogSpeaker = this.dialog[this.dialogConvo][this.dialogLine]['speaker'];
            // check if there's a new speaker (for exit/enter animations)
            // if (this.dialog[this.dialogConvo][this.dialogLine]['newSpeaker']) {
            // tween out prior speaker's image
            if (this.dialogLastSpeaker != this.dialogSpeaker) {
                if (this.dialogLastSpeaker) {
                    this.tweens.add({
                        targets: this[this.dialogLastSpeaker],
                        alpha: 0,
                        duration: this.tweenDuration,
                        ease: 'Linear'
                    });
                }
                // tween in new speaker's image
                this.tweens.add({
                    targets: this[this.dialogSpeaker],
                    alpha: 1,
                    duration: this.tweenDuration,
                    ease: 'Linear'
                });
            }

            // build dialog (concatenate speaker + line of text)
            this.dialogLines = this.dialog[this.dialogConvo][this.dialogLine]['speaker'].toUpperCase() + ': ' + this.dialog[this.dialogConvo][this.dialogLine]['dialog'];

            // create a timer to iterate through each letter in the dialog text
            let currentChar = 0;
            this.textTimer = this.time.addEvent({
                delay: this.LETTER_TIMER,
                repeat: this.dialogLines.length - 1,
                callback: () => {
                    // concatenate next letter from dialogLines
                    this.dialogText.text += this.dialogLines[currentChar];
                    // advance character position
                    currentChar++;
                    // check if timer has exhausted its repeats
                    // (necessary since Phaser 3 no longer seems to have an onComplete event)
                    if (this.textTimer.getRepeatCount() == 0) {
                        // show prompt for more text
                        this.nextText = this.add.bitmapText(this.NEXT_X, this.NEXT_Y, this.DBOX_FONT, this.NEXT_TEXT, this.TEXT_SIZE).setOrigin(1);
                        // un-lock input
                        this.dialogTyping = false;
                        // destroy timer
                        this.textTimer.destroy();
                    }
                },
                callbackScope: this // keep Scene context
            });

            // set bounds on dialog
            this.dialogText.maxWidth = this.TEXT_MAX_WIDTH;

            // increment dialog line
            this.dialogLine++;

            // set past speaker
            this.dialogLastSpeaker = this.dialogSpeaker;
        }
    }

    fadeSceneTransition(targetSceneName) {
        this.transitionInProgress = true;
        this.scene.transition({ target: targetSceneName, duration: 2000, sleep: false, moveBelow: true }); //important that this is sleep false remove true.
        let targetScene = this.scene.manager.scenes[this.scene.getIndex(targetSceneName)]
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        targetScene.cameras.main.fadeOut(0, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            targetScene.cameras.main.fadeIn(1000, 0, 0, 0);
            this.scene.manager.bringToTop(targetSceneName);
            targetScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (cam, effect) => {
                this.transitionInProgress = false;
            })
        })
    }
}