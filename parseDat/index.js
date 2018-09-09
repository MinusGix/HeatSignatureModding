function parse (text, encoded=true) {
	let data = text.split(/(?:\n|\r\n|\r)/);

	let index = 0;

	let sections = [];

	try {
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
	
	[section.properties, index] = parseSectionProperties(section.name, data, index, encrypted);

	return [section, index];
}

let special = {
	Header: {
		string: [],
		number: [
			"TimeNumber",
		],
		boolean: [
			"Encoded"
		]
	},

	Character: {
		string: [
			'Status', // Seen: Active, Available
			'Forename',
			'Surname',
			'Skin',
			'Head',
		],

		number: [
			'CapturedByFactionIndex',
			'BleedOutTime',
			'Money',
			'PersonalMissionCost',
			'PersonalMissionState',
			'PersonalMissionIntel',
			'Kills',
			'Knockouts',
			'TimesInjured',
			'MissionsCompleted',
			'MissionsTaken',
			'ClausesTaken',
			'ClausesCompleted',
			'Alarms',
			'LivingWitnesses',
			'AveragePay',
			'TotalLiberationProgress',
			'EasyMissionsCompleted',
			'MediumMissionsCompleted'
		]
	},

	Pod: {
		string: [
			"PodSkin"
		],
		number: [
			"PodState", // unsure
			"SpecialPodType", // unsure
			"PodMaxFuel"
		]
	},

	Item: {
		string: [
			"Type",
			"Name",
			"BaseName",
			"Slot", // this could be a tri-option thingy rather than just a string
			"Trait",
		],
		number: [
			"TimesUsed",
			"Value",
			"Rarity",
			"Uses",
		]
	},

	Mission: {
		string: [
			"Type"
		],
		number: [
			"FactionIndex",
			"Difficulty",
		]
	},

	Ship: {
		string: [
			"KeycardGuardRole",
		],
		number: [
			"MaxGuardsPerCluster",
			"MinGuardsPerCluster",
			"AlarmTime",
			"TimeLimit",
			"SentriesPerSegment",
		],
		boolean: [
			"HasHeatSensors", // just guessing, but seems right
		]
	},

	GuardKit: {
		string: [
			"Role",
			"Kit",
		]
	},

	Mission: {
		string: [
			"Type",
			"Target",
			"Description"
		],
		number: [
			"FactionIndex",
			"Bonus",
			"Pays",
			"Difficulty",
		]
	},

	findKeyType (sectionName, key) {
		if (!sectionName) return null;
		if (!key) return null;

		return special.sectionHasKey(sectionName, "string", key) ||
			special.sectionHasKey(sectionName, "boolean", key) ||
			special.sectionHasKey(sectionName, "number", key);
	},

	sectionHasKey (sectionName, type, key) {
		if (
			special[sectionName] && 
			special[sectionName][type] && 
			special[sectionName][type].includes(key)
		) {
			return type;
		}

		return null;
	}
}

/*
	Character:
		Ammo[n] need a way to handle arrays well
		Status - Probably a boolean but with two words rather than numbers/booleans
		Accolades 
		PersonalMissionRescueAgent
	Pod:
		PodThrustColor - need to implement color storage
	Item:
		TextColour
	Mission:
	Ship:
		PracticeTutorialShip - Unsure if boolean or number
		PracticeLayout - Unsure if boolean or number
	Mission:
		Context
		LovedOne
*/

function parseSectionProperties(sectionName, data, index, encrypted=true) {
	let properties = [];

	while(data[index] && index < data.length) {
		let text = base64decode(data[index], encrypted);
		
		try {
			let name = text.match(/.*(?=\ \=\ )/)[0];
			let value = text.match(/(?<= = ).*/)[0];

			let type = special.findKeyType(sectionName, name);

			if (type === 'string') {} // can just ignore this since by default it's a string
			else if (type === 'number') {
				value = Number(value);
			} else if (type === 'boolean') {
				if (value === '0' || value === 'false') {
					value = false;
				} else if (value === '1' || value === 'true') {
					value = true;
				} else {
					throw new Error("Type was set to boolean in code but it wasn't recognized as one :(");
				}
			}

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
				let type = special.findKeyType(section.name, prop.name);
				let value = prop.value;

				if (type === 'string') {} // it's already string, ignore it
				else if (type === 'number') {
					value = String(value);
				} else if (type === 'boolean') {
					if (value === 0 || value === false) {
						value = '0';
					} else if (value === 1 || value === true) {
						value = '1;'
					} else {
						throw new Error('Problem in converting boolean back to string as it wasnt a boolean :c');
					}
				}

				return base64encode(prop.name + " = " + value, forceUnencoded ? false : prop.encrypted) + '\n';
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