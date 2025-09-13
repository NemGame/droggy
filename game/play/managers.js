class ImageManager {
    static getImage(path="") {
        return new ImageData(path, 0, 0);
    }
}

class ImageDataW {
    constructor(filepath="", imageID=0, imageState=0, gridSize=16) {
        this.filepath = filepath;
        this.imageID = imageID;
        this.imageState = imageState;
        this.gridSize = gridSize;
        this.file = null;
        this.pics = [];
        this.reload().catch(x => {
            console.error(x);
        });
    }
    static loadImage(src="") {
        if (!imageNames.includes(src) && !imageNames.includes(src.split("/")[1])) src = "imgs/undefined.png";
        return new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => res(img);
            img.onerror = (ev) => {
            // több infó: network állapotot a DevTools-ban nézd
            rej(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }
    async reload(slice=true) {
        this.file = await ImageDataW.loadImage(this.filepath);
        if (slice) await this.reslice();
        return this;
    }
    async reslice() {
        let img = (await this.reload(false)).file;
        console.log(img)
        const gridS = this.gridSize;
        console.log(`width: ${img.width}\nheight: ${img.height}\ngridS: ${gridS}`);
        const tileW = img.width / gridS;
        const tileH = img.height / gridS;
        console.log(`tileW: ${tileW}\ntileH: ${tileH}`);

        const grid = Array.from({ length: gridS }, () => Array.from({ length: gridS }).fill(null));
        const offscreen = document.createElement("canvas");
        offscreen.width = tileW;
        offscreen.height = tileH;
        const ctx = offscreen.getContext("2d");
        for (let r = 0; r < tileH; r++) {
            for (let c = 0; c < tileW; c++) {
                ctx.clearRect(0, 0, tileW, tileH);
                ctx.drawImage(
                    img,
                    c * tileW,
                    r * tileH,
                    tileW,
                    tileH,
                    0,
                    0,
                    tileW,
                    tileH
                );
                grid[r][c] = ctx.getImageData(0, 0, tileW, tileH);
            }
        }
        this.pics = grid;
        return this;
    }
    getCurrent(state=this.imageState, id=this.imageID) {
        if (this.pics.length == 0) return null;
        this.imageState = state;
        this.imageID = id;
        return this.pics[state][id];
    }
    getWithScale(scale=0) {
        return this.pics[scale][this.imageID];
    }
    getWithID(id=0) {
        return this.pics[this.imageState][id];
    }
    getWithScaleAndID(scale=0, id=0) {
        return this.pics[scale][id];
    }
    drawAt(v2=Vector.null, ctx=new CanvasRenderingContext2D()) {
        const img = this.getCurrent();
        if (img == null) return this;
        ctx.putImageData(img, img.width, img.height);
        return this;
    }
}