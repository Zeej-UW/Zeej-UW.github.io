const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();

var canvasWidth;
var canvasHeight;
var gameWorldHeight;

var hudHeight;

// Constant variable for tile size
const TILE_SIZE = 16;

function Player(game, spritesheetLeft, spritesheetRight, spritesheetIdle, spritesheetShootRun, xOffset, yOffset) {
    // Relevant for Player box
    var idle = true;
    this.width = 25;
    this.height = 36;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;

    this.animationLeft = new Animation(spritesheetLeft, this.width, this.height, 3, 0.10, 3, true, this.scale);
    this.animationRight = new Animation(spritesheetRight, this.width, this.height, 3, 0.10, 3, true, this.scale);
    this.animationIdle = new Animation(spritesheetIdle, this.width, this.height, 3, 0.10, 3, true, this.scale);
    this.animationShootRun = new Animation(spritesheetShootRun, this.width, this.height, 3, 0.10, 3, true, this.scale);

    this.animationStill = this.animationIdle;
    this.x = 60;
    this.y = 60;

    this.game = game;
    this.ctx = game.ctx;
    this.right = true;

    this.health = 100;

    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14,
        this.width, this.height); // **Temporary** Hard coded offset values.

}

Player.prototype.draw = function () {
    //draw player character with no animation if player is not currently moving
    if (!GAME_ENGINE.movement) {
        this.animationStill.drawFrameStill(this.ctx, this.x, this.y);
    } else {
        if (this.right) {
            this.animationRight.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.animationLeft.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
    }
}

Player.prototype.update = function () {
    // Conditional check to see if player wants to sprint or not
    var sprint = GAME_ENGINE.keyShift ? 1.75 : 1;
    var moving = false;
    this.collide(sprint);

    // Player movement controls
    if (GAME_ENGINE.keyW === true) {
        this.y -= 2 * sprint;
        moving = true;
    }
    if (GAME_ENGINE.keyA === true) {
        this.x -= 2 * sprint;
        this.right = false;
        moving = true;
        this.animationStill = this.animationLeft;
    }
    if (GAME_ENGINE.keyS === true) {
        this.y += 2 * sprint;
        moving = true;
    }
    if (GAME_ENGINE.keyD === true) {
        this.x += 2 * sprint;
        this.right = true;
        this.animationStill = this.animationRight;
        moving = true;
    }
    else {
        this.animationStill = this.animationIdle;
        moving = false
    }
    if (this.health <= 0) {
        this.game.reset();
    }

    if (GAME_ENGINE.click === true && moving == true) {
        this.animationStill = this.animationShootRun;
    }

    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14, this.width, this.height);
}

Player.prototype.collide = function (sprint) {
    //* 2 is the offset for a 2x2 of tiles.
    if (this.x + this.width + this.xOffset >= canvasWidth - TILE_SIZE * 2) {
        this.x += -2 * sprint;
    }
    if (this.x + this.xOffset <= TILE_SIZE * 2) {
        this.x += 2 * sprint;
    }
    if (this.y + this.yOffset + myPlayer.height >= canvasHeight - hudHeight - TILE_SIZE * 2) {
        this.y -= 2 * sprint;
    }
    if (this.y + this.yOffset <= TILE_SIZE * 2) {
        this.y += 2 * sprint;
    }
}

function Monster(game, spritesheet) {
    this.width = 40;
    this.height = 56;
    this.animation = new Animation(spritesheet, this.width, this.height, 1, 0.15, 15, true, 1);
    this.speed = 100;
    this.ctx = game.ctx;
    this.health = 100;
    Entity.call(this, game, 0, 350);

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, this.width, this.height);
}

Monster.prototype.update = function () {
    this.x -= this.game.clockTick * this.speed;
    if (this.x <= TILE_SIZE * 2) this.x = 450;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

function Projectile(game, spriteSheet, originX, originY, xTarget, yTarget) {
    this.width = 92;
    this.height = 75;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, 15, 8, true, .25);

    this.originX = originX;
    this.originY = originY;

    this.xTar = xTarget;
    this.yTar = yTarget;

    this.speed = 200;
    this.ctx = game.ctx;
    Entity.call(this, game, originX, originY);

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height);
}

