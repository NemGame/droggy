document.addEventListener("DOMContentLoaded", LateLoad);
document.addEventListener("mousemove", (event) => {
    const b = c.getBoundingClientRect();
    mpos = Vector.as((event.clientX - b.left) * (c.width / b.width), (event.clientY - b.top) * (c.height / b.height)).rounded;
});
document.addEventListener("fullscreenchange", (e) => {
    console.log(e)
});

let mpos = Vector.null;

const c = document.querySelector("canvas"), ctx = c.getContext("2d");
c.addEventListener("contextmenu", (e) => e.preventDefault());

let canvasSize = Vector.as(21, 16);

let res = 1/4;
/**
 * @example
 * 0 - localhost
 * 1 - namecheap
 * 2 - file
 */
const loadMode = 0;
let imagesLoaded = {};

const textures = {
    "2.png": new Texture("2.png"),
    "fella_animation_test.png": new Texture("fella_animation_test.png", ["2.png"]),
    "test": new Texture("2state_3id_base.png"),
    "ground": new Texture("og_padlo.png"),
    "chest": new Texture("chest.png"),
    "undefined": Texture.null,
    "apple": new Texture("aple.png")
};
Object.values(textures).forEach(x => x.init());
const player = new Player(canvasSize.deved(2).floor.mult(16), 16, 1, textures["fella_animation_test.png"]);
const items = {
    "undefined": Item.null,
    "apple": new Item("Apple", textures["aple"], true, () => { player.hp++; }, 1000)
};

let tiles = {};
player.autoGenerateTiles();

//#region Tile logic
function DoesTileExist(pos=Vector.null) {
    if (typeof tiles[pos.y] == "undefined") return false;
    if (typeof tiles[pos.y][pos.x] == "undefined") return false;
    return true;
}

/**
 * @param {Vector} pos position x16
 * @returns {Vector} Vector
 */
function TileAt(pos=Vector.null) {
    if (typeof tiles[pos.y] == "undefined") return null;
    if (typeof tiles[pos.y][pos.x] == "undefined") return null;
    return tiles[pos.y][pos.x];
}

function GenerateNeighbourTiles(pos=Vector.null, size=16, dist=1) {
    let newTiles = [];
    for (let i = -dist; i < dist + 1; i++) {
        for (let y = -dist; y < dist + 1; y++) {
            let apos = pos.added(Vector.as(i * size, y * size)).rounded;
            if (DoesTileExist(apos) || !apos.isDivisibleBy(size)) continue;
            let type = TypeOfTileAt(apos);
            tiles[apos.y] ??= {};
            tiles[apos.y][apos.x] = new Tile(apos, textures[type]);
            newTiles.push(apos.self);

            if (IsRareTile(apos, 0.05)) {
                GenerateStructureAt(apos);
            }
        }
    }
    if (newTiles.length > 0) console.log("New tiles generated");
    return newTiles;
}

function TryGeneratingAStructureAt(pos=Vector.null) {

}

function TypeOfTileAt(pos=Vector.null) {
    let tileTypes = ["ground", "undefined"];
    
    // Random seed a pozícióhoz (ha szeretnéd, hogy determinisztikus legyen)
    let seed = (pos.x * 374761393 + pos.y * 668265263) % 2147483647;
    let r = randomSeed.seedRandom(seed)(); // vagy csak sima random() ha nem kell determinisztikus
    
    let n = Math.floor(r * tileTypes.length);
    return tileTypes[n];
}

