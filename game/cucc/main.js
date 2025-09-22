class Video {
    constructor(evad=0, resz=0, url="ok.ru/videoembed/3282095114838?nochat=1") {
        this.evad = evad;
        this.resz = resz;
        this.url = url;
    }
    get dom() {
        let q = document.createElement("iframe");
        q.src = this.url;
        q.setAttribute("allowfullscreen", "");
        q.allow = "autoplay";
        q.frameborder = "0";
        return q;
    }
}

const videos = [
    new Video(1, 1, "//ok.ru/videoembed/3282095114838?nochat=1"),
    new Video(1, 2, "//ok.ru/videoembed/3282094787158?nochat=1"),
    new Video(1, 3, "//ok.ru/videoembed/3282094918230"),
    new Video(1, 4, "//ok.ru/videoembed/3282095245910"),
    new Video(1, 5, "//ok.ru/videoembed/3282095376982"),
    new Video(1, 6, "//ok.ru/videoembed/3282095442518"),
    new Video(1, 7, "//ok.ru/videoembed/3282095311446"),
    new Video(1, 8, "//ok.ru/videoembed/3282095180374"),
    new Video(1, 9, "//ok.ru/videoembed/3282095049302"),
    new Video(1, 10, "//ok.ru/videoembed/3282094852694"),
    new Video(1, 11, "//ok.ru/videoembed/3282096360022"),
    new Video(1, 12, "//ok.ru/videoembed/3282096228950"),
    new Video(1, 13, "//ok.ru/videoembed/3282096491094"),
    new Video(1, 14, "//ok.ru/videoembed/3282096294486"),
    new Video(1, 15, "//ok.ru/videoembed/3282096622166"),
    new Video(1, 16, "//ok.ru/videoembed/3282096425558"),
    new Video(1, 17, "//ok.ru/videoembed/3282096556630"),
    new Video(2, 1, "//ok.ru/videoembed/3282097146454"),
    new Video(2, 2, "//ok.ru/videoembed/3282097539670"),
    new Video(2, 3, "//ok.ru/videoembed/3282097343062"),
    new Video(2, 4, "//ok.ru/videoembed/3282097408598"),
    new Video(2, 5, "//ok.ru/videoembed/3282097736278"),
    new Video(2, 6, "//ok.ru/videoembed/3282097605206"),
    new Video(2, 7, "//ok.ru/videoembed/4459897293398"),
    new Video(2, 8, "//ok.ru/videoembed/4459897358934"),
    new Video(2, 9, "//ok.ru/videoembed/3282097277526"),
    new Video(2, 10, "//ok.ru/videoembed/3282097211990"),
    new Video(2, 11, "//ok.ru/videoembed/3282098260566"),
    new Video(2, 12, "//ok.ru/videoembed/3282098457174"),
    new Video(2, 13, "//ok.ru/videoembed/3282098391638"),
    new Video(2, 14, "//ok.ru/videoembed/3282098326102"),
    new Video(2, 15, "//ok.ru/videoembed/3282098522710"),
    new Video(2, 16, "//ok.ru/videoembed/3282098653782"),
    new Video(2, 17, "//ok.ru/videoembed/3282098588246"),
    new Video(2, 18, "//ok.ru/videoembed/3282098784854"),
    new Video(2, 19, "//ok.ru/videoembed/3282098719318")
]

let reszek = GetReszek();
let lastEvad = 1;

const evadok = Object.keys(reszek);

LoadEvadok();
LoadReszek();
OpenResz();

function GetReszek(array=videos) {
    let x = {};
    array.forEach(video => {
        if (!(video.evad in x)) x[video.evad] = {};
        x[video.evad][video.resz] = video;
    });
    return x;
}

function GetReszekInEvad(evad) {
    return Object.keys(reszek[evad]);
}

function LoadEvadok() {
    let select = document.getElementById("evad");
    evadok.forEach(evad => {
        let option = document.createElement("option");
        option.value = evad;
        option.text = evad;
        select.add(option);
    });
}

function LoadReszek(evad=1) {
    lastEvad = evad;
    let select = document.getElementById("resz");
    select.innerHTML = "";
    GetReszekInEvad(evad).forEach(resz => {
        let option = document.createElement("option");
        option.value = resz;
        option.text = resz;
        select.add(option);
    });
    OpenResz(Number(document.getElementById("resz").value), evad);
}

function OpenResz(resz=1, evad=lastEvad) {
    let video = reszek[evad][resz];
    let iframe = video.dom;
    document.querySelector(".vid").innerHTML = iframe.outerHTML;
}

function UpdateVidHeight() {
    let vid = document.querySelector(".vid iframe");
    vid.style.height = (Number.parseFloat(getComputedStyle(vid).width) / 1.7) + "px";
    requestAnimationFrame(UpdateVidHeight);
} UpdateVidHeight();

function NextResz() {
    let resz = document.getElementById("resz");
    let evad = document.getElementById("evad");
    if (Number(resz.value) < Number(Object.keys(reszek[evad.value]).pop())) resz.value = Number(resz.value) + 1;
    else {
        if (Number(evad.value) < Number(Object.keys(reszek).pop())) evad.value = Number(evad.value) + 1;
        else evad.value = 1;
        LoadReszek(Number(evad.value));
        resz.value = 1;
    }
    OpenResz(Number(resz.value), Number(evad.value));
}