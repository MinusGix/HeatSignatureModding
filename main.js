const fs = require('fs');
const prompt = require('prompt');
const path = require('path');

let parseControls = require('./parseControls/index.js').parseControls;
let parseDialogue = require('./parseDialogue/index.js');
let parseNames = require('./parseNames/index.js');
let parseOptions = require('./parseOptions/index.js');
let parseDat = require('./parseDat/index.js');
let {
	config,
	readConfig,
	writeConfig,
	findGameDirectory,
	findDataDirectory,
} = require('./config.js');

function testControlsParse() {
	let file = fs.readFileSync(config.gameDirectory + "DefaultControls.txt", "utf8");

	fs.writeFileSync('./test/Controls.txt', parseControls(file).convertToText(), 'utf8');
	console.log("Wrote ./test/Controls.txt, generated from DefaultControls.txt");
}

function dialogueParse(readpath, output = "./output/{filename}.json") {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".txt");

	output = output.replace(/\{filename\}/ig, filename);
	console.log('Filename:', filename, '\n\toutput:', output);
	fs.writeFileSync(output, JSON.stringify(parseDialogue.parse(file), null, 4), "utf8");
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function dialogueParseBack(readpath, output = "./output/{filename}.txt") {
	let file = fs.readFileSync(readpath, 'utf8');

	let filename = path.win32.basename(readpath, ".json");

	output = output.replace(/\{filename\}/ig, filename);

	console.log("Filename:", filename, "\n\toutput:", output);

	fs.writeFileSync(output, parseDialogue.parseBack(JSON.parse(file)));
	console.log("Wrote " + filename + ", generated from Dialogue.json");
	return output;
}

function nameParse (readpath, output = "./output/{filename}.json") {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".txt");

	output = output.replace(/\{filename\}/ig, filename);
	console.log("Filename:", filename, "\n\toutput:", output);
	fs.writeFileSync(output, JSON.stringify(parseNames.parse(file), null, 4), "utf8");
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function nameParseBack(readpath, output = "./output/{filename}.txt") {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".json");

	output = output.replace(/\{filename\}/ig, filename);

	console.log("Filename:", filename, "\n\toutput:", output);

	fs.writeFileSync(output, parseNames.parseBack(JSON.parse(file)));
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function optionsParse (readpath, output = "./output/{filename}.json") {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".txt");

	output = output.replace(/\{filename\}/ig, filename);
	console.log("Filename:", filename, "\n\toutput:", output);
	fs.writeFileSync(output, JSON.stringify(parseOptions.parse(file), null, 4), "utf8");
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function optionsParseBack(readpath, output = "./output/{filename}.txt") {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".json");

	output = output.replace(/\{filename\}/ig, filename);

	console.log("Filename:", filename, "\n\toutput:", output);

	fs.writeFileSync(output, parseOptions.parseBack(JSON.parse(file)));
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function datParse (readpath, output = "./output/{filename}.json", encoded=true) {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".dat");

	output = output.replace(/\{filename\}/ig, filename);
	console.log("Filename:", filename, "\n\toutput:", output);
	fs.writeFileSync(output, JSON.stringify(parseDat.parse(file, encoded), null, 4), "utf8");
	console.log("Wrote " + filename + ", generated from " + readpath);
	return output;
}

function datParseBack(readpath, output = "./output/{filename}.dat", forceUnencoded) {
	let file = fs.readFileSync(readpath, "utf8");

	let filename = path.win32.basename(readpath, ".json");

	output = output.replace(/\{filename\}/ig, filename);

	console.log("Filename:", filename, "\n\toutput:", output);

	fs.writeFileSync(output, parseDat.parseBack(JSON.parse(file), forceUnencoded));

	console.log("Wrote " + filename + ", generated from " + readpath);
	
	return output;
}

prompt.start();

