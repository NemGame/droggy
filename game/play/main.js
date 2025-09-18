document.addEventListener("DOMContentLoaded", LateLoad);
document.addEventListener("mousemove", (event) => {
    const b = c.getBoundingClientRect();
    mpos = Vector.as((event.clientX - b.left) * (c.width / b.width), (event.clientY - b.top) * (c.height / b.height)).rounded;
})

let mpos = Vector.null;

const c = document.querySelector("canvas"), ctx = c.getContext("2d");

let canvasSize = Vector.as(21, 16);

let res = 1/4;

/**
 * @example
 * 0 - localhost
 * 1 - namecheap
 * 2 - file
 */
const loadMode = 0;
let imageNames = [];
let imagesLoaded = {};
getImageNames();

const textures = {
    "2.png": new Texture("2.png"),
    "fella_animation_test.png": new Texture("fella_animation_test.png", ["2.png"]),
    "test": new Texture("2state_3id_base.png"),
    "ground": new Texture("og_padlo.png"),
    "chest": new Texture("chest.png")
};
Object.values(textures).forEach(x => x.init());
const player = new Player(canvasSize.deved(2).floor.mult(16), 16, 1, textures["fella_animation_test.png"]);

let tiles = {};
player.autoGenerateTiles();

function DoesTileExist(pos=Vector.null) {
    if (typeof tiles[pos.y] == "undefined") return false;
    if (typeof tiles[pos.y][pos.x] == "undefined") return false;
    return true;
}

function TileAt(pos=Vector.null) {
    if (typeof tiles[pos.y] == "undefined") return null;
    if (typeof tiles[pos.y][pos.x] == "undefined") return null;
    return tiles[pos.y][pos.x];
}

let generationPercent = 0, generationCount = 0;

function GenerateNeighbourTiles(pos=Vector.null, size=16, texture=Texture.null, dist=1) {
    let newTiles = [];
    for (let i = -dist; i < dist + 1; i++) {
        for (let y = -dist; y < dist + 1; y++) {
            let rpos = Vector.as(i * size, y * size).added(pos);
            let apos = pos.added(Vector.as(i * size, y * size)).rounded;
            if (DoesTileExist(apos) || !apos.isDivisibleBy(size)) continue;
            if (tiles[apos.y] == undefined) tiles[apos.y] = {};
            tiles[apos.y][apos.x] = new Tile(apos, texture);
            newTiles.push(rpos.self);
        }
    }
    if (newTiles.length > 0) console.log("New tiles generated");
    return newTiles;
}

function DrawShownTiles() {
    let pos = player.pos.placeInGrid(16).mult(16);
    ctx.rect(pos.x - player.renderDistance * 16, pos.y - player.renderDistance * 16, (player.renderDistance + 0.5) * 32, (player.renderDistance + 0.5) * 32);
    for (let i = -player.renderDistance; i < player.renderDistance + 1; i++) {
        for (let y = -player.renderDistance; y < player.renderDistance + 1; y++) {
            if (tiles[pos.y + (i * 16)] === undefined || tiles[pos.y + (i * 16)][pos.x + (y * 16)] === undefined) continue;
            tiles[pos.y + (i * 16)][pos.x + (y * 16)].draw();
        }
    }
}

function DrawAllTiles() {
    Object.keys(tiles).forEach(row => {
        Object.keys(tiles[row]).forEach(tile => {
            tiles[row][tile].draw()
        })
    });
}

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
    LoadCanvas();

    Update();
}

function Update() {
    ReloadCanvas();

    player.automove();

    // textures["ground"].drawAt(Vector.null);

    DrawShownTiles();

    ctx.beginPath();
    ctx.arc(mpos.x, mpos.y, 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

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
            default:
                console.error("Yeah, no.");
                break;
        }
        return imageNames;
    }).catch(e => console.warn(e));
}

function LoadCanvas() {
    c.style.maxWidth = canvasSize.x * 16;
    c.style.maxHeight = canvasSize.y * 16;
    c.style.cursor = "none";
}

function ReloadCanvas() {
    c.width = canvasSize.x * 16;
    c.height = canvasSize.y * 16;
    let x = document.documentElement.clientWidth / c.width, y = document.documentElement.clientHeight / c.height;
    let z = Math.min(x, y);
    let padding = 0.3;
    c.style.width = c.width * (z - padding) + "px";
    c.style.height = c.height * (z - padding) + "px";
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, c.width, c.height);
}

function GetTextureWithSourceImage(source="") {
    let values = Object.values(textures);
    for (let x of values) if (x.source == source) return x;
    return null;
}

function ToggleFullscreen() {
    if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else console.error("Failed exit fullscreen mode: document.exitFullscreen does not exist");
    } else {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        else console.error("Failed to enter fullscreen mode: c.requestFullscreen does not exist");
    }
}