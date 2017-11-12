const express = require('express');
const fileUpload = require('express-fileupload');

const { getBinaryImage, getClosedAreas } = require('./imageProcessor');

const app = express();

app.use(fileUpload({
	limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/upload', async (req, res) => {
	const { binaryImage, width, height } = await getBinaryImage(req.files.file.data);

	const labledImage = getClosedAreas(binaryImage, width, height);

	let maxLabel = 0;
	labledImage.forEach((line) => {
		line.forEach((labelNumber) => {
			if (labelNumber > maxLabel) {
				maxLabel = labelNumber;
			}
		});
	});

	// await drawLabledImage(req.files.file.data, labledImage);

	console.log(maxLabel);

	res.send('Uspeshno');
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => {
	console.log('Example app listening on port 3000!');
});
