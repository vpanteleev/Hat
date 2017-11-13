const express = require('express');
const fileUpload = require('express-fileupload');
const _ = require('lodash');

const {
	getBinaryImage,
	getLabledImage,
	drawLabledImage,
	getObjects,
	getObjectsParameters,
	drawClassifyedImage,
} = require('./imageProcessor');


const { generateNeuralNetwork, normalizeObjectsParameters } = require('./neuralNetwork');

const neuralNetwork = generateNeuralNetwork();
const app = express();

app.use(fileUpload({
	limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/upload', async (req, res) => {
	const { binaryImage, width, height } = await getBinaryImage(req.files.file.data);

	console.log('Image is binarized');

	const labledImage = getLabledImage(binaryImage, width, height);

	console.log('Image is labled');

	await drawLabledImage(req.files.file.data, labledImage);

	console.log('Labled image is drawed');

	const objects = getObjects(labledImage);

	console.log('Objects are founded');

	const objectsParameters = getObjectsParameters(objects);

	console.log('Objects parameters are calculated');

	const objectWithNormalizedParameters = normalizeObjectsParameters(objectsParameters);

	console.log('Objects parameters are normalized');

	const classifyedData = _.mapValues(objectWithNormalizedParameters, ({ normalizedData }) => {
		const [erythrocyte, leukocyte] = neuralNetwork.activate(normalizedData);

		let type;
		if (erythrocyte > 0.5 || erythrocyte > leukocyte) {
			type = 'erythrocyte';
		} else if (leukocyte > 0.5) {
			type = 'leukocyte';
		}

		return { type };
	});

	console.log('Objects parameters are classyfied');

	console.log(classifyedData);

	await drawClassifyedImage(req.files.file.data, labledImage, classifyedData);

	console.log('Classyfied image is drawed');

	res.send('Uspeshno');
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => {
	console.log('Example app listening on port 3000!');
});
