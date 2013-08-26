function PowerUpController() {
    this.power = '';
}

PowerUpController.prototype = {
    constructor: PowerUpController,

    onDidLoadFromCCB: function() {
        this.rootNode.schedule(this._removeSelf.bind(this), 5);
    },

    setGameController: function(controller) {
        this._controller = controller;
    },

    _removeSelf: function() {
        this._controller.removePowerUp(self.rootNode);
    }
};
