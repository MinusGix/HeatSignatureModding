// Keys of special Option names which have a specific type, by default they'd all be strings.
let special = {
	number: [
		"MusicVolume",
		"room_speed",
		"RealSeconds",
	],

	boolean: [
		"TipsEnabled",
		"ScreenshakeEnabled",
		"AutoZoomEnabled",
		"ExplosiveWarnings",
		"Permadeath",
		"Liberators",
		"LogToDisk",
		"ShadersEnabled",
		"EnableSharing",
		"WindowedMode",
		"FastVertexBufferMode",
		"AlternateSync", // slightly unsure
	],

	findKeyType (key) {
		if (!key) return null;

		return special.sectionHasKey('number', key) || 
			special.sectionHasKey('boolean', key);
	},

	sectionHasKey (section, key) {
		return special[section].includes(key) ? section : null;
	}
}
/*
	Unknown:
		ControlList = 0
		HighVisibility = 0
		CaptureCursor = 2
		PauseInBackground = 2
*/

function parse (text) {
	let arr = text.match(/(?:^)(.+)(?:\ =\ )(.*?)(?:$)/gm);

	console.log(arr);

	let obj = {};

	arr.forEach(pair => {
		let key = pair.slice(0, pair.indexOf(' = '));
		let val = pair.slice(pair.indexOf(' = ') + 3);

		let type = special.findKeyType(key);
		if (type === 'number') {
			val = Number(val);
		} else if (type === 'boolean') {
			if (val === '1' || val.toLowerCase() === 'true') {
				val = true;
			} else if (val === '0' || val.toLowerCase() === 'true') {
				val = false;
			} else {
				throw new Error(key + " was set to be of type: " + type + ", and for some reason it was not 0 or 1.");
			}
		}

		obj[key] = val;
	});

	return obj;
}// TODO: make so when it parses back, booleans become 0 / 1 (perhaps should store their initial value just in case of odd setups...)

function parseBack (obj) {
	// Doesn't do .join('\n') as the \n in the map produces a little bit closer to the original.
	// (.join would apply it on the end of every line but the last, but the way the map works puts it on everyline
	// %appdate%/Heat_Signature/Options.txt seem to uses extra newline)
	return Object.keys(obj).map(key => {
		let value = obj[key];
		let type = special.findKeyType(key);

		if (type === 'number') {} // Doesn't really need to be changed
		else if (type === 'boolean') {
			if (value === false) {
				value = 0;
			} else if (value === true) {
				value = 1;
			} else {
				throw new Error(key + " was set to be of type: " + type + ", and for some reason it was not false or true.");
			}
		}

		return `${key} = ${value}\n`;
	}).join('');
}

module.exports = {
	parse,
	parseBack
};