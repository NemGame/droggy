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
        this.generationDistance = 3;
        this.renderDistance = 5;
    }
    automove() {
        if (this.moveDirection.isNull || this.lastDirPressed.isNull) {
            this.texture.state = 0;
            this.texture.id = 0;
        } else {
            if (this.canWalkDiagonally) this.movev(this.moveDirection.normalized.scale(this.speed));
            else this.movev(this.lastDirPressed.normalized.scale(this.speed));
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
    draw() {
        ctx.strokeStyle = this.color;
        let p = this.pos.rounded;
        // ctx.rect(p.x, p.y, this.size, this.size);
        this.texture.drawCurrentAt(p);
        ctx.stroke();
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
    constructor(source="undefined", overlayOnDraw = [], animations = []) {
        this.source = source;
        this.overlayOnDraw = typeof overlayOnDraw == "object" ? overlayOnDraw : [overlayOnDraw];
        this.overlayOnDrawTextures = [];
        this.animations = animations;
        this.state = 0;
        this.id = 0;
        this.pics = [];
        this.slice();
    }
    static isCanvasEmpty(canvas) {
        const ctx = canvas.getContext("2d");
        const {width, height} = canvas;
        return ctx.getImageData(0, 0, width, height).data.every(x => x === 0);
    }
    static get null() {
        return new Texture();
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
            // this.onslicedone();
        });
    }
    drawAt(pos=Vector.null, state=0, id=0) {
        if (this.pics.length == 0) return;
        let pic = this.pics[state][id];
        // if (!pic) return console.error(`Pic not found: ${this.source} - ${state}/${id}`);
        ctx.drawImage(
            pic,
            pos.x, pos.y
        );
        ctx.stroke();
        this.overlayOnDrawTextures.forEach(texture => texture.drawCurrentAt(pos));
    }
    drawCurrentAt(pos=Vector.null) {
        this.drawAt(pos, this.state, this.id);
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
        }, typeof this.timesBefore == "number" ? this.timesBefore : this.timesBefore[this.animationCount] || 0);
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

    }
}

class Tile {
    constructor(pos=Vector.null, texture=Texture.null) {
        this.pos = pos;
        this.texture = texture;
    }
    static get null() {
        return new Tile();
    }
    draw() {
        this.texture.drawAt(this.pos);
    }
}