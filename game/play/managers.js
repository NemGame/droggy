class SavedImageData {
    constructor(path="") {
        this.path = path;
        this.mainImage = null;
        this.mainImageLoaded = false;
        this.load();
    }
    load() {
        ReloadImage(this.path);
        this.attemptLoadingMainImage();
    }
    attemptLoadingMainImage() {
        if (this.path in mainImagesLoaded) {
            this.mainImageLoaded = true;
            this.mainImage = mainImagesLoaded[this.path];
            return true;
        }
        requestAnimationFrame(this.attemptLoadingMainImage.bind(this));
        return false;
    }
}