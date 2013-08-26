function HeroController() {
   this._isRunning = false; 
}

HeroController.SPEED = 300;

HeroController.prototype = {
    constructor: HeroController,

    moveLeft: function (dt) {
        this._playWalkAnimation();
        this.sprite.setFlipX(true);
        var pos = this.rootNode.getPosition(),
            halfWidth = this.rootNode.getContentSize().width / 2;
        pos.x -= HeroController.SPEED * dt;
        if (pos.x - halfWidth <= 60) {
            pos.x = 60 + halfWidth;
        }
        this.rootNode.setPosition(pos);

        if (this._bomb) {
            this._bomb.setPosition(pos);
        }

    },

    moveRight: function (dt) {
        this._playWalkAnimation();
        this.sprite.setFlipX(false);
        var pos = this.rootNode.getPosition(),
            halfWidth = this.rootNode.getContentSize().width / 2;
        pos.x += HeroController.SPEED * dt;

        if (pos.x + halfWidth > 840) {
            pos.x = 840 - halfWidth;
        }

        this.rootNode.setPosition(pos);
        if (this._bomb) {
            this._bomb.setPosition(pos);
        }
    },

    stop: function() {
        if (!this._isRunning) {
            return;
        }

        this.rootNode.animationManager.runAnimationsForSequenceNamed('stand');

        this._isRunning = false;
    },

    _playWalkAnimation: function() {
        if (this._isRunning) {
            return;
        }

        var animation = this.isCarryingBomb() ? 'run_bomb' : 'run';

        this.rootNode.animationManager.runAnimationsForSequenceNamed(animation);

        this._isRunning = true;
    },

    updateAction: function(action) {
        this.actionLabel.setString(action);
        if (!action || action.length === 0) {
            this.actionLabel.setVisible(false);
        } else {
            this.actionLabel.setVisible(true);
        }
    },

    pickBomb: function(bomb) {
        this._bomb = bomb;
        this.timerLabel.setVisible(true);
        this.timerLabel.setString(bomb.controller.counter);
        bomb.removeFromParent(false);
    },

    onBombTick: function() {
        if (this.isCarryingBomb()) {
            this.timerLabel.setString(this._bomb.controller.counter);
        }
    },

    isCarryingBomb: function(bomb) {
        if (bomb) {
            return this._bomb === bomb;
        }
        return !!this._bomb;
    },

    dropBomb: function () {
        var bomb = this._bomb;
        this._bomb = null;
        this._isRunning = false;
        this.timerLabel.setVisible(false);
        return bomb;
    },

    removeBombIfCarrying: function (bomb) {
        if (this.isCarryingBomb(bomb)) {
            this._bomb = null;
            this._isRunning = false;
            this.timerLabel.setVisible(false);
        }
    },

    animateHit: function() {
        this.rootNode.runAction(cc.Blink.create(1, 4));
        //this.rootNode.animationManager.runAnimationsForSequenceNamed('flicker');
    }

};
