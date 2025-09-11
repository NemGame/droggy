document.addEventListener("DOMContentLoaded", LateLoad);

const c = document.querySelector("canvas"), ctx = c.getContext("2d");

let res = 1;

const player = new Player();

let speed = 10;

keys.bindkey("KeyW", () => {
    player.move(0, -speed);
}, "down");

keys.bindkey("KeyS", () => {
    player.move(0, speed);
}, "down");

keys.bindkey("KeyA", () => {
    player.move(-speed);
}, "down");

keys.bindkey("KeyD", () => {
    player.move(speed);
}, "down");

function LateLoad() {

    Update();
}

function Update() {
    keys.update();
    ReloadCanvas();

    player.draw();



    requestAnimationFrame(Update);
}

function ReloadCanvas() {
    c.width = c.offsetWidth * res;
    c.height = c.offsetHeight * res;
    ctx.clearRect(0, 0, c.width, c.height);
}