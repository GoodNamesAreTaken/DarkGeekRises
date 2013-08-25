function DoorController() {
}

Object.defineProperty(DoorController.prototype, 'isDoor', {
    writable: false,
    configurable: false,
    enumerable: true,
    value: true
});

function UpDoorController() {
}

UpDoorController.prototype = Object.create(DoorController.prototype, {
    constructor: {
        writable: true,
        enumerable: true,
        configurable: true,
        value: UpDoorController
    },

    direction: {
        writable: false,
        enumerable: true,
        configurable: false,
        value: 'Up'
    }
});


function DownDoorController() {
}

DownDoorController.prototype = Object.create(DoorController.prototype, {
    constructor: {
        writable: true,
        enumerable: true,
        configurable: true,
        value: DownDoorController
    },

    direction: {
        writable: false,
        enumerable: true,
        configurable: false,
        value: 'Down'
    }
});
