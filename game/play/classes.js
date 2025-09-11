class Player {
    constructor(pos=Vector.null, size=100) {
        this.pos = pos;
        this.size = size;
        this.color = "#fff";
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
        ctx.strokeStyle = this.color;
        ctx.rect(this.pos.x, this.pos.y, this.size, this.size);
        ctx.stroke();
    }
}

class ColliderRect {
    constructor(pos=Vector.null, width=0, height=0) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }
}