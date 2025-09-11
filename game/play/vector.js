class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /** Hosszúság */
    get length() {
        return Math.hypot(this.x, this.y)
    }
    /** Írány megmarad, hosszúság -> 1 */
    get normalized() {
        let l = this.length;
        return l === 0 ? Vector.null : Vector.as(this.x / l, this.y / l);
    }
    /** this.copy() */
    get self() {
        return this.copy()
    }
    /** Vektor -> Radián */
    get radian() {
        return Math.atan2(this.y, this.x);
    }
    /** Vektor -> Fok */
    get fok() {
        return this.radian / Math.PI * 180;
    }
    /** Vektor relatívan lefelé */
    get down() {
        return Vector.as(this.x, this.y + 1);
    }
    /** Vektor relatívan felfelé */
    get up() {
        return Vector.as(this.x, this.y - 1);
    }
    /** Vektor relatívan balra */
    get left() {
        return Vector.as(this.x - 1, this.y);
    }
    /** Vektor relatívan jobbra */
    get right() {
        return Vector.as(this.x + 1, this.y - 1);
    }
    /** Ugyan az-e, mint a Vector.null */
    get isNull() {
        return this.isSameAs(Vector.null);
    }
    /** Irány előre */
    get dforward() {
        return this.radian;
    }
    /** Irány balra */
    get dleft() {
        let fok = this.fok - 90;
        return fok / 180 * Math.PI;
    }
    /** new Vector(0, 0) */
    static get null() {
        return new Vector(0, 0)
    }
    /** Basically .new() */
    static as(x=0, y=0) {
        return new Vector(x, y);
    }
    /** Négyzet grid */
    static grid(n=0) {
        return Vector.as(n, n);
    }
    /** JSON -> Vektor */
    static parseJSON(json="") {
        if (typeof json == "string") json = JSON.parse(json);
        return Vector.as(json["x"], json["y"]);
    }
    /** Fok -> Vektor 
     * @param {boolean} [ztz=false] fok == 0 => Vector.null
    */
    static parseFok(fok=0, ztz=false) {
        if (ztz && fok == 0) return Vector.null;
        let rad = (fok % 360) * (Math.PI / 180);
        return new Vector(Math.cos(rad), Math.sin(rad))
    }
    /** Radián -> Vektor 
     * @param {boolean} [ztz=false] rad == 0 => Vector.null
    */
    static parseRad(rad=0, ztz=false) {
        if (ztz && rad == 0) return Vector.null;
        return new Vector(Math.cos(rad), Math.sin(rad))
    }
    /** JSON -> Vektor */
    parseJSON(json) {
        return this.setv(Vector.parseJSON(json));
    }
    /** Fok -> Vektor */
    parseFok(fok=0) {
        return this.setv(Vector.parseFok(fok))
    }
    /** Radián -> Vektor */
    parseRad(rad=0) {
        return this.setv(Vector.parseRad(rad))
    }
    /** Értékek megfordítása */
    flip(x=true, y=true) {
        if (x) this.x = -this.x;
        if (y) this.y = -this.y;
        return this;
    }
    /** Méretezés */
    scale(n=1) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    /** Hasonlóság */
    similar(v2, threshold=0) {
        return this.distanceTo(v2) <= threshold;
    }
    /** Távolság */
    distanceTo(v2=Vector.null) {
        const dx = this.x - v2.x;
        const dy = this.y - v2.y;
        return Math.hypot(dx, dy);
    }
    /** Irány, alapból radián */
    directionTo(v2=Vector.null, rad=true) {
        let val = Math.atan2(v2.y - this.y, v2.x - this.x)
        return rad ? val : val / Math.PI * 180;
    }
    /** Vektor irány - fok */
    directionToLeft(fok=0) {
        return this.fok - fok;
    }
    /** Vektor irány + fok */
    directionToRight(fok=0) {
        return this.fok + fok;
    }
    /** Vektor == Vektor */
    isSameAs(v2=this.copy()) {
        return this.x == v2.x && this.y == v2.y;
    }
    /** Vissza ad egy új Vektor-t ennek az értékeivel */
    copy() {
        return new Vector(this.x, this.y)
    }
    /** Move Vector by values */
    move(x=0, y=0) {
        return this.add(Vector.as(x, y));
    }
    /** Move Vector by Vector */
    movev(v2) {
        return this.add(v2);
    }
    /** Rotate vector */
    rotate(val, rad=true) {
        if (!rad) val = (val % 360) * (Math.PI / 180);
        let cos = Math.cos(val), sin = Math.sin(val);
        return this.set(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
    /** Értékek beállítása */
    set(x=0, y=0) {
        this.x = x;
        this.y = y;
        return this;
    }
    /** Vektor = v2 */
    setv(v2=Vector.null) {
        this.x = v2.x;
        this.y = v2.y;
        return this;
    }
    /** Vektor irányba való elmozdulás */
    moveInDirection(v2) {
        this.moveTowards(v2.added(this.self));
    }
    /** Vektor irányába mozgás */
    moveTowards(v2, speed=5, enableTeleport=true) {
        if (enableTeleport && this.similar(v2, speed))
            return this.setv(v2);
        return this.setv(this.added(Vector.parseRad(this.directionTo(v2)).scale(speed)));
    }
    /** Rugós követés távolsággal */
    lockWithDistance(v2, speed=10, distance=5, min=NaN, max=NaN) {
        let spd = speed * Math.max(this.distanceTo(v2) * distance / 100, 0.5);
        if (min) spd = Math.max(spd, min);
        if (max) spd = Math.min(spd, max);
        return this.moveTowards(v2, spd);
    }
    /** Tartja a maximum távolságot */
    followWithDistance(v2, distance=5) {
        let dist = this.distanceTo(v2);
        if (dist <= distance) return this;
        return this.moveTowards(v2, dist - distance, false);
    }
    /** Összeadás */
    add(v2) {
        return this.setv(this.added(v2));
    }
    /** Összeadás értéke */
    added(v2) {
        return new Vector(this.x + v2.x, this.y + v2.y);
    }
    /** Kivonás */
    sub(v2) {
        return this.setv(this.subbed(v2))
    }
    /** Kivonás értéke */
    subbed(v2) {
        return new Vector(this.x - v2.x, this.y - v2.y);
    }
    /** Szorzás */
    mult(v2) {
        return this.setv(this.multed(v2))
    }
    /** Szorás értéke */
    multed(v2) {
        return new Vector(this.x * v2.x, this.y * v2.y);
    }
    /** Osztás */
    dev(v2) {
        return this.setv(this.deved(v2))
    }
    /** Osztás értéke */
    deved(v2) {
        return new Vector(this.x / v2.x, this.y / v2.y);
    }
    /** Vektor -> String */
    toString(split=";") {
        return `${this.x}${split}${this.y}`
    }
    /** Visualize vector */
    visualizev(pos=Vector.null) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.length, 0, Math.PI * 2);
        ctx.moveTo(pos.x, pos.y)
        let np = this.added(pos)
        ctx.lineTo(np.x, np.y);
    
        ctx.closePath();
        ctx.stroke();
    }
    /** Visualize vector with x, y */
    visualize(x, y) {
        this.visualizev(Vector.as(x, y));
    }
}