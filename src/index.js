const express = require('express');
const fileUpload = require('express-fileupload');

const {
	getBinaryImage, getLabledImage, drawLabledImage, getObjects,
} = require('./imageProcessor');

const Network = require('./neuralNetwork');

const app = express();

app.use(fileUpload({
	limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/upload', async (req, res) => {
	const { binaryImage, width, height } = await getBinaryImage(req.files.file.data);

	const labledImage = getLabledImage(binaryImage, width, height);

	const objects = getObjects(labledImage);

	console.log(objects);
	const neuralNetwork = new Network();

	console.log(neuralNetwork);
	await drawLabledImage(req.files.file.data, labledImage);

	res.send('Uspeshno');
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => {
	console.log('Example app listening on port 3000!');
});