function showMainMenu() {
	console.log(`(0) Exit
(1) - Config Settings
(2) - Control Parsing
(3) - Dialogue Parsing
(4) - Name Parsing
(5) - Options Parsing
(6) - Dat Parsing`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				process.exit(0);
				break;
			case 1:
				showConfigureMenu();
			break;
			case 2:
				showControlsMenu();
			break;
			case 3:
				showDialogueMenu();
			break;
			case 4:
				showNameMenu();
			break;
			case 5:
				showOptionsMenu();
			break;
			case 6:
				showDatMenu();
			break;
		}
	});
}

function showControlsMenu () {
	console.log(`(0) Back
(1) - Test Controls Parse`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				showMainMenu();
			break;
			case 1:
				testControlsParse();
			break;
		}
	});
}

function showDialogueMenu () {
	console.log(`(0) Back
(1) - Test Dialogue Parse
(2) - Test Dialogue Parse Back
(3) - Test Dialogue Parse & Parse Back`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				showMainMenu();
			break;
			case 1:
				getPath(value => dialogueParse(value));
			break;
			case 2:
				getPath(value => dialogueParseBack(value));
			break;
			case 3:
				getPath(value => dialogueParseBack(dialogueParse(value)));
			break;
		}
	});
}

function showNameMenu () {
	console.log(`(0) Back
(1) - Test Name Parse
(2) - Test Name Parse Back
(3) - Test Name Parse & Parse Back`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				showMainMenu();
			break;
			case 1:
				getPath(value => nameParse(value));
			break;
			case 2:
				getPath(value => nameParseBack(value));
			break;
			case 3:
				getPath(value => nameParseBack(nameParse(value)));
			break;
		}
	});
}

function showOptionsMenu () {
	console.log(`(0) Back
(1) - Test Options Parse
(2) - Test Options Parse Back
(3) - Test Options Parse & Parse Back`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				showMainMenu();
			break;
			case 1:
				getPath(value => optionsParse(value));
			break;
			case 2:
				getPath(value => optionsParseBack(value));
			break;
			case 3:
				getPath(value => optionsParseBack(optionsParse(value)));
			break;
		}
	});
}

function showDatMenu () {
	console.log(`(0) Back
(1) - Test Dat Parse
(2) - Test Dat Parse Back
(3) - Test Dat Parse & Parse Back`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				showMainMenu();
			break;
			case 1:
				getPath(value => {
					console.log("Is the file encoded?");
					getYesNo(bool => datParse(value, undefined, bool));
				});
			break;
			case 2:
				getPath(value => {
					console.log("Force it to be written to a file unencoded?");
					getYesNo(bool => datParseBack(value, undefined, bool), "n");
				});
			break;
			case 3:
				getPath(value => {
					console.log("Is the file encoded?");;
					getYesNo(bool => {
						console.log("Force it to be written to a file unencoded?");
						getYesNo(bool2 => datParseBack(datParse(value, undefined, bool), undefined, bool2), "n");
					});
				});
			break;
		}
	});
}

function showConfigureMenu () {
	console.log(`(0) Back
(1) - Choose Game Directory`);

	prompt.get({
		type: 'integer',
		message: "Input must be an integer",
		default: 0,
		required: true
	}, (err, result) => {
		let input = Number(result.question);

		switch (input) {
			case 0:
				return showMainMenu();
			case 1:
				findGameDirectory(showConfigureMenu);
				break;
			case 2:
				findDataDirectory(showConfigureMenu);
			break;
		}
	})
}

function getPath(cb) {
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

		cb(value.replace(/\{gamedir\}/ig, config.gameDirectory));
	});
}

function getYesNo (callback, defaultValue='y') { // awful name
	prompt.get({
		type: 'string',
		default: defaultValue,
		pattern: /^(y|yes|true|n|no|false)$/i
	}, (err, result) => {
		let answer = result.question;

		if (/^(y|yes|true)$/i.test(answer)) {
			callback(true);
		} else if (/^(n|no|false)$/i.test(answer)) {
			callback(false);
		} else {
			throw new Error("Not given valid answer.");
		}
	});
}

readConfig(() => showMainMenu());