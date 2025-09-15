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

const textures = {
    "2.png": new Texture("2.png"),
    "fella_animation_test.png": new Texture("fella_animation_test.png", ["2.png"]),
    "test": new Texture("2state_3id_base.png"),
    "ground": new Texture("og_padlo.png"),
    "chest": new Texture("chest.png")
};
Object.values(textures).forEach(x => x.init());
const player = new Player(Vector.null, 16, 1, textures["fella_animation_test.png"]);

keys.bindkey("KeyW", () => {
    player.moveDirection.y += -1;
    player.lastDirPressed = Vector.up;
}, "down");

keys.bindkey("KeyS", () => {
    player.moveDirection.y += 1;
    player.lastDirPressed = Vector.down;
}, "down");

keys.bindkey("KeyA", () => {
    player.moveDirection.x += -1;
    player.lastDirPressed = Vector.left;
}, "down");

keys.bindkey("KeyD", () => {
    player.moveDirection.x += 1;
    player.lastDirPressed = Vector.right;
}, "down");

function LateLoad() {

    Update();
}

function Update() {
    ReloadCanvas();

    player.automove();

    textures["ground"].drawAt(Vector.null);

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
function ReloadImage(name="undefined.png") {
    let texture;
    if (typeof name == "string") texture = GetTextureWithSourceImage(name);
    else texture = new Texture(source);
}

function GetTextureWithSourceImage(source="") {
    let values = Object.values(textures);
    for (let x of values) if (x.source == source) return x;
    return null;
}