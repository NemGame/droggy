class ImageManager {

}

class ImageData {
    constructor(filepath="", state=0, key=0) {
        this.filepath = filepath;
        this.state = state;
        this.key = key;
        this.img = new Image(filepath);
        this.reload();
    }
    reload() {

        return this;
    }
}