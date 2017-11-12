const jimp = require('jimp');

async function getBinaryImage(imageBuffer) {
	const image = await jimp.read(imageBuffer);
	const { bitmap: { width, height } } = image;

	const binaryImage = new Array(width).fill(new Array(height));

	image.grayscale()
		.scan(0, 0, width, height, (x, y, idx) => {
			// x, y is the position of this pixel on the image
			// idx is the position start position of this rgba tuple in the bitmap Buffer
			const red = image.bitmap.data[idx];
			const green = image.bitmap.data[idx + 1];
			const blue = image.bitmap.data[idx + 2];

			if (red + green + blue < 400) {
				binaryImage[x][y] = true;

				image.bitmap.data[idx] = 255;
				image.bitmap.data[idx + 1] = 255;
				image.bitmap.data[idx + 2] = 255;
			} else {
				binaryImage[x][y] = false;

				image.bitmap.data[idx] = 0;
				image.bitmap.data[idx + 1] = 0;
				image.bitmap.data[idx + 2] = 0;
			}
		})
		.write('preprocessed/binary.jpg');

	return { binaryImage, height, width };
}

function fill(binaryImage, labels, x, y, label) {
	if ((!labels[x][y]) && (binaryImage[x][y] === true)) {
		labels[x][y] = label;
		if (x > 0) { fill(binaryImage, labels, x - 1, y, label); }
		if (binaryImage[x + 1].length > 0) { fill(binaryImage, labels, x + 1, y, label); }
		if (y > 0) { fill(binaryImage, labels, x, y - 1, label); }
		if (binaryImage[x][y + 1] !== undefined) { fill(binaryImage, labels, x, y + 1, label); }
	}
}

function getClosedAreas(binaryImage, width, height) {
	let label = 1;
	const labels = new Array(width).fill(new Array(height));

	for (let x = 0; x < width; x += 1) {
		for (let y = 0; y < height; y += 1) {
			fill(binaryImage, labels, x, y, label);
			label += 1;
		}
	}

	return labels;
}

// async function drawLabledImage(imageBuffer, labels) {
// 	const image = await jimp.read(imageBuffer);
//
// 	labels.forEach((line, x) => {
// 		line.forEach((labelNumber, y) => {
// 			if (labelNumber === 30) {
// 				console.log();
// 		});
// 	});
//
// 	image.write('preprocessed/labled.jpg');
// }

module.exports = {
	getBinaryImage,
	getClosedAreas,
	// drawLabledImage,
};
