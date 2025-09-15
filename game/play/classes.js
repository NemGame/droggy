class Player {
    constructor(pos=Vector.null, size=100, imagepath="", speed=10) {
        this.pos = pos;
        this.size = size;
        this.color = "#fff";
        this.collider = new ColliderRect(this.pos, this.size, this.size);
        this.imagepath = imagepath + ".png";
        this.img = null;
        this.isImageLoaded = false;
        this.imageIsNull();
        this.moveDirection = Vector.null;
        this.speed = speed;
    }
    reloadImage() {
        this.isImageLoaded = false;
        this.img = null;
        ReloadImage(this.imagepath);
        this.imageIsNull();
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
        ctx.rect(this.pos.x, this.pos.y, this.size, this.size);
        if (this.img != null) ctx.drawImage(this.img, this.pos.x, this.pos.y);
        else if (this.img == null && this.isImageLoaded) this.imageIsNull();
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
    slice() {
        console.log("Slicing image: " + this.source);
        const size = 15;
        let img = new Image();
        img.src = "imgs/" + this.source;
        img.addEventListener("load", () => {
            console.log("Image loaded for slicing: " + this.source);
            this.pics = [];
            const cols = Math.floor(img.width / size);
            const rows = Math.floor(img.height / size);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const tileCanvas = document.createElement("canvas");
                    tileCanvas.width = size;
                    tileCanvas.height = size;
                    const ctx = tileCanvas.getContext("2d");

                    ctx.drawImage(
                        img,
                        x * size, y * size, size, size,
                        0, 0, size, size
                    );
                    this.pics.push(tileCanvas);
                }
            }
        })
    }
    draw() {
        if (this.pics.length > 1) {
            ctx.drawImage(this.pics[1], 100, 100);
            ctx.stroke();
        }
    }
}