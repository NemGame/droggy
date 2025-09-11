document.addEventListener("DOMContentLoaded", LateLoad);

const c = document.querySelector("canvas"), ctx = c.getContext("2d");

let res = 1;

function LateLoad() {

    Update();
}

function Update() {
    ReloadCanvas();

    requestAnimationFrame(Update);
}

function ReloadCanvas() {
    c.width = c.offsetWidth * res;
    c.height = c.offsetHeight * res;
    ctx.clearRect(0, 0, c.width, c.height);
}