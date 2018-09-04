function parse (text) {
	return text.split(/(?:\r\n|\n\r|\n)/);
}

function parseBack (arr) {
	return arr.join('\n');
}

module.exports = {
	parse,
	parseBack
};