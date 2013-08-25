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

    setLayer: function(layer) {
        this._layer = layer;
    },

    getLayer: function() {
        return this._layer;
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
        if (this._container) {
            this._container.explode();
            return;
        }
        var explosion = cc.BuilderReader.load('explosion.ccbi');
        explosion.setPosition(this.rootNode.getPosition());
        this._layer.addChild(explosion);
        this._killNPCS();
        this.rootNode.removeFromParent(true);

    },

    _killNPCS: function() {
        this._npcs.forEach(function(npc) {
            if (this._inRadius(npc)) {
                npc.controller.kill();
            }
        }, this);
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
