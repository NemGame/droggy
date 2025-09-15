class Player {
    constructor(pos=Vector.null, size=100, speed=10, texture=Texture.null) {
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        this.texture = texture;
        this.color = "#fff";
        this.collider = new ColliderRect(this.pos, this.size, this.size);
        this.moveDirection = Vector.null;
    }
    reloadImage() {
        this.texture.reload();
        return this;
    }
    movenocare(x=0, y=0) {
        this.pos.move(x, y);
        return this;
    }
    movenocarev(v2=Vector.null) {
        this.pos.movev(v2);
        return this;
    }
    automove() {
        this.movev(this.moveDirection.normalized.scale(this.speed));
        this.moveDirection = Vector.null;
        return this;
    }
    move(x=0, y=0) {
        return this.movev(new Vector(x, y));
    }
    movev(v2=Vector.null) {
        this.pos.movev(v2);
        return this;
    }
    draw() {
        ctx.strokeStyle = this.color;
        let p = this.pos.rounded;
        ctx.rect(p.x, p.y, this.size, this.size);
        this.texture.drawCurrentAt(p);
        ctx.stroke();
    }
    imageIsNull() {
        console.log("Trying to load image", this.imagepath);
        if (this.imagepath in imagesLoaded) {
            this.img = imagesLoaded[this.imagepath];
            this.isImageLoaded = true;
            console.log("loaded image", this.imagepath);
            return true;
        }
        requestAnimationFrame(this.imageIsNull.bind(this));
        return false;
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
    constructor(source="undefined") {
        this.source = source;
        this.state = 0;
        this.id = 0;
        this.pics = [];
        this.slice();
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
    reload() {
        
    }
    correct() {
        if (this.pics.length == 0) return this;
        if (this.state < 0) this.state = 0;
        else if (this.state > this.pics.length - 1) this.state = this.pics.length - 1;
        if (this.id < 0) this.id = 0;
        else if (this.id > this.pics[this.state].length - 1) this.id = this.pics[this.state].length - 1;
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
            this.pics = Array.from({ length: (cols - 1) }).fill().map(x => []);
            const rows = Math.floor(img.height / (size - 1));
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const tileCanvas = document.createElement("canvas");
                    tileCanvas.width = size;
                    tileCanvas.height = size;
                    const ctx = tileCanvas.getContext("2d");
                    
                    ctx.drawImage(
                        img,
                        x * size, y * size, size - x, size - y,
                        0, 0, size, size
                    );
                    this.pics[y].push(tileCanvas);
                }
            }
        })
    }
    drawAt(index=0, pos=Vector.null) {
        if (this.pics.length == 0) return;
        let pic = this.pics[0][index];
        if (!pic) return console.error("Pic not found");
        ctx.drawImage(
            pic,
            pos.x, pos.y
        );
        ctx.stroke();
    }
    drawCurrentAt(pos=Vector.null) {
        let c = this.current;
        if (!c) return;
        ctx.drawImage(
            c,
            pos.x, pos.y
        );
    }
}