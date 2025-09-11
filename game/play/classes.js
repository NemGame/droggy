class Player {
    constructor(pos=Vector.null, size=100) {
        this.pos = pos;
        this.size = size;
    }
    move(x=0, y=0) {
        this.pos.move(x, y);
        return this;
    }
    movev(v2=Vector.null) {
        this.pos.movev(v2);
        return this;
    }
    draw() {
        ctx.rect(this.pos.x, this.pos.y, this.size, this.size);
        ctx.stroke();
    }
}