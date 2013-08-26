function PowerUpController() {
}

PowerUpController.prototype = {
    constructor: PowerUpController,

    onDidLoadFromCCB: function() {
        this.rootNode.schedule(this._removeSelf.bind(this), 5);
    },

    setGameController: function(controller) {
        this._controller = controller;
    },

    setPower: function(power) {
        this.power = power;
        var texture = cc.TextureCache.getInstance().addImage(power.icon);
        this.sprite.setTexture(texture);
    },

    _removeSelf: function() {
        this._controller.removePowerUp(self.rootNode);
    }
};
