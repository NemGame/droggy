class Player {
    constructor(pos=Vector.null, size=100, speed=10, texture=Texture.null) {
        this.pos = pos;
        this.size = size;
        this.baseSpeed = speed;
        this.speed = this.baseSpeed;
        this.texture = texture;
        this.color = "#fff";
        this.collider = new ColliderRect(this.pos, this.size, this.size);
        this.moveDirection = Vector.null;
        this.canWalkDiagonally = false;
        this.lastDirPressed = Vector.null;
        let screen = canvasSize.deved(2).ceil.add(1)
        this.generationDistance = screen;
        this.renderDistance = screen.self;
        this.isRunning = false;
        this.baseRunningMult = 1.7;
        this.runningMult = this.baseRunningMult;
        this.hp = 100;
        this.baseHealthDecreaseRate = this.hp/30000;
        this.healthDecreaseRate = this.baseHealthDecreaseRate;
        this.autoHealthDecrease();
        this.effects = {};
        this.canRun = true;
        this.canEat = true;
        this.coins = 0;
        this.eaten = new Set();
        this.totalStuffEaten = 0;
        this.hasBackpack = false;
        this.slots = 9;
        this.slotSelected = 0;
        this.inventory = Array.from({ length: this.slots }).fill(null);
        this.isBlurred = false;
        this.isalive = true;
        this.effectsToCall = {};
    }
    reset() {
        this.hp = 100;
        this.inventory = Array.from({ length: this.slots }).fill(null);
        this.isBlurred = false;
        this.hasBackpack = false;
        this.totalStuffEaten = 0;
        Object.keys(this.effects).forEach(x => delete this.effects[x]);
        Object.keys(this.effectsToCall).forEach(x => delete this.effectsToCall[x]);
        this.canRun = true;
        this.canEat = true;
        this.coins = 0;
        this.eaten = new Set();
        this.isRunning = false;
        this.isalive = true;
    }
    updateReset() {
        this.healthDecreaseRate = this.baseHealthDecreaseRate;
        this.runningMult = this.baseRunningMult;
        this.speed = this.baseSpeed;
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
        let sorted = [];
        Object.values(this.effectsToCall).forEach(lst => sorted.push(...lst));
        sorted.forEach(x => x());
        Object.keys(this.effectsToCall).forEach(x => delete this.effectsToCall[x]);
        c.style.imageRendering = this.isBlurred ? "auto" : "pixelated";
        if (this.hp < 1) {
            Death();
            this.isalive = false;
        }
    }
    autoHealthDecrease() {
        if (!isStopped) {
            this.hp -= this.healthDecreaseRate * deltaTime;
            if (this.hp > 100) this.hp = 100;
        }
        requestAnimationFrame(this.autoHealthDecrease.bind(this));
    }
    toggleRunning(bool=null) {
        if (bool == null) bool = !this.isRunning;
        if (!this.canRun || bool == false) this.isRunning = false;
        else this.isRunning = true;
    }
    automove() {
        if (isStopped) return;
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
    scroll(n=0) {
        if (isStopped) return;
        let newValue = this.slotSelected + n;
        if (newValue < 0) newValue = this.slots - 1;
        if (newValue > this.slots - 1) newValue = 0;
        this.slotSelected = newValue;
        return this;
    }
    scrollTo(n=0) {
        if (isStopped) return;
        this.slotSelected = n;
        this.scroll();
    }
    useInSlot(n=this.slotSelected) {
        if (isStopped) return;
        if (this.inventory[n]) {
            this.inventory[n].eat(false, false);
            console.log("Used inventory item: " + this.inventory[n].name)
            this.inventory[n] = null;
        }
    }
    dropInSlot(n=this.slotSelected) {
        if (isStopped) return;
        if (this.inventory[n]) {
            this.inventory[n] = null;
        }
    }
    drawHotbar() {
        if (!this.hasBackpack) return;
        let pos = Vector.as(c.width / 2 - this.slots / 2 * 16, c.height - 24);
        this.inventory.forEach((x, i) => {
            let ipos = pos.added(Vector.x(i * 16)).int;
            textures["slot"].drawCurrentAt(ipos, true);
            if (x != null) x.draw(ipos, true);
            if (i == this.slotSelected) {
                ctx.beginPath();
                ctx.strokeStyle = "black";
                // ctx.rect(ipos.x, ipos.y, 16, 16);
                ctx.stroke();
            }
        });
        let lineWidth = 2, lW = lineWidth / 2;
        ctx.fillStyle = "#000000";
        ctx.fillRect(pos.add(Vector.x(this.slotSelected * 16)).x, pos.y - lW, 16, lineWidth); // top
        ctx.fillRect(pos.x, pos.y + 16 - lW, 16, lineWidth); // bottom
        ctx.fillRect(pos.x - lW, pos.y, lineWidth, 16); // left
        ctx.fillRect(pos.x + 16 - lW, pos.y, lineWidth, 16); // right
        ctx.strokeStyle = "white";
    }
    drawHP(smoothen=false) {
        let height = 10, width = 100;
        let pos = Vector.as(c.width + width - canvasSize.x * 16, c.height - height - canvasSize.y * 8).dev(canvasSize).rounded.add(0.5);
        ctx.rect(pos.x, pos.y, width, height);
        ctx.stroke();
        let w = this.hp > 0 ? this.hp / 100 * width - 1 : 0;
        if (smoothen) w = int(w);
        ctx.fillRect(pos.x + 0.5, pos.y + 0.5, w, height - 1);
        let textPos = Vector.as(pos.x + width - 37.5, pos.y + height / 1.2 - 2).rounded;
        ctx.fillStyle = "black";
        ctx.scale(1.6, 1.25);
        ctx.fillText(this.totalStuffEaten, textPos.x, textPos.y);
        ctx.scale(1/1.6, 1/1.25);
    }
    draw() {
        ctx.strokeStyle = this.color;
        let p = this.pos.rounded;
        // ctx.rect(p.x, p.y, this.size, this.size);
        this.texture.drawCurrentAt(p.subbed(cameraPos).add(cameraOffset).rounded, true);
        ctx.stroke();
        this.drawHP(!this.isBlurred);
        this.drawHotbar();
    }
    jumpToTile(tile=Vector.null) {
        this.pos.setv(tile.multed(16));
    }
    addToInventory(item=Item.null) {
        if (!this.hasBackpack) return 1;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] == null) {
                this.inventory[i] = item;
                return 0;
            }
        }
        return 1;
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
        if (!isPlayer) pos = pos.subbed(cameraPos).add(cameraOffset).floor;
        pos = pos.added(player.isBlurred ? 0.5 : 0)
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
        let tile = new Tile(this.pos.self, this.texture.self);
        tile.heldItem = this.heldItem?.self;
        return tile;
    }
    draw(isPlayer=false, item=true) {
        this.texture.drawAt(this.pos, undefined, undefined, isPlayer);
        if (this.heldItem != null && item) this.heldItem.draw(this.pos, isPlayer);
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
            this.heldItem.eat(false, true);
            console.log(`Ate ${this.heldItem.name} from the ground...`)
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
        this.inBackpack = false;
    }
    get self() {
        let item = new Item(this.name, this.texture.self, this.isEdible, this.effect, this.aftereffect, this.effectDuratation, this.effectDelay, this.effectPriority);
        item.effectID = this.effectID;
        return item;
    }
    eat(log=true, inv=true) {
        if (!this.isEdible) return;
        if (log) console.log("Food ate: " + this.name);
        if (player.hasBackpack && !this.inBackpack && inv) {
            let n = this.self;
            n.inBackpack = true;
            if (!player.addToInventory(n)) {
                return 0;
            }
        }
        this.startEffect();
        player.totalStuffEaten++;
        player.eaten.add(this.name);
        return this;
    }
    startEffect() {
        if (this.name in player.effects) player.effects[this.name].extendEffect(this.effectDuratation);
        else player.effects[this.name] = new Effect(this.name, this.effectDuratation, this.effectPriority, this.effect, this.aftereffect, this.effectDelay);
    }
    draw(pos=Vector.null, isPlayer=false) {
        this.texture.drawAt(pos, undefined, undefined, isPlayer);
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
        if (pos.distanceTo(Vector.null) <= 3 || player.pos.distanceTo(pos) <= 25) return false;
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
    constructor(name="", miliseconds=0, priority=0, func=()=>{}, aftereffect=()=>{}, delay=0) {
        this.name = name;
        this.miliseconds = miliseconds;
        this.priority = priority;
        this.func = func;
        this.aftereffect = aftereffect;
        this.delay = delay;
        this.startTime = Date.now();
        this.effectReference = player.effects;
        this.effectCallReference = player.effectsToCall;
        console.log(`Effect: ${name} added with duration: ${miliseconds} with delay: ${delay}`);
        this.callUpdate();
    }
    callUpdate() {
        requestAnimationFrame(this.update.bind(this));
        return this;
    }
    update() {
        if (!player.isalive) return;
        let timePassed = Date.now() - this.startTime - this.delay;
        if (timePassed < 0) {
            console.log("waitin'");
            return this.callUpdate();
        }
        if (timePassed >= this.miliseconds) {
            console.log(this);
            if (!(this.name in this.effectReference)) console.warn("Tried removing effect that was not there: " + this.name + " ; keys are: " + Object.keys(this.effectReference));
            else {
                this.aftereffect();
                console.log(`Effect: '${this.name}' removed, it was active for ${timePassed}ms ; target was: ${this.miliseconds}`)
                delete this.effectReference[this.name];
            }
            return;
        }
        else {
            this.effectCallReference[this.priority] ??= [];
            this.effectCallReference[this.priority].push(this.func);
        }
        this.callUpdate();
    }
    extendEffect(miliseconds) {
        console.log(`Effect '${this.name}' extended by ${miliseconds}ms ; ${this.miliseconds} -> ${this.miliseconds + miliseconds} ; Time left: ${(this.miliseconds + miliseconds) - (Date.now() - this.startTime)}`);
        this.miliseconds += miliseconds;
    }
}