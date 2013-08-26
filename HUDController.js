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
    }
};
