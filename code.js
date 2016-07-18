"use strict";

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let width = 32;
let height = 32;
let cmpWidth = 16;
let cmpHeight = 16;
let oldCircuit = null;
let circuit = [];
let boundaryNeighbor = null;
const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;

let images = ["empty", "w_cross", "w_crossA", "src_continuous", "w_hor", "w_horA", "w_ver", "w_verA",
    "w_crossjump", "w_crossjumpA", "w_crossjumpV", "w_crossjumpH"  
];
let sprites = {};

function start() {
    boundaryNeighbor = new Empty();
    clearCircuit();
    
    // DEBUG CODE
    circuit[5][5] = new WCross(5, 5);
    circuit[10][10] = new SrcContinuous(10, 10);
    circuit[11][10] = new WCross(11, 10);
    circuit[12][10] = new WCross(12, 10);
    circuit[12][11] = new WCross(12, 11);
    circuit[9][9] = new WCross(9, 9);
    circuit[10][9] = new WCross(10, 9);

    loadImages(() => {
        window.requestAnimationFrame(refresh);
    });

}

function refresh() {
    window.requestAnimationFrame(refresh);
    updateCircuit();
    drawCircuit();
}

function clearCircuit() {
    circuit = [];
    for (let x = 0; x < width; x++) {
        circuit[x] = [];
        for (let y = 0; y < height; y++) {
            circuit[x][y] = new WCrossjump(x, y);
        }
    }
    oldCircuit = circuit;
}

function drawCircuit() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            ctx.drawImage(circuit[x][y].getSprite(), x * cmpWidth, y * cmpHeight, cmpWidth, cmpHeight);
        }
    }
}

function updateCircuit() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            circuit[x][y].update();
        }
    }
}

function loadImages(cb) {
    sprites = {};
    let loaded = 0;
    for (let img of images) {
        sprites[img] = new Image();
        sprites[img].onload = () => {
            loaded++;
            if (loaded === images.length) {
                cb();
            }
        };
        sprites[img].src = img + ".png";
    }
}

function Empty(x, y) {
    this.x = x;
    this.y = y;
    this.update = () => {};
    this.getState = () => 0;
    this.getSprite = () => sprites["empty"];
}

function SrcContinuous(x, y) {
    this.x = x;
    this.y = y;
    this.update = () => {};
    this.getState = () => 1;
    this.getSprite = () => sprites["src_continuous"];
}

function WCross(x, y) {
    this.x = x;
    this.y = y;
    this.state = 0;
    this.update = () => {
        this.state = getNeighbor(this.x, this.y, TOP).getState(BOTTOM) || 
            getNeighbor(this.x, this.y, RIGHT).getState(LEFT) ||
            getNeighbor(this.x, this.y, BOTTOM).getState(TOP) ||
            getNeighbor(this.x, this.y, LEFT).getState(RIGHT);
    };
    this.getState = () => this.state;
    this.getSprite = () => this.state ? sprites["w_crossA"] : sprites["w_cross"];
}

function WCrossjump(x, y) {
    this.x = x;
    this.y = y;
    this.stateV = 0;
    this.stateH = 0;
    this.update = () => {
        this.stateV = getNeighbor(this.x, this.y, TOP).getState(BOTTOM) || 
            getNeighbor(this.x, this.y, BOTTOM).getState(TOP);
        this.stateH = getNeighbor(this.x, this.y, RIGHT).getState(LEFT) ||
            getNeighbor(this.x, this.y, LEFT).getState(RIGHT);
    };
    this.getState = (dir) => {
        if (dir === TOP || dir === BOTTOM) {
            return this.stateV;
        }
        return this.stateH;
    };
    this.getSprite = () => { 
        if (this.stateV && this.stateH) {
            return sprites["w_crossjumpA"];
        } else if (this.stateV) {
            return sprites["w_crossjumpV"];
        } else if (this.stateH) {
            return sprites["w_crossjumpH"];
        }
        return sprites["w_crossjump"];
    };
}

function WHor(x, y) {
    this.x = x;
    this.y = y;
    this.state = 0;
    this.update = () => {
        this.state = getNeighbor(this.x, this.y, RIGHT).getState(LEFT) ||
            getNeighbor(this.x, this.y, LEFT).getState(RIGHT);
    };
    this.getState = (dir) => {
        if (dir === TOP || dir === BOTTOM) {
            return 0;
        }
        return this.state;
    };
    this.getSprite = () => this.state ? sprites["w_horA"] : sprites["w_hor"];
}

function WVer(x, y) {
    this.x = x;
    this.y = y;
    this.state = 0;
    this.update = () => {
        this.state = getNeighbor(this.x, this.y, TOP).getState(BOTTOM) || 
            getNeighbor(this.x, this.y, BOTTOM).getState(TOP);
    };
    this.getState = (dir) => {
        if (dir === RIGHT || dir === LEFT) {
            return 0;
        }
        return this.state;
    };
    this.getSprite = () => this.state ? sprites["w_verA"] : sprites["w_ver"];
}

function getNeighbor(x, y, dir) {
    if (!inRange(x, 0, width) || !inRange(y, 0, height)) {
        throw new Error(`getNeighbor: Invalid position: (${x}, ${y})`);
    }

    switch(dir) {
        case TOP:
            if (y === 0) {
                return boundaryNeighbor;
            }
            return circuit[x][y - 1];
        case RIGHT:
            if (x >= width - 1) {
                return boundaryNeighbor;
            }
            return circuit[x + 1][y];
        case BOTTOM:
            if (y >= height - 1) {
                return boundaryNeighbor;
            }
            return circuit[x][y + 1];
        case LEFT:
            if (x === 0) {
                return boundaryNeighbor;
            }
            return circuit[x - 1][y];
    }
    throw new Error(`getNeighbor: Invalid direction: ${dir}`);
}

function inRange(n, min, max) {
    return n >= min || n < max;
}

start();