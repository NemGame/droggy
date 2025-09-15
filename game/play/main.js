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
        ReloadImage(name, false);
    });
})

const player = new Player(Vector.null, 16, "2", 3);

let texture = new Texture("2.png");

let isRunning = false;
let runningMult = 2;

keys.bindkey("KeyW", () => {
    player.moveDirection.y += -1;
}, "down");

keys.bindkey("KeyS", () => {
    player.moveDirection.y += 1;
}, "down");

keys.bindkey("KeyA", () => {
    player.moveDirection.x += -1;
}, "down");

keys.bindkey("KeyD", () => {
    player.moveDirection.x += 1;
}, "down");

keys.bindkey("ShiftLeft", () => isRunning = true, "press");
keys.bindkey("ShiftLeft", () => isRunning = false, "up");


function LateLoad() {

    Update();
}

function Update() {
    texture.draw();
    
    keys.update();
    ReloadCanvas();

    player.automove();

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

/** Completely reloads the image */
function ReloadImage(name="undefined.png", deleteFromList=true, autocorrectName=true) {
    if (deleteFromList) delete imagesLoaded[name];
    if (autocorrectName && !(name.includes("."))) name += ".png";
    let reloadedImg = new Image();
    reloadedImg.src = "imgs/" + name + "?t=" + Date.now();
    reloadedImg.onload = () => {
        imagesLoaded[name] = reloadedImg;
        console.log("Image successfully reloaded: " + name);
    }
}