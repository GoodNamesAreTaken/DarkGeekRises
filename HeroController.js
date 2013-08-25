function HeroController() {
    
}

HeroController.SPEED = 300;

HeroController.prototype = {
    constructor: HeroController,

    moveLeft: function (dt) {
        var pos = this.rootNode.getPosition(),
            halfWidth = this.rootNode.getContentSize().width;
        pos.x -= HeroController.SPEED * dt;
        if (pos.x - halfWidth < 150) {
            pos.x = 150 + halfWidth;
        }
        this.rootNode.setPosition(pos);

        if (this._bomb) {
            this._bomb.setPosition(pos);
        }

    },

    moveRight: function (dt) {
        var pos = this.rootNode.getPosition(),
            halfWidth = this.rootNode.getContentSize().width;
        pos.x += HeroController.SPEED * dt;

        if (pos.x + halfWidth > 2100 - 150) {
            pos.x = 2100 - 150 - halfWidth;
        }

        this.rootNode.setPosition(pos);
        if (this._bomb) {
            this._bomb.setPosition(pos);
        }
    },

    updateAction: function(action) {
        this.actionLabel.setString(action);
    },

    pickBomb: function(bomb) {
        this._bomb = bomb;
        bomb.removeFromParent(false);
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
        return bomb;
    },

    removeBombIfCarrying: function (bomb) {
        if (this.isCarryingBomb(bomb)) {
            this._bomb = null;
        }
    }
};