Projectile.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Projectile.prototype.update = function () {
    var speedMod = 1.3;
    if (this.xTar < this.originX && this.yTar < this.originY) {
        this.x -= this.game.clockTick * this.speed;
        this.y -= this.game.clockTick * this.speed;
    } else if (this.xTar > this.originX + 14 && this.yTar < this.originY) {
        this.x += this.game.clockTick * this.speed;
        this.y -= this.game.clockTick * this.speed;
    } else if (this.xTar > this.originX + 14 && this.yTar > this.originY + 28) {
        this.x += this.game.clockTick * this.speed;
        this.y += this.game.clockTick * this.speed;
    } else if (this.xTar < this.originX && this.yTar > this.originY + 28) {
        this.x -= this.game.clockTick * this.speed;
        this.y += this.game.clockTick * this.speed;
    } else if (this.xTar > this.originX && this.yTar > this.originY && this.yTar < this.originY + 28) {
        this.x += this.game.clockTick * this.speed * speedMod;
    } else if (this.xTar < this.originX && this.yTar > this.originY && this.yTar < this.originY + 28) {
        this.x -= this.game.clockTick * this.speed * speedMod;
    } else if (this.xTar > this.originX && this.xTar < this.originX + 16 && this.yTar < this.originY) {
        this.y -= this.game.clockTick * this.speed * speedMod;
    } else {
        this.y += this.game.clockTick * this.speed * speedMod;
    }

    if (this.x < 0 || this.x > 500) this.removeFromWorld = true;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

function Trap(game, spriteSheetUp, spriteSheetDown) {
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationStill = this.animationUp;
    this.x = 200; // Hardcorded temp spawn
    this.y = 200; // Hardcorded temp spawn
    this.activated = false; // Determining if trap has been activated
    this.counter = 0; // Counter to calculate when trap related events should occur
    this.doAnimation = false; // Flag to determine if the spikes should animate or stay still

    this.game = game;
    this.ctx = game.ctx;

    this.boundingbox = new BoundingBox(this.x, this.y, 20, 20); // **Temporary** hardcode of width and height
}

Trap.prototype.draw = function () {
    if (!this.activated) {
        this.animationStill.drawFrameStill(this.ctx, this.x, this.y);
    } else {
        if (this.doAnimation) {
            this.animationUp.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.animationDown.drawFrameStill(this.ctx, this.x, this.y);
        }
    }
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, 20, 20); // **Temporary** Hard coded offset values
}

Trap.prototype.update = function () {
    for (var i = 0; i < GAME_ENGINE.playerEntities.length; i++) {
        var entityCollide = GAME_ENGINE.playerEntities[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            // Remember what tick the collision happened
            this.counter += this.game.clockTick;
            // Check to make sure the animation happens first
            if (this.counter < .1) {
                this.doAnimation = true;
            } else { // Else keep the spikes up as the player stands over the trap
                this.doAnimation = false;
                // Nuke the player, but start the damage .13 ticks after they stand on the trap
                // This allows players to sprint accross taking 10 damage
                if (GAME_ENGINE.playerEntities[i].health > 0 && this.counter > 0.18) {
                    GAME_ENGINE.playerEntities[i].health -= 2;
                    this.counter = .1;
                }
            }
            this.activated = true;
        } else {
            this.activated = false;
            this.doAnimation = false;
            this.counter = 0;
        }
    }
}

// BoundingBox for entities to detect collision.
function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

function Menu(game) {
    this.ctx = game.ctx;
    this.classButtonW = 100;
    this.classButtonH = 37;
    this.classButtonY = 400;
    this.classButtonTextY = 430;
    this.titleY = 200;
    this.mageButtonX = (canvasWidth - (this.classButtonW * 3)) / 4;
    this.rangerButtonX = 2 * this.mageButtonX + this.classButtonW;
    this.knightButtonX = this.rangerButtonX + this.classButtonW + this.mageButtonX;
    this.classButtonBottom = this.classButtonY + this.classButtonH;
    this.game = game;
    this.background = new Image();
    this.background.src = "./img/menu_background.jpg";
}