function RemoveAllTiles() {
    Object.keys(tiles).forEach(x => delete tiles[x]);
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
//#endregion

//#region Key mapping
//#region Movement
keys.bindkey("KeyW", () => {
    player.moveDirection.y += -1;
    player.lastDirPressed = Vector.up;
}, "down");

keys.bindkey("ArrowUp", () => {
    player.moveDirection.y += -1;
    player.lastDirPressed = Vector.up;
}, "down")

keys.bindkey("KeyS", () => {
    player.moveDirection.y += 1;
    player.lastDirPressed = Vector.down;
}, "down");

keys.bindkey("ArrowDown", () => {
    player.moveDirection.y += 1;
    player.lastDirPressed = Vector.down;
}, "down");

keys.bindkey("KeyA", () => {
    player.moveDirection.x += -1;
    player.lastDirPressed = Vector.left;
}, "down");

keys.bindkey("ArrowLeft", () => {
    player.moveDirection.x += -1;
    player.lastDirPressed = Vector.left;
}, "down");

keys.bindkey("KeyD", () => {
    player.moveDirection.x += 1;
    player.lastDirPressed = Vector.right;
}, "down");

keys.bindkey("ArrowRight", () => {
    player.moveDirection.x += 1;
    player.lastDirPressed = Vector.right;
}, "down");

keys.bindkey("ShiftLeft", () => {
    player.isRunning = true;
}, "down");

keys.bindkey("ShiftLeft", () => {
    player.isRunning = false;
}, "up");

keys.bindkey("ShiftRight", () => {
    player.isRunning = true;
}, "down");

keys.bindkey("ShitRight", () => {
    player.isRunning = false;
}, "up");

//#endregion
//#region UI
keys.bindkey("F12", ToggleScreenshot, "press");
keys.bindkey("KeyX", ToggleScreenshot, "press");
keys.bindkey("Escape", EscapeFunction, "press");
//#endregion
//#endregion

function LateLoad() {
    ToggleScreenshot();
    keys.lockAllKeys();
    LoadCanvas();

    Update();
}

let f11for = 0;
let f11peak = -1;

function Update() {
    if (keys.isKeyDown("AltLeft") && keys.isKeyDown("F4")) ToggleFullscreen(false);
    ReloadCanvas();

    player.automove();

    // textures["ground"].drawAt(Vector.null);

    DrawShownTiles();

    ctx.beginPath();
    ctx.arc(mpos.x, mpos.y, 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    player.draw();

    if (IsProllyInFullscreen() && !fullscreenMode) {
        f11for++;
        if (f11for > 2) {
            fullscreenImg.src = "./imgs/fullscreenF11.png";
            fullscreenButton.setAttribute("disabled", "");
            f11peak = f11for;
        }
    } else {
        if (f11for == f11peak) {
            console.log("-fsc");
            fullscreenImg.src = "./imgs/fullscreen.png";
            fullscreenButton.removeAttribute("disabled");
        }
        f11for = 0;
        f11peak = -1;
    }

    requestAnimationFrame(Update);
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

const fullscreenImg = document.querySelector("#fullscreen img");
const fullscreenButton = document.querySelector("#fullscreen");
/** Don't change it, it's only for getting infos */
let fullscreenMode = false;
function ToggleFullscreen(bool=69) {
    if ((document.fullscreenElement && bool != true)) {
        if (document.exitFullscreen) {
            fullscreenMode = false;
            document.exitFullscreen();
            fullscreenImg.src = "./imgs/fullscreen.png";
        }
        else console.error("Failed exit fullscreen mode: document.exitFullscreen does not exist");
    } else if (bool != false){
        if (document.documentElement.requestFullscreen) {
            fullscreenMode = true;
            document.documentElement.requestFullscreen();
            fullscreenImg.src = "./imgs/fullscreenClose.png";
        }
        else console.error("Failed to enter fullscreen mode: c.requestFullscreen does not exist");
    }
}

let screenshot = "";

function ToggleScreenshot() {
    const s = document.querySelector(".screenshotholder");
    const img = document.getElementById("screenshotImage");
    if (s.style.visibility == "hidden") {
        screenshot = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
        img.src = screenshot;
        s.style.visibility = "visible";
    }
    else s.style.visibility = "hidden";
}

function DownloadCanvasAsImage(download=null) {
    if (download == Infinity) {
        download = screenshot;
    }
    let link = document.createElement("a");
    link.setAttribute("download", "droggy_screenshot_" + Date.now() + ".png");
    link.setAttribute("href", download != null ? download : c.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
}

function EscapeFunction() {
    const sholder = document.querySelector(".screenshotholder");
    if (getComputedStyle(sholder).visibility == "visible") ToggleScreenshot();
}

function IsProllyInFullscreen() {
    return screen.height <= window.innerHeight;
}

/**
 * Spawns the given item at the given location
 * @param {Vector} pos in grid
 * @param {Item} item the item
 */
function SpawnItemAt(pos=Vector.null, item=Item.null, override=false) {
    let tile = TileAt(pos.multed(16).rounded);
    if (tile == null) {
        console.warn(`No tile in position '${pos}', thus adding an item to it failed`);
        return 1;
    }
    if (override) tile.setItem(item);
    else tile.addItem(item);
}