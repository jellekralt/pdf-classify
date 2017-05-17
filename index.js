const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const natural = require('natural');
const textract = require('textract');

const trainFolder = './test/documents/'
const classifyFoler = './test/verify/'

const tokenizer = new natural.TreebankWordTokenizer();

let Classify = module.exports = class Classify {
    constructor() {
        this.classifier = new natural.BayesClassifier();
    }

    readFolder(folder) {
        return new Promise((resolve, reject) => {

            fs.readdir(folder, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });

        });
    }

    train() {
        return this.readFolder(trainFolder).then(files => {
            // Process all files
            return Promise.all(files.map((file) => {
                let type = /^\[([a-z]+)\][\s\S]+/g.exec(file)[1];

                return this.trainDoc(path.resolve(`./test/documents/${file}`), type)
            })).then(() => {
                this.classifier.train();
            });
        });
    }

    scan() {
        return this.readFolder(classifyFoler).then(files => {
            // Process all files
            return Promise.all(files.map((file) => {
                return this.classifyDoc(path.resolve(`./test/verify/${file}`))
            }));
        });
    }

    trainDoc(file, type) {
        return new Promise((resolve, reject) => {
            console.log(`Training doc ${file} as ${type}`);

            textract.fromFileWithPath(file, (err, text) => {
                if (err) {
                    reject(err);
                } else {
                    this.classifier.addDocument(tokenizer.tokenize(text), type);

                    resolve(text);
                }
            });
        });
    }

    classifyDoc(file) {
        return new Promise((resolve, reject) => {

            textract.fromFileWithPath(file, (err, text) => {
                if (err) {
                    reject(err);
                } else {
                    let result = this.classifier.getClassifications(text);
                
                    console.log(file);
                    console.log(this.classifier.classify(text));
                    console.log(result);
                    console.log('--------------------------------------------------');
                    
                    
                    
                    

                    resolve(result);
                }
            });

        });
    }


}

let csfy = new Classify();
csfy.train();

setTimeout(() => {
    csfy.scan()
}, 50000);