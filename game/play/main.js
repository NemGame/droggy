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

let deltaTime = 0;
let lastTime = Date.now();

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
    "apple": new Texture("aple.png"),
    "shop": new Texture("shop_ig.png"),
    "brokkoli": new Texture("brocli.png"),
    "coin": new Texture("coinscuff.png"),
    "brick": new Texture("brick.png"),
    "shoe": new Texture("shoe_itsperfectXD.png"),
    "pear": new Texture("pear.png"),
    "slot": new Texture("invpiece_plsdupeit.png"),
    "backpack": new Texture("lowbuget_bagpackXD.png"),
    "sign": new Texture("npc_ig.png")
};
Object.values(textures).forEach(x => x.init());
const player = new Player(canvasSize.deved(2).floor.mult(16), 16, 1, textures["fella_animation_test.png"]);
const items = {
    "undefined": Item.null,
    "brokkoli": new Item("Brokkoli", textures["brokkoli"], true, () => { player.healthDecreaseRate = 0.05; }, ()=>{}, 5000, 0),
    "apple": new Item("Apple", textures["apple"], true, () => { player.healthDecreaseRate = -10; }, ()=>{}, 5000, 0, 1),
    "coin": new Item("Coin", textures["coin"], true, () => {}, ()=>{ player.coins++; }, 0, 0, 0),
    "brick": new Item("Brick", textures["brick"], true, () => { player.canEat = false; }, ()=>{ player.canEat = true; }, 5000, 0, 0),
    "shoe": new Item("Shoe", textures["shoe"], true, () => { player.canRun = false; }, ()=>{ player.canRun = true; }, 5000, 0, 0),
    "pear": new Item("Pear", textures["pear"], true, () => { player.healthDecreaseRate = -0.1; }, ()=>{}, 5000, 1000, 1),
    "backpack": new Item("Backpack", textures["backpack"], true, () => {}, ()=>{ player.hasBackpack = true; }, 0, 0, 0),
    "sign": new Item("Sign", textures["sign"], true, () => { player.isBlurred = true; }, ()=>{ player.isBlurred = false; }, 3000, 0, 0),
};
const rareTiles = {
    "undefined": Structure.null,
    "brokkoli": new Structure("Brokkoli", [
        new Tile(Vector.null, textures["ground"], items["brokkoli"])
    ], 0.005, false),
    "apple": new Structure("Brokkoli", [
        new Tile(Vector.null, textures["ground"], items["apple"])
    ], 0.0025, false),
    "coin": new Structure("Coin", [
        new Tile(Vector.null, textures["shop"], items["coin"])
    ], 0.00005, false),
    "brick": new Structure("Brick", [
        new Tile(Vector.null, textures["ground"], items["brick"])
    ], 0.001, false),
    "pear": new Structure("Pear", [
        new Tile(Vector.null, textures["ground"], items["pear"])
    ], 0.0025, false),
    "shoe": new Structure("Shoe", [
        new Tile(Vector.null, textures["ground"], items["shoe"])
    ], 0.001, false),
    "backpack": new Structure("Backpack", [
        new Tile(Vector.null, textures["ground"], items["backpack"])
    ], 0.0001, false),
    "sign": new Structure("Sign", [
        new Tile(Vector.null, textures["ground"], items["sign"])
    ], 0.0001, false),
}
Object.values(rareTiles).forEach((x, i) => x.id = i);
let tiles = {};
player.autoGenerateTiles();

let cameraPos = player.pos;
let cameraOffset = canvasSize.deved(2).mult(16);

//#region Tile logic
function DoesTileExist(pos=Vector.null) {
    if (typeof tiles[pos.y] == "undefined") return false;
    if (typeof tiles[pos.y][pos.x] == "undefined") return false;
    return true;
}

/**
 * @param {Vector} pos position x16
 * @returns {Tile} Vector
 */
function TileAt(pos=Vector.null) {
    if (typeof tiles[pos.y] == "undefined") return null;
    if (typeof tiles[pos.y][pos.x] == "undefined") return null;
    return tiles[pos.y][pos.x];
}

