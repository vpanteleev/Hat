const { Layer, Trainer, Network } = require('synaptic');
const _ = require('lodash');

const trainingOptions = {
	rate: 0.1,
	iterations: 20000,
	error: 0.005,
};


const inputLayer = new Layer(3);
const hiddenLayer = new Layer(2);
const outputLayer = new Layer(2);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const trainingSet = [
	{
		input: [0.25, 0.22, 0.0988],
		output: [1, 0],
	},
	{
		input: [0.215, 0.2, 0.083],
		output: [1, 0],
	},
	{
		input: [0.113, 0.15, 0.031],
		output: [1, 0],
	},
	{
		input: [0.022, 0, 0.000988],
		output: [0, 0],
	},
	{
		input: [0, 0, 0],
		output: [0, 0],
	},
	{
		input: [0, 0.01052, 0.00069],
		output: [0, 0],
	},
	{
		input: [0.8977272, 0.968421, 0.90904],
		output: [0, 1],
	},
	{
		input: [1, 1, 1],
		output: [0, 1],
	},
	{
		input: [0.9772, 0.9894, 0.99300],
		output: [0, 1],
	},
];

function generateNeuralNetwork() {
	const network = new Network({
		input: inputLayer,
		hidden: [hiddenLayer],
		output: outputLayer,
	});

	const trainer = new Trainer(network);
	trainer.train(trainingSet, trainingOptions);

	return network;
}

function normalizeObjectsParameters(objects) {
	// object = {
	// 8708: { width: 1, height: 1, square: 2 },
// }
	const array = _.values(objects);

	const max = _.maxBy(array, 'square');

	const min = _.minBy(array, 'square');

	const minWidth = min.width;
	const minHeight = min.height;
	const minSquare = min.square;

	const deltaWidth = max.width - min.width;
	const deltaHeight = max.height - min.height;
	const deltaSquare = max.square - min.square;

	return _.mapValues(objects, ({ width, height, square }) => {
		const normalizedWidth = (width - minWidth) / deltaWidth;
		const normalizedHeight = (height - minHeight) / deltaHeight;
		const normalizedSquare = (square - minSquare) / deltaSquare;

		const normalizedData = [normalizedWidth, normalizedHeight, normalizedSquare];
		return { normalizedData };
	});
}


module.exports = { generateNeuralNetwork, normalizeObjectsParameters };
