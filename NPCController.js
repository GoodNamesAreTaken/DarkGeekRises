function NPCController() {
    this._toWaitBeforeNextDoor = 0;
    this._speed = NPCController.walkSpeed;
}

NPCController.minWalk = 100;
NPCController.maxWalk = 1500;
NPCController.walkSpeed = 100;
NPCController.runSpeed = 200;

NPCController._walkRange = NPCController.maxWalk - NPCController.minWalk;

NPCController.prototype = {
    constructor: NPCController,

    onDidLoadFromCCB: function () {
        this._setDirection(Math.floor(Math.random() * 2) || -1);
        this.rootNode.scheduleUpdate();
        this.rootNode.update = this.update.bind(this);
        this._startWalking();
    },

    update: function(dt) {
        if (this._inDoor) {
            return;
        }
        this._toWaitBeforeNextDoor -= dt;
        var dist = this._speed * dt,
            position = this.rootNode.getPosition();
        position.x += dist * this._direction;
        this.rootNode.setPosition(position);
        this._toWalkLeft -= dist;

        if (this._isOutOfLeftBound()) {
            this._setDirection(1);
            this._startWalking();
        } else if (this._isOutOfRightBound()) {
            this._setDirection(-1);
            this._startWalking();
        } else if (this._toWalkLeft <= 0) {
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

    runAway: function(pointFrom) {
        if (this.rootNode.getPosition().x > pointFrom.x) {
            this._setDirection(1);
        } else {
            this._setDirection(-1);
        }

        this._toWalkLeft = 900;
        this._speed = NPCController.runSpeed;
    },

    setLastDoor: function(door) {
        this._lastDoor = door;
    },

    _isOutOfLeftBound: function () {
        var x = this.rootNode.getPosition().x,
            halfWidth = this.rootNode.getContentSize().width;
        return x - halfWidth / 2 < 0;
    },

    _isOutOfRightBound: function () {
        var x = this.rootNode.getPosition().x,
            halfWidth = this.rootNode.getContentSize().width;
        return x + halfWidth > 900;
    },

    _changeDirection: function() {
        this._setDirection(-this._direction);
        this._startWalking();
    },

    _setDirection: function(direction) {
        this._direction = direction;
        this.sprite.setFlipX(this._direction === -1);
    },

    _startWalking: function () {
        this._speed = NPCController.walkSpeed;
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

