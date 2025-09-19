class Component {
    constructor() { }

    myMethod() {
        console.log("Doing stuff...");
        // Do stuff...
    }
}

class SelectBox extends Component {
    constructor() { super(); }
    /** Function for handling super() */
    init() { super.myMethod(); }
    myMethod() {
        super.myMethod();
        console.log("Chilling");
        // Do more stuff afterwards
    }
}

let mySelectBox1 = new SelectBox();
mySelectBox1.myMethod = function() {
    this.init();
    console.log("Doing more stuff");
    // Make dogs live longer by at least 20 years
    // And doing more stuff
};
mySelectBox1.myMethod();  // logs "Doing stuff..." and "Doing more stuff"

console.log("");  // Just so it's cleaner in the console

let mySelectBox2 = new SelectBox();
mySelectBox2.myMethod();  // logs "Doing stuff..." and "Chilling"