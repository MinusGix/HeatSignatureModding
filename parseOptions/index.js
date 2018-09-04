function parse (text) {
	let arr = text.match(/(?:^)(.+)(?:\ =\ )(.*?)(?:$)/gm);

	console.log(arr);

	let obj = {};

	arr.forEach(pair => {
		let key = pair.slice(0, pair.indexOf(' = '));
		let val = pair.slice(pair.indexOf(' = ') + 3);

		obj[key] = val;
	});

	return obj;
}

function parseBack (obj) {
	// Doesn't do .join('\n') as the \n in the map produces a little bit closer to the original.
	// (.join would apply it on the end of every line but the last, but the way the map works puts it on everyline
	// %appdate%/Heat_Signature/Options.txt seem to uses extra newline)
	return Object.keys(obj).map(key => `${key} = ${obj[key]}\n`).join('');
}

module.exports = {
	parse,
	parseBack
};