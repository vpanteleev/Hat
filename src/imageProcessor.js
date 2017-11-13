const jimp = require('jimp');

function getMatrix(width, height) {
	const matrix = new Array(width);

	for (let i = 0; i < width; i += 1) {
		matrix[i] = new Array(height).fill(0);
	}

	return matrix;
}

function pushToEquivalentLabels(equivalentLabels, B, C) {
	if (equivalentLabels.length === 0) {
		equivalentLabels.push([B, C]);
	} else {
		let isPushed = false;
		for (let i = 0; i < equivalentLabels.length; i += 1) {
			if (equivalentLabels[i].includes(B)) {
				isPushed = true;
				equivalentLabels[i].push(C);
				break;
			} else if (equivalentLabels[i].includes(C)) {
				isPushed = true;
				equivalentLabels[i].push(B);
				break;
			}
		}

		if (!isPushed) {
			equivalentLabels.push([B, C]);
		}
	}
}

function mergeEquivalentLabels(labels, equivalentLabels) {
	labels.forEach((line, x) => {
		line.forEach((element, y) => {
			let newLabel;
			for (let i = 0; i < equivalentLabels.length; i += 1) {
				if (equivalentLabels[i].includes(element)) {
					newLabel = Math.max(...equivalentLabels[i]);
					break;
				}
			}

			labels[x][y] = newLabel;
		});
	});
}

async function getBinaryImage(imageBuffer) {
	const image = await jimp.read(imageBuffer);
	const { bitmap: { width, height } } = image;

	const binaryImage = getMatrix(width, height);

	image.grayscale()
		.scan(0, 0, width, height, (x, y, idx) => {
			// x, y is the position of this pixel on the image
			// idx is the position start position of this rgba tuple in the bitmap Buffer
			const red = image.bitmap.data[idx];
			const green = image.bitmap.data[idx + 1];
			const blue = image.bitmap.data[idx + 2];

			if (red + green + blue < 600) {
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

function getLabledImage(binaryImage, width, height) {
	let label = 0;

	const equivalentLabels = [];
	const labels = getMatrix(width, height);

	for (let x = 1; x < width; x += 1) {
		for (let y = 1; y < height; y += 1) {
			if (binaryImage[x][y]) {
				const B = labels[x - 1][y];
				const C = labels[x][y - 1];

				if (B === 0 || C === 0) {
					label += 1;
					labels[x][y] = label;
				} else if ((B === 0 && C !== 0) || (B !== 0 && C === 0)) {
					labels[x][y] = B || C;
				} else if (B !== 0 && C !== 0) {
					if (B === C) {
						labels[x][y] = B;
					} else {
						pushToEquivalentLabels(equivalentLabels, B, C);

						labels[x - 1][y] = C;
						labels[x][y] = B;
					}
				}
			}
		}
	}

	mergeEquivalentLabels(labels, equivalentLabels);

	return labels;
}


async function drawLabledImage(imageBuffer, labledImage) {
	const sourceImage = await jimp.read(imageBuffer);
	const image = sourceImage.clone();
	const { bitmap: { width, height } } = image;

	image.grayscale()
		.scan(0, 0, width, height, (x, y) => {
			if (labledImage[x][y]) {
				image.setPixelColor(labledImage[x][y] * 1000, x, y);
			}
		})
		.write('preprocessed/labled.jpg');
}

function getObjects(labledImage) {
	const objects = {};

	labledImage.forEach((line, x) => {
		line.forEach((labelNumber, y) => {
			if (labelNumber) {
				if (objects[labelNumber]) {
					objects[labelNumber].push({ x, y });
				} else {
					objects[labelNumber] = [{ x, y }];
				}
			}
		});
	});

	return objects;
}

module.exports = {
	getBinaryImage,
	getLabledImage,
	drawLabledImage,
	getObjects,
};
