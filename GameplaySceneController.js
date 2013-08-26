function GameplaySceneController() {
    this._keys = {};
    this._bombs = [];
    this._minSpawnTime = 10;
    this._maxSpawnTime = 14;
    this._currentPower = null;
    this._floorsY = [9, 209, 409];
    this._powers = [
        {icon: 'Shout.png', func: '_shout', chance: 5},
        {icon: 'super_shout.png', func: '_superShout', chance: 3},
        {icon: 'defuse_kit.png', func: '_defuse', chance: 1, instant: true}
    ];
    this._currentFloor = 0;
    this._bombsSpawned = 0;
    this._lives = 3;
}

GameplaySceneController.prototype = {
    constructor: GameplaySceneController,

    onDidLoadFromCCB: function() {
        this.rootNode.scheduleUpdate();
        this.rootNode.scheduleOnce(this._spawnBomb.bind(this), 5);
        this._schedulePowerUp();
        this._scheduleBombTicks();
        this._npcs = this.level.getChildren().filter(function(child) {
            return child.controller && child.controller.isNPC;
        });

        this._npcs.forEach(function(npc) {
            npc.controller.setGameController(this);
        }, this);

        this._containers = this.level.getChildren().filter(function(child) {
            return child.controller && child.controller.isContainer;
        });

        this._containers.forEach(function(container) {
            container.controller.setGameController(this);
        }, this);

        this._doors = this.level.getChildren().filter(function(child) {
            return child.controller && child.controller.isDoor;
        });

        //this.rootNode.runAction(cc.Follow.create(this.hero, cc.rect(0, 0, 2100, 720)));

        this.rootNode.update = this.update.bind(this);
        this.rootNode.onKeyDown = this.onKeyDown.bind(this);
        this.rootNode.onKeyUp = this.onKeyUp.bind(this);
    },

    _schedulePowerUp: function() {
        var interval = 10 + Math.random() * 5;
        this.rootNode.scheduleOnce(this._spawnPowerUp.bind(this), interval);
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
        } else if (key === cc.KEY.x && this._currentPower) {
            this[this._currentPower].call(this);
            this.hud.controller.clearPowerUp();
            this._currentPower = null;
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
            } else {
                this.hero.controller.stop();
            }
        }

        this._updateActionText();
        this._checkPowerUp();
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
                if (this._heroCollides(container)) {
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

    _checkPowerUp: function() {
        if (this._powerUp && this._heroCollides(this._powerUp)) {
            var power = this._powerUp.controller.power;
            if (power.instant) {
                this[power.func].call(this);
            } else {
                this._currentPower = power.func;
                this.hud.controller.setPowerUpIcon(power.icon);
            }
            this.removePowerUp(this._powerUp);
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
            x = 60 + Math.floor(Math.random() * (900 - 120));
        bomb.setPosition(cc.p(x, y));
        bomb.controller.setGameController(this);
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

    _spawnPowerUp: function() {
        var powerUp = cc.BuilderReader.load('PowerUp.ccbi'),
            y = this._floorsY[Math.floor(Math.random() * this._floorsY.length)],
            x = 60 + Math.floor(Math.random() * (900 - 120)),
            power = this._randomPower();

        powerUp.setPosition(cc.p(x, y));
        powerUp.controller.setPower(power);
        powerUp.controller.setGameController(this);
        this.level.addChild(powerUp);
        this._powerUp = powerUp;
        this._schedulePowerUp();
    },

    _randomPower: function() {
        var maxChance = this._powers.reduce(function(sum, power) {
            return sum + power.chance;
        }, 0);
        var chance = Math.floor(Math.random() * maxChance),
                     lastChance = 0,
                     result;
        
        this._powers.some(function(power) {
            lastChance += power.chance;
            if (chance < lastChance) {
                result = power;
                return true;
            }
        });
        return result;
    },

    removePowerUp: function() {
        this._powerUp.removeFromParent(true);
        this._powerUp = null;
    },

    removeNPC: function(npc) {
        npc.removeFromParent(true);
        this._npcs.splice(this._npcs.indexOf(npc), 1);
        if (this._npcs.length === 0) {
            this._gameOver();
        }
    },

    removeContainer: function(container) {
        container.removeFromParent(true);
        this._containers.splice(this._containers.indexOf(container), 1);
    },

    hitHero: function() {
        this._lives--;
        if (this._lives <= 0) {
            this._gameOver();
        } else {
            this.hero.controller.animateHit();
        }
    },

    _gameOver: function() {
        var scene = cc.BuilderReader.loadAsScene('GameOverScene.ccbi');
        cc.Director.getInstance().replaceScene(scene);
    },

    _bombTick: function() {
        var i=0, bomb;
        while ((bomb = this._bombs[i])) {
            bomb.controller.tick();
            if (bomb.controller.isExploded()) {
                this.hero.controller.removeBombIfCarrying(bomb);
                this._bombs.splice(i, 1);
            } else {
                i++;
            }
        }

        this.hero.controller.onBombTick();
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
            cc.MoveTo.create(0.2, cc.p(this.hero.getPosition().x,
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

    _superShout: function() {
       this._npcs.forEach(function(npc) {
           npc.controller.runAway(this.hero.getPosition());
       }, this);
    },

    _defuse: function() {
        this._bombs.forEach(function(bomb) {
            bomb.removeFromParent(true);
        });
        this._containers.forEach(function(container) {
            container.controller.removeBomb();
        });
        this._bombs = [];
        this.hero.controller.removeBombIfCarrying();
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

