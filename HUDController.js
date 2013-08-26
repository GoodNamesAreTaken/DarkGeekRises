function HUDController() {
}

HUDController.prototype = {
    constructor: HUDController,

    setPowerUpIcon: function(icon) {
        var texture = cc.TextureCache.getInstance().addImage(icon);
        this.powerIcon.setTexture(texture);
    },

    clearPowerUp: function() {
        this.setPowerUpIcon('empty_powerup.png');
    },

    setLives: function(lives) {
        for (var i=1; i<=3; i++) {
            this['health' + i].setVisible(i<=lives);
        }
    }
};