Menu.prototype.update = function () {
}

//values are TEMP. will change later.
Menu.prototype.draw = function () {
    this.ctx.drawImage(this.background, 253, 0,
        canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

    this.ctx.font = "50px Arial";
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.0005";
    this.ctx.fillRect(100, this.titleY,
        312, 50);

    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.0005";
    this.ctx.fillRect(this.mageButtonX, this.classButtonY,
        this.classButtonW, this.classButtonH);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("click here", this.mageButtonX, this.classButtonTextY);


    this.ctx.fillStyle = "rgba(255, 255, 255, 0.0005";
    this.ctx.fillRect(170, 300, 172, 37);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Click to shoot", 170, 330);
}

function HUD(game) {
    this.ctx = game.ctx;
    this.game = game;
    this.height = 100;
}

HUD.prototype.draw = function () {
    //ALL VALUES ARE HARCODED FOR NOW

    //health
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(40, canvasHeight - this.height / 2, 40, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(myPlayer.health, 15, canvasHeight - (this.height / 2) + 15);

    //mana?
    this.ctx.fillStyle = "blue";
    this.ctx.beginPath();
    this.ctx.arc(120, canvasHeight - this.height / 2, 40, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Mana", 82, canvasHeight - (this.height / 2) + 15);

    //ability 1
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(160, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(160, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("1", 160, canvasHeight - this.height + 15);
    this.ctx.fillText("N/A", 160, canvasHeight - this.height + 35);

    //ability 2
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(223, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(223, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("2", 223, canvasHeight - this.height + 15);

    this.ctx.fillText("N/A", 223, canvasHeight - this.height + 35);

    //ability 3
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(286, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(286, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("3", 286, canvasHeight - this.height + 15);
    this.ctx.fillText("N/A", 286, canvasHeight - this.height + 35);

    //ability 4
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(349, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(349, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("4", 349, canvasHeight - this.height + 15);
    this.ctx.fillText("N/A", 349, canvasHeight - this.height + 35);

    //stats
    //ability 4
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(160, canvasHeight - this.height / 2,
        252, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(160, canvasHeight - this.height / 2,
        252, this.height / 2);
    this.ctx.fillStyle = "white";
    var speed = (this.game.keyShift) ? 1.5 : 1
    
    this.ctx.fillText("Speed: " + speed, 160, canvasHeight - this.height / 2 + 15);

    //map
    //ability 4
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(412, canvasHeight - this.height,
        100, this.height);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(412, canvasHeight - this.height,
        100, this.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("map (N/A)", 412, canvasHeight - this.height + 15);
}

HUD.prototype.update = function () {

}

// No inheritance
function Background(game) {
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.map = [

        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

    ]
    this.mapLength = Math.sqrt(this.map.length);
    this.zero = new Image();
    this.zero.src = "./img/floor_1.png";
    this.one = new Image();
    this.one.src = "./img/floor_spikes_anim_f3.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    for (let i = 0; i < this.mapLength; i++) {
        for (let j = 0; j < this.mapLength; j++) {
            this.tile = (this.map[i * this.mapLength + j] == 1) ? this.one : this.zero;
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2 + TILE_SIZE);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2 + TILE_SIZE);
        }
    }
};

Background.prototype.update = function () {

};

function Animation(spriteSheet, frameWidth, frameHeight,
    sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.drawFrameStill = function (ctx, x, y) {
    ctx.drawImage(this.spriteSheet,
        0, 0,
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

AM.queueDownload("./img/megaman/pellet.png");
AM.queueDownload("./img/NPC_21.png");

// MEGAMAN
AM.queueDownload("./img/megaman/megaman_run_left.png");
AM.queueDownload("./img/megaman/megaman_run.png");
AM.queueDownload("./img/megaman/megaman_idle.png");
AM.queueDownload("./img/megaman/megaman_shoot_run.png");


AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.setAttribute("style",
        "position: absolute; left: 50%; margin-left:-256px; top:50%; margin-top:-306px");
    document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;


    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu(GAME_ENGINE));
});