class randomSeed {
    static generateNewSeed() {
        return Number.parseInt(Math.random() * 1e3 * Date.now());
    }
    static seedRandom(seed=randomSeed.generateNewSeed()) {
        return randomSeed.sfc32(...randomSeed.cyrb128(seed));
    }
    static newRandom() {
        return this.seedRandom(Date.now());
    }
    static sfc32(a, b, c, d) {
        return function() {
            a |= 0; b |= 0; c |= 0; d |= 0;
            let t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }
    static cyrb128(str) {
        str = String(str);
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
    }
    static reloadRandomWithSeed(seed=0) {
        random = () => randomSeed.seedRandom(seed);
        randomf = () => randomSeed.seedRandom(seed)();
        randomth = (n=1) => {
            let rand = randomSeed.seedRandom(seed);
            for (let i = 0; i < n - 1; i++) rand();
            return rand();
        };
        randomb = (min=0, max=0) => { return random() * (max - min) + min; };
    }
}

let startingSeed = 69;
let random;
let randomf;
let randomth;
let randomb;
randomSeed.reloadRandomWithSeed(Math.random() * Date.now());
let int = (x) => Number.parseInt(x);