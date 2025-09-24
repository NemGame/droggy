class Player {
    constructor(pos=Vector.null, size=100, speed=10, texture=Texture.null) {
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        this.texture = texture;
        this.color = "#fff";
        this.collider = new ColliderRect(this.pos, this.size, this.size);
        this.moveDirection = Vector.null;
        this.canWalkDiagonally = false;
        this.lastDirPressed = Vector.null;
        let screen = canvasSize.deved(2).rounded
        this.generationDistance = screen;
        this.renderDistance = screen.self;
        this.isRunning = false;
        this.runningMult = 1.7;
        this.hp = 100;
        this.baseHealthDecreaseRate = this.hp/60000;
        this.healthDecreaseRate = this.baseHealthDecreaseRate;
        this.autoHealthDecrease();
        this.effects = {};
        this.canRun = true;
        this.canEat = true;
        this.coins = 0;
        this.eaten = new Set();
    }
    updateReset() {
        this.healthDecreaseRate = this.baseHealthDecreaseRate;
    }
    updateEffects() {
        if (this.canEat) {
            let tiles = [];
            let dist = 1;
            let p = this.pos.placeInGrid(16).rounded.mult(16);
            for (let i = 0; i < dist + 1; i++) {
                for (let y = 0; y < dist + 1; y++) tiles.push(TileAt(Vector.as(p.x + i * 16, p.y + y * 16)));
            }
            tiles.forEach(below => {
                if (below != null) below.use();
            });
        }
        this.updateReset();
        let sorted = Object.values(this.effects).sort((a, b) => a.priority - b.priority);
        sorted.forEach(x => x.func());
    }
    autoHealthDecrease() {
        this.hp -= this.healthDecreaseRate * deltaTime;
        if (this.hp > 100) this.hp = 100;
        requestAnimationFrame(this.autoHealthDecrease.bind(this));
    }
    toggleRunning(bool=null) {
        if (bool == null) bool = !this.isRunning;
        if (!this.canRun || bool == false) this.isRunning = false;
        else this.isRunning = true;
    }
    automove() {
        if (this.moveDirection.isNull || this.lastDirPressed.isNull) {
            this.texture.state = 0;
            this.texture.id = 0;
        } else {
            let stuff;
            if (this.canWalkDiagonally) stuff = this.moveDirection.normalized.scale(this.speed);
            else stuff = this.lastDirPressed.normalized.scale(this.speed);
            this.movev(stuff.scale(this.isRunning ? this.runningMult : 1));
            this.moveDirection = Vector.null;
            this.lastDirPressed = Vector.null;
            this.texture.state = 1;
            this.texture.nextFrame();
            player.autoGenerateTiles();
        }
        return this;
    }
    move(x=0, y=0) {
        return this.movev(new Vector(x, y));
    }
    movev(v2=Vector.null) {
        this.pos.movev(v2);
        return this;
    }
    generateTiles(n=this.renderDistance) {
        GenerateNeighbourTiles(this.pos.placeInGrid(16).multed(16), 16, textures["ground"], n);
        return this;
    }
    autoGenerateTiles() {
        return this.generateTiles(this.generationDistance);
    }
    drawHP(smoothen=false) {
        let height = 10, width = 100;
        let pos = Vector.as(c.width + width - canvasSize.x * 16, c.height - height - canvasSize.y * 8).dev(canvasSize).rounded.add(0.5);
        ctx.rect(pos.x, pos.y, width, height);
        ctx.stroke();
        let w = this.hp > 0 ? this.hp / 100 * width - 1 : 0;
        if (smoothen) w = int(w);
        ctx.fillRect(pos.x + 0.5, pos.y + 0.5, w, height - 1);
    }
    draw() {
        ctx.strokeStyle = this.color;
        let p = this.pos.rounded;
        // ctx.rect(p.x, p.y, this.size, this.size);
        this.texture.drawCurrentAt(p.subbed(cameraPos).add(cameraOffset).rounded, true);
        ctx.stroke();
        this.drawHP(false);
    }
    jumpToTile(tile=Vector.null) {
        this.pos.setv(tile.multed(16));
    }
}

class ColliderRect {
    constructor(pos=Vector.null, width=0, height=0) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }
    static get null() {
        return new ColliderRect(Vector.null, 0, 0);
    }
    isCollidingRect(rect=ColliderRect.null) {
        return this.pos.x < rect.pos.x + rect.width && this.pos.x + this.width > rect.pos.x &&
            this.pos.y < rect.pos.y + rect.height && this.pos.y + this.height > rect.pos.y;
    }
    isCollidingAtPoint(point=Vector.null) {
        return this.pos.x < point.x && this.pos.x + this.width > point.x &&
            this.pos.y < point.y && this.pos.y + this.height > point.y;
    }
}

