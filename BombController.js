function BombController() {
    this.counter = 10;
}

BombController.prototype = {
    constructor: BombController,

    setNPCs: function(npcs) {
        this._npcs = npcs;
    },

    tick: function() {
        this.counter--;
        this.counterLabel.setString('' + this.counter);
        if (this.isExploded()) {
            this._explode();
        }
    },

    isExploded: function() {
        return this.counter <= 0;
    },

    setGameController: function(controller) {
        this._gameCtrl = controller;
    },


    setContainer: function(container) {
        this._container = container;
    },

    isInContainer: function() {
        return !!this._container;
    },

    getContainer: function() {
        return this._container;
    },

    _explode: function () {
        cc.AudioEngine.getInstance().playEffect('bomb');
        if (this._container) {
            this._container.explode();
            return;
        }
        var explosion = cc.BuilderReader.load('Explosion.ccbi');
        explosion.setPosition(this.rootNode.getPosition());
        this._gameCtrl.level.addChild(explosion);
        this._killNPCS();
        this.rootNode.removeFromParent(true);

    },

    _killNPCS: function() {
        this._gameCtrl._npcs.forEach(function(npc) {
            if (this._inRadius(npc)) {
                npc.controller.kill();
            }
        }, this);

        if (this._inRadius(this._gameCtrl.hero)) {
            this._gameCtrl.hitHero();
        }
    },

    _inRadius: function(node) {
        var nodePos = node.getPosition(),
            selfPos = this.rootNode.getPosition(),
            dx = nodePos.x - selfPos.x,
            dy = nodePos.y - selfPos.y,
            distanceSqr = dx * dx + dy * dy;
        return distanceSqr <= 100 * 100;
    }
};
