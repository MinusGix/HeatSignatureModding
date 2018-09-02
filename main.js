const fs = require('fs');
const prompt = require('prompt');
const path = require('path');

let parseControls = require('./parseControls/index.js').parseControls;
let parseDialogue = require('./parseDialogue/index.js');
let {config, readConfig, writeConfig} = require('./config.js');
readConfig();

let gameDirectory = config.gameDirectory;

function testControlsParse () {
	let file = fs.readFileSync(gameDirectory + "DefaultControls.txt", "utf8");

	fs.writeFileSync('./test/Controls.txt', parseControls(file).convertToText(), 'utf8');
	console.log("Wrote ./test/Controls.txt, generated from DefaultControls.txt");
}

function dialogueParse (readpath, output="./output/{filename}.json") {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".txt");

	output = output.replace(/\{filename\}/ig, filename);
	console.log('Filename:', filename, '\n\toutput:', output);
	fs.writeFileSync(output, JSON.stringify(parseDialogue.parse(file), null, 4), "utf8");
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function dialogueParseBack (readpath, output="./output/{filename}.txt") {
	let file = fs.readFileSync(readpath, 'utf8');

	let filename = path.win32.basename(readpath, ".json");

	output = output.replace(/\{filename\}/ig, filename);
	
	console.log("Filename:", filename, "\n\toutput:", output);

	fs.writeFileSync(output, parseDialogue.parseBack(JSON.parse(file)));
	console.log("Wrote " + filename + ", generated from Dialogue.json");
	return output;
}

prompt.start();

console.log(`(0) Exit
(1) - Test Controls Parse
(2) - Test Dialogue Parse
(3) - Test Dialogue Parse Back
(4) - Test Dialogue Parse & Parse Back`);

prompt.get({
	type: 'integer',
	message: "Input must be an integer",
	default: 2,
	required: true	
}, (err, result) => {
	let input = Number(result.question);

	switch (input) {
		case 0: process.exit(0); break;
		case 1: testControlsParse(); break;
		case 2: 
			getPath(value => dialogueParse(value));
		break;
		case 3: 
			getPath(value => dialogueParseBack(value));
		break;
		case 4:
			getPath(value => {
				let output = dialogueParse(value);

				let output2 = dialogueParseBack(output);
			});
		break;
	}
});

function getPath (cb) {
	prompt.get({
		type: 'string',
		message: 'Value must be a string',
		default: '',
		required: true
	}, (err, result) => {
		let value = result.question;

		if (!value) {
			return console.log("Must be given a value.")
		}

		cb(value.replace(/\{gamedir\}/ig, gameDirectory));
	});
}