class Texture {
    constructor(source="undefined", overlayOnDraw = [], animations = [], doSlice=true) {
        this.source = source;
        this.overlayOnDraw = typeof overlayOnDraw == "object" ? overlayOnDraw : [overlayOnDraw];
        this.overlayOnDrawTextures = [];
        this.animations = animations;
        this.state = 0;
        this.id = 0;
        this.pics = [];
        if (doSlice) this.slice();
    }
    static isCanvasEmpty(canvas) {
        const ctx = canvas.getContext("2d");
        const {width, height} = canvas;
        return ctx.getImageData(0, 0, width, height).data.every(x => x === 0);
    }
    static get null() {
        return new Texture();
    }
    get self() {
        let t = new Texture(this.source, [...this.overlayOnDraw], [...this.animations], false);
        t.overlayOnDrawTextures = [...this.overlayOnDrawTextures];
        t.state = this.state;
        t.id = this.id;
        t.pics = [...this.pics];
        return t;
    }
    get current() {
        this.correct();
        let s = this.pics[this.state];
        if (!s) return;
        return s[this.id];
    }
    init() {
        this.loadOverlays();
    }
    /** You can set it */
    onslicedone() {}
    loadOverlays() {
        this.overlayOnDrawTextures = this.overlayOnDraw.map(x => textures[x]);
    }
    correct() {
        if (this.pics.length == 0) return this;
        if (this.state < 0) this.state = this.pics.length - 1;
        else if (this.state > this.pics.length - 1) this.state = 0;
        if (this.id < 0) this.id = this.pics[this.state].length - 1;
        else if (this.id > this.pics[this.state].length - 1) this.id = 0;
        return this;
    }
    get(state=this.state, id=this.id) {
        return this.pics[state][id];
    }
    slice() {
        console.log("Slicing image: " + this.source);
        const size = 16;
        let img = new Image();
        img.src = "imgs/" + this.source;
        img.addEventListener("load", () => {
            console.log("Image loaded for slicing: " + this.source);
            const cols = Math.floor(img.width / (size - 1));
            this.pics = Array.from({ length: (cols) }).fill().map(x => []);
            const rows = Math.floor(img.height / (size - 1));
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const tileCanvas = document.createElement("canvas");
                    tileCanvas.width = size;
                    tileCanvas.height = size;
                    const ctx = tileCanvas.getContext("2d");
                    if (0) {
                        ctx.fillStyle = "gray";
                        ctx.fillRect(0, 0, size, size);
                    }

                    ctx.drawImage(
                        img,
                        x * size, y * size, size, size,
                        0, 0, size, size
                    );
                    if (Texture.isCanvasEmpty(tileCanvas)) break;
                    this.pics[y].push(tileCanvas);
                }
            }
            this.pics = this.pics.filter(x => x.length > 0 && typeof x !== "undefined");
            console.log(`Image sliced into ${this.pics.length} part${this.pics.length > 1 ? "s" : ""}: ${this.source}`);
            // this.onslicedone();
        });
    }
    drawAt(pos=Vector.null, state=0, id=0, isPlayer=false) {
        if (this.pics.length == 0) return;
        let pic = this.pics[state][id];
        // if (!pic) return console.error(`Pic not found: ${this.source} - ${state}/${id}`);
        if (!isPlayer) pos = pos.subbed(cameraPos).add(cameraOffset).rounded;
        ctx.drawImage(
            pic,
            pos.x, pos.y
        );
        ctx.stroke();
        this.overlayOnDrawTextures.forEach(texture => texture.drawCurrentAt(pos, isPlayer));
    }
    drawCurrentAt(pos=Vector.null, isPlayer=false) {
        this.drawAt(pos, this.state, this.id, isPlayer);
    }
    nextFrame() {
        this.id += 1;
        return this.correct();
    }
    addAllChildrenToBody() {
        this.pics.forEach(x => {
            x.forEach(y => {
                document.body.appendChild(y);
            })
            document.body.appendChild(document.createElement("br"));
        })
    }
}

class TextureAnimation {
    constructor(images=[], timesBefore=[], startIndex=0, autostart=false, runTimes=Infinity) {
        this.images = images;
        this.timesBefore = timesBefore;
        this.currentFrame = 0;
        this.animationCount = 0;
        this.isPlaying = autostart;
        this.runTimes = runTimes;
        this.currentFrame = images.length > startIndex ? images[startIndex] : 
                            (images.length > 0 ? images[0] : null);
        if (autostart) this.playAnimation(runTimes);
        this.animationID = 0;
    }
    static get null() {
        return new TextureAnimation();
    }
    playAnimation(times=1, animationID=this.animationID) {
        if (times < 1 || animationID != this.animationID) return;
        setTimeout(() => {
            if (animationID != this.animationID) return;
            console.log("ye - " + animationID);
            this.nextFrame();
        }, typeof this.timesBefore == "number" ? this.timesBefore : (this.timesBefore[this.animationCount] || 0));
        requestAnimationFrame(() => { this.playAnimation(times - 1, animationID); });
    }
    stopAnimation() {
        this.animationID++;
        this.animationCount = 0;
        this.currentFrame = 0;
        this.isPlaying = false;
        return this;
    }
    nextFrame() {
        let n = this.images.length;
        this.currentFrame++;
        if (this.currentFrame < 0) this.currentFrame = n - 1;
        else if (this.currentFrame > n - 1) this.currentFrame = 0;
        return this;
    }
}

