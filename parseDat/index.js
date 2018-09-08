// C:\Users\Minus\AppData\Roaming\Heat_Signature\Galaxy 1\Characters\Magic Love.dat
function parse (text, encoded=true) {
	let data = text.split(/(?:\n|\r\n|\r)/);

	let index = 0;

	let sections = [];

	try {
		// all of the first headers seem to be not in base64, thankfully
		[sections[sections.length], index] = parseSection(data, index, false);
	} catch (err) {}
	
	index = consumeEmpty(data, index);
	
	while (true) {
		try {
			if (index >= data.length) {
				break;
			}

			[sections[sections.length], index] = parseSection(data, index, encoded);

			index = consumeEmpty(data, index);
		} catch (err) {
			break;
		}
	}

	return sections;	
}

function consumeEmpty (data, index) {
	while (!data[index] && index < data.length) {
		index++;
	}

	return index;
}

function parseSection (data, index, encrypted=true) {
	let section = {
		name: null,
		properties: null,
		encrypted
	};

	if (data[index]) {
		section.name = base64decode(data[index], encrypted); // header name
		section.name = section.name.slice(1, section.name.length - 1); // cuts off the brackets

		index++; // skip past the header
	} else {
		index = consumeEmpty(data, index);
	}
	
	[section.properties, index] = parseSectionProperties(data, index, encrypted);

	return [section, index];
}

function parseSectionProperties(data, index, encrypted=true) {
	let properties = [];

	while(data[index] && index < data.length) {
		let text = base64decode(data[index], encrypted);
		
		try {
			let name = text.match(/.*(?=\ \=\ )/)[0];
			let value = text.match(/(?<= = ).*/)[0];

			properties.push({
				type: "property",
				name,
				value,
				encrypted
			});

			index++;
		} catch (err) {
			properties.push({
				type: "text",
				value: text,
				encrypted
			});

			index++;
		}
	}

	return [properties, index];
}

function parseBack (sections, forceUnencoded=false) {
	return sections.map(section => 
		base64encode('<' + section.name + '>', forceUnencoded ? false : section.encrypted) + '\n' + 
		section.properties.map(prop => {
			if (prop.type === "property") {
				return base64encode(prop.name + " = " + prop.value, forceUnencoded ? false : prop.encrypted) + '\n';
			} else if (prop.type === "text") {
				return base64encode(prop.value, forceUnencoded ? false : prop.encrypted) + '\n';
			} else {
				throw new Error("Unseen type:", prop.type);
			}
		}).join('') + '\n'
	).join('');
} 

function base64decode (text, shouldDecrypt=true) {
	if (shouldDecrypt) {
		return Buffer.from(text, 'base64').toString();
	}

	return text;
}

function base64encode (text, shouldEncrypt=true) {
	if (shouldEncrypt) {
		return Buffer.from(text, 'utf8').toString('base64');
	}

	return text;
}

module.exports = {
	parse,
	parseBack
};