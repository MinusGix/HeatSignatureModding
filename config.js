const fs = require('fs');

let configFile = "./config.json";
let config = {};

function readConfig () {
	let temp_config = JSON.parse(fs.readFileSync(configFile, "utf8"));

	for (let i in temp_config) {
		config[i] = temp_config[i]; // Copy the parameters, This makes so the module.export's is always up to date
	}

	console.log("Read Config");
}

function writeConfig () {
	fs.writeFileSync(configFile, JSON.stringify(config, null, 4), "utf8");
	console.log("Saved Config");
}

module.exports = {
	config,
	readConfig,
	writeConfig
};