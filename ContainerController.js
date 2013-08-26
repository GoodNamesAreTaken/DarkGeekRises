function ContainerController() {
}

ContainerController.prototype = {
    constructor: ContainerController,

    putBombIn: function(bomb) {
        this._hasBomb = true;
        bomb.controller.setContainer(this);
    },

    setGameController: function(controller) {
        this._gameCtrl = controller;
    },

    hasBomb: function() {
        return this._hasBomb;
    },

    removeBomb: function() {
        this._hasBomb = false;
    },

    explode: function() {
        this._gameCtrl.removeContainer(this.rootNode);
    }
};

Object.defineProperty(ContainerController.prototype, 'isContainer', {
    writable: false,
    configurable: false,
    enumerable: true,
    value: true
});
