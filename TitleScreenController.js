function TitleScreenController () {}

TitleScreenController.prototype = {
    constructor: TitleScreenController,

    onDidLoadFromCCB: function() {
        cc.AudioEngine.getInstance().playMusic('theme', true);
    },

    playGame: function() {
        var scene = cc.BuilderReader.loadAsScene('GameplayScene.ccbi');
        cc.Director.getInstance().replaceScene(scene);
    }
};



