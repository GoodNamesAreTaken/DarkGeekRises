function ExplosionController() {
}

ExplosionController.prototype = {
    constructor: ExplosionController,

    onDidLoadFromCCB: function() {
        this.rootNode.setAutoRemoveOnFinish(true);
    }
};
