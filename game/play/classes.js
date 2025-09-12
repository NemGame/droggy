class Player {
    constructor(pos=Vector.null, size=100) {
        this.pos = pos;
        this.size = size;
        this.color = "#fff";
        this.collider = new ColliderRect(this.pos, this.size, this.size);
    }
    movenocare(x=0, y=0) {
        this.pos.move(x, y);
        return this;
    }
    movenocarev(v2=Vector.null) {
        this.pos.movev(v2);
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
        ctx.stroke();
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