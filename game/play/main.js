document.addEventListener("DOMContentLoaded", LateLoad);

const c = document.querySelector("canvas"), ctx = c.getContext("2d");

let res = 1/4;

/**
 * @example
 * 0 - localhost
 * 1 - namecheap
 */
const loadMode = 0;
let imageNames = [];
let imagesLoaded = {};
getImageNames().then(x => {
    console.log(x);
    x.forEach(name => {
        let img = new Image();
        img.src = "imgs/" + name;
        console.log(img);
        imagesLoaded[name] = null;
        img.addEventListener("load", () => {
            imagesLoaded[name] = img;
        })
    });
})

const player = new Player(Vector.null, 16, "2");

let speed = 2;
let isRunning = false;
let runningMult = 2;

keys.bindkey("KeyW", () => {
    player.move(0, -speed * (isRunning ? runningMult : 1));
}, "down");

keys.bindkey("KeyS", () => {
    player.move(0, speed * (isRunning ? runningMult : 1));
}, "down");

keys.bindkey("KeyA", () => {
    player.move(-speed * (isRunning ? runningMult : 1));
}, "down");

keys.bindkey("KeyD", () => {
    player.move(speed * (isRunning ? runningMult : 1));
}, "down");

keys.bindkey("ShiftLeft", () => isRunning = true, "press");
keys.bindkey("ShiftLeft", () => isRunning = false, "up");


function LateLoad() {

    Update();
}

function Update() {
    keys.update();
    ReloadCanvas();

    player.draw();



    requestAnimationFrame(Update);
}

function getImageNames() {
    return fetch("imgs/").then(res => res.text()).then(x => {
        let div = document.createElement("div");
        div.innerHTML = x;
        switch (loadMode) {
            case 0:
                imageNames = [...div.querySelectorAll("#files li:not(:first-child) a .name")].map(x => x.textContent);
                break;
            case 1:
                console.error("fuck");
                break;
            default: return;
        }
        return imageNames;
    })
}

function ReloadCanvas() {
    c.width = c.offsetWidth * res;
    c.height = c.offsetHeight * res;
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, c.width, c.height);
}

function ReloadImage(name="undefined.png") {
    delete imagesLoaded[name];
    let reloadedImg = new Image();
    reloadedImg.src = "imgs/" + name;
    reloadedImg.onload = () => {
        imagesLoaded[name] = reloadedImg;
        console.log("Image successfully reloaded: " + name);
    }
}