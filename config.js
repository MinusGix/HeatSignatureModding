const fs = require('fs');
const prompt = require('prompt');

let configFile = "./config.json";
let config = {};

function readConfig (callback=(() => null)) {
	createConfig(() => fs.readFile(configFile, (err, data) => {
		if (err) {
			throw err;
		}

		for (let i in temp_config) {
			config[i] = temp_config[i]; // Copy the parameters, This makes so the module.export's is always up to date
		}
	
		console.log("Read Config");

		callback();
	}));
}

// Creates the config if it doesn't exist
function createConfig (callback) {
	fs.access(configFile, fs.constants.F_OK, (err) => {
		if (err) { // doesn't exist
			writeConfig(callback);
		} else {
			callback();
		}
	});
}

function writeConfig (callback=(() => null)) {
	fs.writeFile(configFile, JSON.stringify(config, null, 4), "utf8", err => {
		if (err) {
			throw err;
		}

		console.log("Saved Config");
		
		callback();
	})
}

function findGameDirectory () {
	let possibleGameDirectories = [
		"C:\\Program Files (x86)\\Steam\\steamapps\\common\\Heat Signature\\",
		"C:\\Program Files\\Steam\\steamapps\\common\\Heat Signature\\",
	];

	let dir;

	for (let i = 0; i < possibleGameDirectories.length; i++) {
		if (fs.existsSync(possibleGameDirectories[i])) {
			dir = possibleGameDirectories[i];
			break;
		}
	}

	askCorrectnessOfGameDirectory(dir);
}

function askCorrectnessOfGameDirectory (dir) {
	if (dir) {
		console.log("Found a game directory, is this the right one? (Y/n)");
		prompt.get({
			type: 'string',
			default: 'y',
			pattern: /^(y|yes|true|n|no|false)$/i
		}, (err, result) => {
			let answer = result.question;

			if (/^(y|yes|true)$/i.test(answer)) {
				console.log("Thank you. If this is incorrect you can change it later by running this program and selecting the correct option.");
				config.gameDirectory = dir;
			} else if (/^(n|no|false)$/i.test(answer)) {
				console.log("Okay!");
				askGameDirectory();
			}
		})
	} else {
		askGameDirectory();
	}
}

function askGameDirectory () {
	console.log("Please enter the game directory for Heat Signature:");

	prompt.get(["directory"], (err, result) => {
		let dir = result.directory;
		
		if (!dir) {
			console.log("You gave me no directory, how rude :(");
			return;
		}

		config.gameDirectory = dir;
		console.log("Set game directory to:", config.gameDirectory, "\nIf this was incorrect, then just acess the mnu from the program.");
		writeConfig();
	});
}

module.exports = {
	config,
	readConfig,
	writeConfig,
	findGameDirectory,
	askGameDirectory,
	askCorrectnessOfGameDirectory	
};