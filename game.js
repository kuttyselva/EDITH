// SELECT CVS
const cvs = document.getElementById("tony");
const ctx = cvs.getContext("2d");

// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI / 180;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/sprite.png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// GAME STATE
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

// START BUTTON COORD
const startBtn = {
    x: 500,
    y: 530,
    w: 290,
    h: 110
}

// CONTROL THE GAME
cvs.addEventListener("click", function (evt) {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if (tony.y - tony.radius <= 0) return;
            tony.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            // CHECK IF WE CLICK ON THE START BUTTON
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                blocks.reset();
                tony.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});


// BACKGROUND
const bg = {
    sX: 0,
    sY: 0,
    w: 1270,
    h: 690,
    x: 0,
    y: cvs.height - 690,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }

}

// FOREGROUND
const fg = {
    sX: 1275,
    sY: 0,
    w: 797,
    h: 160,
    x: 0,
    y: cvs.height - 160,

    dx: 2,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + 1000, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update: function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

// tony
const tony = {
    animation: [
        { sX: 1275, sY: 365 },
        { sX: 1275, sY: 420 },
        { sX: 1275, sY: 476 },
        { sX: 1275, sY: 420 }
    ],
    x: 150,
    y: 180,
    w: 205,
    h: 55,

    radius: 12,

    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw: function () {
        let tony = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, tony.sX, tony.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
        ctx.restore();
    },

    flap: function () {
        this.speed = - this.jump;
    },

    update: function () {
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames % this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150; // RESET POSITION OF THE tony AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    if(state.current == state.over && score.value <10){
                        var fail = document.getElementById('fail');
                        fail.style.display = 'block';
                        setTimeout(() => { fail.style.display = 'none' }, 3000);
                    }
                    DIE.play();
                }
            }

            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE tony IS FALLING DOWN
            if (this.speed >= this.jump) {
                this.rotation = 0 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }

    },
    speedReset: function () {
        this.speed = 0;
    }
}

// GET READY MESSAGE
const getReady = {
    sX: 620,
    sY: 700,
    w: 685,
    h: 465,
    x: cvs.width / 2 - 685 / 2,
    y: 50,

    draw: function () {
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

// GAME OVER MESSAGE
const gameOver = {
    sX: 1304,
    sY: 710,
    w: 700,
    h: 600,
    x: cvs.width / 2 - 700 / 2,
    y: 50,
   
    draw: function () {
        if (state.current == state.over) {
           
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        }
    }

}

// blocks
const blocks = {
    position: [],

    top: {
        sX: 0,
        sY: 705
    },
    bottom: {
        sX: 280,
        sY: 692
    },

    w: 270,
    h: 359,
    gap: 185,
    maxYPos: -150,
    dx: 8,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // top block
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // bottom block
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function () {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            // COLLISION DETECTION
            // TOP block
            if (tony.x + tony.radius > p.x && tony.x - tony.radius < p.x + this.w && tony.y + tony.radius > p.y && tony.y - tony.radius < p.y + this.h) {
                state.current = state.over;
                if(state.current == state.over && score.value <10){
                    var fail = document.getElementById('fail');
                    fail.style.display = 'block';
                    setTimeout(() => { fail.style.display = 'none' }, 3000);
                }
                HIT.play();
            }
            // BOTTOM block
            if (tony.x + tony.radius > p.x && tony.x - tony.radius < p.x + this.w && tony.y + tony.radius > bottomPipeYPos && tony.y - tony.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                if(state.current == state.over && score.value <10){
                    var fail = document.getElementById('fail');
                    fail.style.display = 'block';
                    setTimeout(() => { fail.style.display = 'none' }, 3000);
                }
                HIT.play();
            }

            // MOVE THE blocks TO THE LEFT
            p.x -= this.dx;

            // if the blocks go beyond canvas, we delete them from the array
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                if (score.value > 10) {
                    var end = document.getElementById('end');
                    end.style.display = 'block';
                    setTimeout(() => { end.style.display = 'none' }, 15000);
                }
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset: function () {
        this.position = [];
    }

}

// SCORE
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function () {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);

        } else if (state.current == state.over) {
            // SCORE VALUE
            ctx.font = "80px Teko";
            ctx.fillText(this.value, 520, 370);
            ctx.strokeText(this.value, 520, 370);
            // BEST SCORE
            ctx.fillText(this.best, 800, 370);
            ctx.strokeText(this.best, 800, 370);
        }
    },

    reset: function () {
        this.value = 0;
    }
}

// DRAW
function draw() {
    ctx.fillStyle = "#07084D";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    blocks.draw();
    fg.draw();
    tony.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update() {
    tony.update();
    fg.update();
    blocks.update();
}

// LOOP
function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}
loop();
