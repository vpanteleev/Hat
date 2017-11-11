const express = require('express');
const fileUpload = require('express-fileupload');
const jimp = require('jimp');

const app = express();

app.use(fileUpload({
	limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/upload', async (req, res) => {
	const lenna = await jimp.read(req.files.file.data);

	lenna.resize(256, 256)
		.quality(60)
		.greyscale()
		.write('lena-small-bw.jpg');

	res.send('File uploaded!');
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(3000, () => {
	console.log('Example app listening on port 3000!');
});