class Tile {
    /**
     * 
     * @param {Vector} pos pos
     * @param {Texture} texture texture
     * @param {Item} item item
     */
    constructor(pos=Vector.null, texture=Texture.null, heldItem=null) {
        this.pos = pos;
        this.texture = texture;
        this.heldItem = heldItem;
    }
    static get null() {
        return new Tile();
    }
    get self() {
        let tile = new Tile(this.pos.self, texture.self);
        tile.heldItem = this.heldItem.self;
        return tile;
    }
    draw() {
        this.texture.drawAt(this.pos);
        if (this.heldItem != null) this.heldItem.draw(this.pos);
    }
    addItem(item=Item.null) {
        if (this.heldItem != null) return this;
        this.heldItem = item;
        return this;
    }
    setItem(item=Item.null) {
        this.heldItem = item;
        return this;
    }
    removeItem() {
        this.heldItem = null;
        return this;
    }
    use() {
        if (this.heldItem != null) {
            this.heldItem.eat();
            this.heldItem = null;
        }
    }
}

class Item {
    constructor(name="item", texture=Texture.null, isEdible=true, effect=() => {}, aftereffect=() => {}, effectDuratation=Infinity, effectDelay=0, effectPriority=0) {
        this.name = name;
        this.texture = texture;
        this.isEdible = isEdible;
        this.effect = effect;
        this.aftereffect = aftereffect;
        this.effectDuratation = effectDuratation;
        this.effectDelay = effectDelay;
        this.effectPriority = effectPriority;
        this.effectID = 0;
    }
    get self() {
        let item = new Item(this.name, this.texture.self, this.isEdible, this.effect, this.effectDuratation);
        item.effectID = this.effectID;
        return item;
    }
    eat() {
        if (!this.isEdible) return;
        console.log("Food ate: " + this.name);
        this.startTimer();
        return this;
    }
    startTimer() {
        this.effectID++;
        let id = NextInLine(Object.keys(player.effects));
        setTimeout(() => {
            player.effects[id] = new Effect(this.name, this.effectPriority, this.effect);
            player.eaten.add(this.name);
            console.log(`${this.name} added with id ${id}`);
        }, this.effectDelay);
        if (this.effectDuratation != Infinity) {
            setTimeout(() => {
                delete player.effects[id];
                this.aftereffect();
            }, this.effectDelay + this.effectDuratation);
        }
    }
    timer(id=this.effectID) {
        if (id != this.effectID) return;

        this.effect();

        requestAnimationFrame(() => { this.timer(id); });
    }
    stopTimer() {
        this.effectID++;
    }
    draw(pos=Vector.null) {
        this.texture.drawAt(pos);
        return this;
    }
}

class TilePos {
    constructor(tile=Tile.null, pos=Vector.null) {
        this.tile = tile;
        this.pos = pos;
    }
    static get null() {
        return new TilePos();
    }
    get self() {
        return new TilePos(this.tile.self, this.pos.self);
    }
}

class Structure {
    /**
     * @param {String} name name
     * @param {TilePos[]} tiles tiles
     * @param {Boolean} afterGeneration if it has structures
     */
    constructor(name="Structure", tiles=[], rarity=0.05, afterGeneration=false) {
        this.name = name;
        this.tiles = tiles;
        this.rarity = rarity;
        this.afterGeneration = afterGeneration;
        this.id = 2;
    }
    static get null() {
        return new Structure();
    }
    canSpawnAt(pos=Vector.null) {
        let seed = (pos.x * 1234567 + pos.y * (randomth(this.id) * (9e8 - 1e8) + 1e8)) % 2147483647;
        let r = randomSeed.seedRandom(seed)();
        return r < this.rarity;
    }
    generateAt(pos=Vector.null) {
        this.tiles.forEach(tile => {
            let p = tile.pos.added(pos);
            tiles[p.y] ??= {};
            tiles[p.y][p.x] = new Tile(p, tile.texture, tile.heldItem);
        })
    }
}

class Effect {
    constructor(name="", priority=0, func=()=>{}) {
        this.name = name;
        this.priority = priority;
        this.func = func;
    }
}

function NextInLine(array) {
    array = [...array].sort((a, b) => a - b);
    let prev = -1;
    for (let x of array) {
        if (x - prev != 1) return prev + 1;
        prev = x;
    }
    return array.length;
}