function ContainerController() {
}

ContainerController.prototype = {
    constructor: ContainerController,

    putBombIn: function(bomb) {
        this._hasBomb = true;
        bomb.controller.setContainer(this);
    },

    hasBomb: function() {
        return this._hasBomb;
    },

    explode: function() {
        this.rootNode.removeFromParent(true);
    }
};

Object.defineProperty(ContainerController.prototype, 'isContainer', {
    writable: false,
    configurable: false,
    enumerable: true,
    value: true
});
