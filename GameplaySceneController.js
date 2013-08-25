function GameplaySceneController() {
    this._keys = {};
    this._bombs = [];
    this._minSpawnTime = 10;
    this._maxSpawnTime = 14;
    this._floorsY = [9, 209, 409];
    this._currentFloor = 0;
    this._bombsSpawned = 0;
}

GameplaySceneController.prototype = {
    constructor: GameplaySceneController,

    onDidLoadFromCCB: function() {
        this.rootNode.scheduleUpdate();
        this.rootNode.scheduleOnce(this._spawnBomb.bind(this), 5);
        this._scheduleBombTicks();
        this._npcs = this.level.getChildren().filter(function(child) {
            return child.controller && child.controller.isNPC;
        });

        this._containers = this.level.getChildren().filter(function(child) {
            return child.controller && child.controller.isContainer;
        });

        this._doors = this.level.getChildren().filter(function(child) {
            return child.controller && child.controller.isDoor;
        });

        //this.rootNode.runAction(cc.Follow.create(this.hero, cc.rect(0, 0, 2100, 720)));

        this.rootNode.update = this.update.bind(this);
        this.rootNode.onKeyDown = this.onKeyDown.bind(this);
        this.rootNode.onKeyUp = this.onKeyUp.bind(this);
    },

    _scheduleBomb: function() {
        var interval = this._minSpawnTime + Math.random() * (this._maxSpawnTime - this._minSpawnTime);
        this.rootNode.scheduleOnce(this._spawnBomb.bind(this), interval);
    },

    _scheduleBombTicks: function() {
        this.rootNode.schedule(this._bombTick.bind(this), 1);
    },

    onKeyDown: function(key) {
        if ([cc.KEY.z, cc.KEY.w, cc.KEY.y].indexOf(key) != -1 && this._currentAction) {
            this[this._currentAction].call(this);
            this._currentAction = null;
        } else if (key === cc.KEY.x) {
            this._shout();
        }
        this._keys[key] = true;
    },

    onKeyUp: function(key) {
        this._keys[key] = false;
    },

    update: function(dt) {
        if (!this._inDoor) {
            if (this._keys[cc.KEY.left]) {
                this.hero.controller.moveLeft(dt);
            } else if (this._keys[cc.KEY.right]) {
                this.hero.controller.moveRight(dt);
            }
        }

        this._updateActionText();
        this._checkNPCDoors();
    },

    _updateActionText: function() {
        if (this._inDoor){ 
            return;
        }

        var isNearDoor = this._doors.some(function(door) {
            if (this._doorCollides(door, this.hero)) {
                this._doorToEnter = door;
                return true;
            }
        }, this);

        if (isNearDoor) {
            this.hero.controller.updateAction(this._doorToEnter.controller.direction);
            this._currentAction = '_enterDoor';
            return;
        }

        var carryingBomb = this.hero.controller.isCarryingBomb(),
            nearBomb = this._bombs.some(function(bomb) {
            if (!bomb.controller.isInContainer() && this._heroCollides(bomb)) {
                this._bombToPick = bomb;
                return true;
            }
        }, this);

        if (nearBomb && !carryingBomb) {
            this.hero.controller.updateAction("Pick");
            this._currentAction = '_pickBomb';
        } else if (carryingBomb) {
            var isNearContainer = this._containers.some(function(container) {
                if (!container.controller.hasBomb() && this._heroCollides(container)) {
                    this._containerToUse = container;
                    return true;
                }
            }, this);

            if (isNearContainer) {
                this.hero.controller.updateAction("Put in");
                this._currentAction = '_putInContainer';
            } else {
                this.hero.controller.updateAction("Drop");
                this._currentAction = '_dropBomb';
            }
        } else {
            this._currentAction = null;
            this.hero.controller.updateAction("");
        }
    },

    _checkNPCDoors: function() {
        this._npcs.forEach(function(npc) {
            var collided = this._doors.some(function(door) {
                if (this._doorCollides(door, npc)) {
                    npc.controller.probablyMoveToFloor(this._getDoorFloor(door));
                    npc.controller.setLastDoor(door);
                    return true;
                }
            }, this);
            if (!collided) {
                npc.controller.setLastDoor(null);
            }
        }, this);
    },

    _getDoorFloor: function(door) {
        var doorY = cc.rectGetMinY(door.getBoundingBox()),
            doorCurrentFloor;

        this._floorsY.some(function(y, i) {
            if (Math.abs(doorY - y) <= 9) {
                doorCurrentFloor = i;
                return true;
            }
        });

        if (door.controller.direction === 'Up') {
            return this._floorsY[doorCurrentFloor + 1];
        } else {
            return this._floorsY[doorCurrentFloor - 1];
        }
    },

    _heroCollides: function(node) {
        return this._collides(this.hero, node);

    },

    _doorCollides: function(door, node) {
        var doorBox = door.getBoundingBox(),
            nodeBox = node.getBoundingBox();

        return cc.rectGetMinX(nodeBox) >= cc.rectGetMinX(doorBox) &&
            cc.rectGetMaxX(nodeBox) <= cc.rectGetMaxX(doorBox) &&
            Math.abs(cc.rectGetMinY(nodeBox) - cc.rectGetMinY(doorBox)) <= 8;
    },

    _collides: function(node1, node2) {
        return cc.rectIntersectsRect(node1.getBoundingBox(),
                                     node2.getBoundingBox());
    },

    _spawnBomb: function() {
        var bomb = cc.BuilderReader.load('Bomb.ccbi'),
            y = this._floorsY[Math.floor(Math.random() * this._floorsY.length)],
            x = 150 + Math.floor(Math.random() * 750);
        bomb.setPosition(cc.p(x, y));
        bomb.controller.setLayer(this.level);
        bomb.controller.setNPCs(this._npcs);
        this._bombs.push(bomb);
        this.level.addChild(bomb);
        this._scheduleBomb();
        this._bombsSpawned++;
        if (this._bombsSpawned % 2 === 0 && this._minSpawnTime > 1) {
            this._minSpawnTime--;
        } else if (this._maxSpawnTime > 3) {
            this._maxSpawnTime--;
        }
    },

    _bombTick: function() {
        var i=0, bomb;
        while ((bomb = this._bombs[i])) {
            bomb.controller.tick();
            if (bomb.controller.isExploded()) {
                this.hero.controller.removeBombIfCarrying(bomb);
                this._removeContainerOfBomb(bomb);
                this._bombs.splice(i, 1);
            } else {
                i++;
            }
        }

        this.hero.controller.onBombTick();
    },

    _removeContainerOfBomb: function(bomb) {
        var container = bomb.controller.getContainer();
        if (container) {
            this._containers.splice(this._containers.indexOf(container), 1);
        }
    },

    //spacebar actions
    
    _pickBomb: function() {
        this.hero.controller.pickBomb(this._bombToPick);
        this._bombToPick = null;
    },

    _dropBomb: function() {
        var bomb = this.hero.controller.dropBomb();
        this.level.addChild(bomb);
    },

    _putInContainer: function() {
        var bomb = this.hero.controller.dropBomb();
        this._containerToUse.controller.putBombIn(bomb);
    },

    _enterDoor: function() {
        var direction = this._doorToEnter.controller.direction;
        if (direction === 'Up') {
            this._currentFloor++;
        } else {
            this._currentFloor--;
        }
        this.hero.runAction(cc.Sequence.create([
            cc.Hide.create(),
            cc.CallFunc.create(function() {
                this._inDoor = true;
            }, this),
            cc.MoveTo.create(1, cc.p(this.hero.getPosition().x,
                                     this._floorsY[this._currentFloor])),
            cc.CallFunc.create(function() {
                this._inDoor = false;
            }, this),
            cc.Show.create()
        ]));
    },

    //powerups
    _shout: function() {
       this._eachNPCInRange(200, function(npc) {
           npc.controller.runAway(this.hero.getPosition());
       });
    },


    _eachNPCInRange: function(range, fn) {
        var heroPos = this.hero.getPosition();
        this._npcs.forEach(function(npc) {
            var npcPos = npc.getPosition();
            if (Math.abs(npcPos.x - heroPos.x) <= range && Math.abs(npcPos.y - heroPos.y) < 0.1) {
                fn.call(this, npc);
            }
        }, this); 
    }
};

