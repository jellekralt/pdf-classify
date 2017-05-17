const Classify = require('./src/Classify');

let csfy = new Classify();
csfy.train();

setTimeout(() => {
    csfy.scan()
}, 50000);