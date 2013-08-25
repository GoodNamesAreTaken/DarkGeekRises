function NPCController() {
    this._direction = Math.floor(Math.random() * 2) || -1;
    this._toWaitBeforeNextDoor = 0;
}

NPCController.minWalk = 100;
NPCController.maxWalk = 1500;
NPCController.walkSpeed = 100;

NPCController._walkRange = NPCController.maxWalk - NPCController.minWalk;

NPCController.prototype = {
    constructor: NPCController,

    onDidLoadFromCCB: function () {
        this.rootNode.scheduleUpdate();
        this.rootNode.update = this.update.bind(this);
        this._startWalking();
    },

    update: function(dt) {
        if (this._inDoor) {
            return;
        }
        this._toWaitBeforeNextDoor -= dt;
        var dist = NPCController.walkSpeed * dt,
            position = this.rootNode.getPosition();
        position.x += dist * this._direction;
        this.rootNode.setPosition(position);
        this._toWalkLeft -= dist; 

        if (this._toWalkLeft <= 0 || this._isOutOfBounds()) {
            this._changeDirection();
        }
    },

    kill: function() {
        this.rootNode.removeFromParent(true);
    },

    probablyMoveToFloor: function(floorY) {
        if (this._inDoor || this._lastDoor || this._toWaitBeforeNextDoor > 0) {
            return;
        }
        this._timeFromDoorCheck = 0;
        var chance = Math.random();
        if (chance < 0.4) {
            return;
        }

        this.rootNode.runAction(cc.Sequence.create([
            cc.Hide.create(),
            cc.CallFunc.create(function() {
                this._inDoor = true;
            }, this),
            cc.MoveTo.create(1, cc.p(this.rootNode.getPosition().x, floorY)),
            cc.CallFunc.create(function() {
                this._inDoor = false;
                this._toWaitBeforeNextDoor = 3;
            }, this),
            cc.Show.create()
        ]));
    },

    setLastDoor: function(door) {
        this._lastDoor = door;
    },

    _isOutOfBounds: function () {
        var x = this.rootNode.getPosition().x,
            halfWidth = this.rootNode.getContentSize().width;
        return x - halfWidth / 2 < 150 || x + halfWidth > 2100 - 150;
    },

    _changeDirection: function() {
        this._direction *= -1;
        this._startWalking();
    },

    _startWalking: function () {
       this._toWalkLeft = NPCController.minWalk + 
           Math.floor(Math.random() * NPCController._walkRange);

    }
};

Object.defineProperty(NPCController.prototype, 'isNPC', {
    writable: false,
    configurable: false,
    enumerable: true,
    value: true
});

