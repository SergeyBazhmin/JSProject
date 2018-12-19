const fs = require('fs');

const stopWords = new Set(fs.readFileSync('./data/stopwords.txt', 'utf8').split(/\r?\n/));
const removeStopWords = (text) => text.filter(x => !stopWords.has(x));
const cleanText = (text) => text.toLowerCase().replace("[^a-zA-Z]+", "");

exports.preprocess = (text) => removeStopWords(text.split(" ").map(x => cleanText(x)), );
exports.argmax = (arr) => arr.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
exports.softmax = (arr) => arr.map(value =>
    Math.exp(value) / arr.map(x => Math.exp(x)).reduce((a,b) => a+b));