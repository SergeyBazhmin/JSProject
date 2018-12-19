const express = require('express');
const w2v = require('word2vector');
const utils = require('./utils');
const bodyParser = require('body-parser');
const http = require('http');

const port = 5000;
const modelFile = './data/GoogleNews-vectors-negative300.bin';

console.log('Loading Model');
w2v.load(modelFile);
console.log('Loaded Model');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req, res) => {
  res.send('SERVER IS RUNNING!');
});

app.get('/most-similar-to-word/:word-:N', (req, res) => {
	const query = req.params['word'];
	console.log(`POST: ~most-similar-to-word~/ query = ${query}`);
	res.json(w2v.getSimilarWords(query, {N: req.params['N']}));
});
//move functions to separate file
app.post('/predict-category', (req, res) =>{
	const query = req.body['query'];
	console.log(`POST: ~predict-category~/ query = ${query}`);

	const cleanedQuery = utils.preprocess(query);
	//console.log(`preprocess: SUCCESS`);

	const queryVectors = w2v.getVectors(cleanedQuery).filter(x => x.length !== 0).map(x => x['vector']);
	//console.log(`query vectors: SUCCESS`);

	if (queryVectors.length === 0) res.json([]);

	const reducer = (accumulator, curVal) => w2v.add(accumulator, curVal);
	const sentenceVector = queryVectors.reduce(reducer).map(x => x / queryVectors.length);
	//console.log(`sentenceVector: SUCCESS`);

	const categories = req.body['categories'];
	const categoryProbabilities = utils.softmax(categories.map(x => w2v.similarity(sentenceVector, x)));
	//console.log(`categories vectors: SUCCESS`);

	const prediction = categories[utils.argmax(categoryProbabilities)];
	//console.log(`prediction: SUCCESS`);

	const suggestions = w2v.getNeighbors(sentenceVector, {N: 10});
	//console.log(`neighbour words: SUCCESS`);

	res.json({
		'prediction': prediction,
		'probabilities': categoryProbabilities,
		'suggestions': suggestions.slice(0, Math.min(10, suggestions.length))
	});
});

http.createServer(app).listen(port);