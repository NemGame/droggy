document.addEventListener("DOMContentLoaded", LateLoad);

const c = document.querySelector("canvas"), ctx = c.getContext("2d");
c.center = Vector.null;

let steps = 50;

let v1 = Vector.parseFok(0).scale(100);
let v2 = Vector.parseFok(-45).scale(100);
let v3 = v1.self;

let imagesLoaded = {};

function LateLoad() {

    Update();
}

function Update() {
    ReloadCanvas();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = "white";
    c.center.scale(0.5).visualize(c.width / 2, c.height / 2);
    ctx.strokeStyle = "red";
    v1.visualize(c.width / 2, c.height / 2);
    ctx.strokeStyle = "blue";
    v2.visualize(c.width / 2, c.height / 2);
    ctx.strokeStyle = "green";
    v3.visualize(c.width / 2, c.height / 2);
    ctx.strokeStyle = "yellow";
    ctx.strokeText(v1.distanceTo(v2), c.width / 2, c.height / 2 + 10);
    ctx.strokeText(v1.distanceTo(v3), c.width / 2, c.height / 2 + 20);

    requestAnimationFrame(Update);
}

function ReloadCanvas() {
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    c.center = new Vector(c.width / 2, c.height / 2);
}