function GenerateNeighbourTiles(pos=Vector.null, size=16, texture=Texture.null, dist=Vector.null) {
    let newTiles = [];
    for (let i = -dist.x; i < dist.x + 1; i++) {
        for (let y = -dist.y; y < dist.y + 1; y++) {
            let apos = pos.added(Vector.as(i * size, y * size)).rounded;
            if (DoesTileExist(apos) || !apos.isDivisibleBy(size)) continue;
            let type = TypeOfTileAt(apos);
            tiles[apos.y] ??= {};
            tiles[apos.y][apos.x] = new Tile(apos, textures[type]);
            newTiles.push(apos.self);

            let values = Object.values(rareTiles);
            for (let tile of values) {
                if (tile.canSpawnAt(apos)) {
                    tile.generateAt(apos);
                    console.log(`${tile.name} generated at ${apos}`)
                }
            }
        }
    }
    if (newTiles.length > 0) console.log("New tiles generated");
    return newTiles;
}

function TypeOfTileAt(pos=Vector.null) {
    let tileTypes = ["ground"];
    
    // Random seed a pozícióhoz (ha szeretnéd, hogy determinisztikus legyen)
    let seed = (pos.x * 374761393 + pos.y * (randomf() * (9e8 - 1e8) + 1e8)) % 2147483647;
    let r = randomSeed.seedRandom(seed)(); // vagy csak sima random() ha nem kell determinisztikus
    
    let n = Math.floor(r * tileTypes.length);
    return tileTypes[n];
}

function RemoveAllTiles() {
    Object.keys(tiles).forEach(x => delete tiles[x]);
}

function DrawShownTiles() {
    // let pos = player.pos.placeInGrid(16).mult(16);
    let pos = cameraPos.placeInGrid(16).mult(16);
    ctx.rect(pos.x - player.renderDistance.x * 16 - cameraPos.x + cameraOffset.x, pos.y - player.renderDistance.y * 16 - cameraPos.y + cameraOffset.y, 
            (player.renderDistance.x + 0.5) * 32, (player.renderDistance.y + 0.5) * 32);
    for (let i = -player.renderDistance.y; i < player.renderDistance.y + 1; i++) {
        for (let y = -player.renderDistance.x; y < player.renderDistance.x + 1; y++) {
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
    player.toggleRunning(true);
}, "down");

keys.bindkey("ShiftLeft", () => {
    player.toggleRunning(false);
}, "up");

keys.bindkey("ShiftRight", () => {
    player.toggleRunning(true);
}, "down");

keys.bindkey("ShitRight", () => {
    player.toggleRunning(false);
}, "up");

//#endregion
//#region UI
keys.bindkey("F12", ToggleScreenshot, "press");
keys.bindkey("KeyX", ToggleScreenshot, "press");
keys.bindkey("Escape", EscapeFunction, "press");
//#endregion
//#endregion

function LateLoad() {
    let rn = Date.now();
    deltaTime = rn - lastTime;
    lastTime = rn;
    ToggleScreenshot();
    Death();
    keys.lockAllKeys();
    LoadCanvas();

    SpawnItemAt(Vector.null, items["brokkoli"])

    Update();
}

let f11for = 0;
let f11peak = -1;

function Update() {
    if (keys.isKeyDown("AltLeft") && keys.isKeyDown("F4")) ToggleFullscreen(false);
    ReloadCanvas();

    if (player.isalive) {
        player.automove();
        player.updateEffects();
    }

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
    link.setAttribute("download", "screenshot_" + Date.now() + ".png");
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

function RegenerateMapWithRandomSeed() {
    randomSeed.reloadRandomWithSeed(Math.random() * Date.now());
    RemoveAllTiles();
    player.generateTiles();
}

function Zoom(n=1) {
    canvasSize.mult(n);
    cameraOffset.mult(n);
}

function Death() {
    const holder = document.querySelector(".deathHolder");
    if (holder.style.visibility == "hidden") {
        document.getElementById("deathCount").textContent = player.totalStuffEaten;
        holder.style.visibility = "visible";
    } else {
        holder.style.visibility = "hidden";
    }
}

function Respawn() {
    RegenerateMapWithRandomSeed();
    Death();
    player.reset();
}