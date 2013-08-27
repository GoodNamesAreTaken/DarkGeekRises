function GameOverSceneController() {
}

GameOverSceneController.prototype = {
    constructor: GameOverSceneController,

    setTotalPlayedTime: function(time) {
        time = Math.floor(time / 1000);
        var minutes = Math.floor(time / 60),
            seconds = time % 60;
        this.totalPlayedLabel.setString('Total Convention Time: ' + minutes + ' minutes ' + seconds + ' seconds');
    },


    playGame: function() {
        var scene = cc.BuilderReader.loadAsScene('GameplayScene.ccbi');
        cc.Director.getInstance().replaceScene(scene);
    }
};
