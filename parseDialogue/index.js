let shouldLog = true;
let tab = 0;
function log (...data) {
	if (shouldLog) {
		console.log('\t'.repeat(tab), ...data);
	}
}

function parse (text) {
	log("Starting parse");

	let index = 0;

	let dialogues = [];

	tab++;
	while (true) {
		try {
			index = consumeWhitespace(text, index);

			let dialog;
			[dialog, index] = parseDialog(text, index);

			dialogues.push(dialog);
		} catch (err) {
			log(err);
			break;
		}
	}
	tab--;

	return dialogues;
}

function parseBack (dialogues) {
	log("parse back");
	let text = '';
	let textMap = (val) => {
		if (typeof(val) === 'string') {
			return val.trim();
		} else if (val.type === 'variable') {
			return '<' + val.name + '>';
		} else if (val.type === 'link') {
			return '{' + val.name + '}';
		} else if (val.type === 'next') {
			return '\n=' + val.text.trim();
		}
	};
	for (let i = 0; i < dialogues.length; i++) {
		let dg = dialogues[i];

		text += `[${dg.header}]
${dg.ask.map(textMap).join('')}
${dg.answers.map((val) => '#' + val.map(textMap).join('')).join('\n')}

`;
	}
	
	return text;
}

function parseDialog (text, index) {
	log("Starting parseDialog");
	tab++;
	let dialog = {
		header: null,
		ask: null,
		answers: []
	};
	
	[dialog.header, index] = parseHeader(text, index);

	index = consumeWhitespace(text, index);
	
	log("parsed header", dialog.header);

	// There isn't always ask test (endgame)
	[dialog.ask, index] = parseAskText(text, index);

	index = consumeWhitespace(text, index);

	log("parsed ask", dialog.ask);

	tab++;
	while (true) {
		try {
			[dialog.answers[dialog.answers.length], index] = parseAnswerText(text, index);
			
			log("parsed answer", dialog.answers[dialog.answers.length-1]);

			index = consumeWhitespace(text, index);
		} catch (err) {
			log(err);
			break;
		}
	}
	
	tab--;
	
	log("ending parse dialog")
	tab--;
	return [dialog, index];
}

function consumeWhitespace (text, index) {
	log ("Consuming whitespace")
	while (/\s/.test(text[index])) {
		index++;
	}

	log("Done Consuming Whitespace");
	return index;
}

function parseHeader (text, index) {
	log("parse header");
	let name = '';

	log(text[index], text[index + 1], text[index + 2]);

	if (text[index] === '[') {

		log("Found beginning of heading '['")

		index++; // skip past beginning [
		
		log("Parsing header text")

		while(text[index] !== ']') {
			name += text[index];
			index++;
		}
		log("Done parsing header text");

		// Skip past ending ]
		index++;

		return [name, index];
	} else {
		throw new Error('Given non header start!');
	}
}

function parseAskText (text, index) {
	log("parse ask text");
	return parseText(text, index, false);
}

function parseAnswerText (text, index) {
	log("parse Answer Text");
	if (text[index] === '#') { // "#"
		index += 1;
		
		log("Found hash");

		return parseText(text, index, true, true);
	} else {
		throw new Error("asked to parse non-answer text");
	}
}

function parseText (text, index, isAnswer=false, allowBracket=false) {
	log("parse text");
	let valText = [];
	let current = -1;
	
	tab++;
	while (true) { // while it isn't newlines
		if (text[index] === undefined || (!allowBracket && (text[index] === '[' && (text[index - 1] === '\r' || text[index - 1] === '\n')))) {
			break;
		} else if (text[index] === '\r' || text[index] === '\n') {
			log("Newline");
			//index = consumeWhitespace(text, index);

			if (text[index] === '=') { // That weird newline/newmessage thing.
				log("Found newline =");

				valText.push({
					type: 'next',
					text: ''
				});
				current++;
				index++; // skip past '='
			} else if (text[index] === '[') {
				break;
			} else {
				if (typeof(valText[current]) === 'string') {
					valText[current] += text[index];
				} else if (typeof(valText[current]) === 'object' && valText[current].type === 'next') {
					valText[current].text += text[index];
				} else {
					valText.push(text[index]);
					current++;
				}
				index++;
				//break;
			}
		} else if (text[index] === '<') { // a variable.
			tab++;
			let temp = parseVariable(text, index);
			let name = temp[0];
			index = temp[1];

			valText.push({
				type: 'variable',
				name
			});
			current++;
			tab--;
		} else if (isAnswer && text[index] === '{') {
			tab++;
			let temp = parseLink(text, index);
			let name = temp[0];
			index = temp[1];

			valText.push({
				type: 'link',
				name
			});
			current++;
			tab--;
		} else { // normal text
			if (typeof(valText[current]) === 'string') {
				valText[current] += text[index];
			} else if (typeof(valText[current]) === 'object' && valText[current].type === 'next') {
				valText[current].text += text[index];
			} else {
				valText.push(text[index]);
				current++;
			}
			index++;
		}
	}
	tab--;

	return [valText, index];
}

function parseVariable (text, index) {
	log("parse variable");
	let name = '';
	
	if (text[index] === '<') {
		index++;
		
		while (text[index] !== '>') {
			name += text[index];
			index++;
		}

		index++;

		return [name, index];
	} else {
		throw new Error("Given non variable!");
	}
}

function parseLink (text, index) {
	log("parse link");
	let name = '';
	if (text[index] === '{') {
		index++;

		while (text[index] !== '}') {
			name += text[index];
			index++;
		}

		index++;

		return [name, index];
	} else {
		throw new Error("Given non link!");
	}
}

module.exports = {
	parse,
	parseBack
};