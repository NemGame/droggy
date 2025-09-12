class ImageManager {
    static getImage(path="") {
        return new ImageData(path, 0, 0);
    }
}

class ImageData {
    constructor(filepath="", imageID=0, imageState=0, gridSize=16) {
        this.filepath = filepath;
        this.imageID = imageID;
        this.imageState = imageState;
        this.gridSize = gridSize;
        this.file = null;
        this.pics = [];
        this.reload();
    }
    static loadImage(src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // ha CORS kell
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
        });
    }
    async reload() {
        this.file = await ImageData.loadImage(this.filepath);
        await this.reslice();
        return this;
    }
    async reslice() {
        let img = this.file;
        const gridS = this.gridSize;
        const tileW = img.width / gridS;
        const tileH = img.height / gridS;

        const grid = Array.from({ length: gridS }, () => Array.from({ length: gridS }).fill(null));
        const offscreen = document.createElement("canvas");
        offscreen.width = tileW;
        offscreen.height = tileH;
        const ctx = offscreen.getContext("2d");
        for (let r = 0; r < gridS; r++) {
            for (let c = 0; c < gridS; c++) {
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
                grid[r][c] = offscreen.toDataURL("image/png");
            }
        }
        this.pics = grid;
        return this;
    }
    getCurrent(state=this.imageState, id=this.imageID) {
        this.imageState = state;
        this.imageID = id;
        return this.pics[this.imageState][this.imageID];
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
}