class Controls {
	constructor() {
		this.controls = [];
	}

	add(control) {
		this.controls.push(control);
	}

	static parseControls(text) {
		let controls = new Controls();

		controls.parseControls(text);

		return controls;
	}

	parseControls(text) {
		let index = 0;
		let control;

		while (true) {
			try {
				[control, index] = this.parseControl(text, index);
				this.add(control);

				index += this.indexJumpNewline(text, index);
				index += this.indexJumpNewline(text, index);
			} catch (err) { // easy way to read until it can't read anymore.
				break;
			}
		}
	}

	parseControl(text, startIndex) {
		let control = {};

		if (text.slice(startIndex, startIndex + Controls.controlHeader.length) === Controls.controlHeader) {
			let index = startIndex + Controls.controlHeader.length;

			index += this.indexJumpNewline(text, index);

			let tempValue, tempIndex;

			[tempValue, tempIndex] = this.parseValue(text, index, Controls.nameOption, "string")

			index = tempIndex;
			control.Name = tempValue;

			[tempValue, tempIndex] = this.parseValue(text, index, Controls.keyboardButtonOption, "number");

			index = tempIndex;
			control.KeyboardButton = tempValue;

			[tempValue, tempIndex] = this.parseValue(text, index, Controls.mouseButtonOption, "number");

			index = tempIndex;
			control.MouseButton = tempValue;

			[tempValue, tempIndex] = this.parseValue(text, index, Controls.gamepadButtonOption, "number");

			index = tempIndex;
			control.GamepadButton = tempValue;

			return [control, index];
		} else {
			throw new Error("Couldn't find <Control>");
		}
	}

	// Convert it back to a normal text file
	convertToText() {
		let text = '';
		for (let i = 0; i < this.controls.length; i++) {
			text += `<Control>
Name = ${this.controls[i].Name}
KeyboardButton = ${this.controls[i].KeyboardButton}
MouseButton = ${this.controls[i].MouseButton}
GamepadButton = ${this.controls[i].GamepadButton}

`;
		}

		return text;
	}

	parseValue(text, index, option, type = "number") {
		if (text.slice(index, index + option.length).toLowerCase() === option.toLowerCase()) {
			index += option.length;

			if (text.slice(index, index + 3).toLowerCase() === ' = ') {
				index += 3;

				let value = '';
				if (type === "number") {
					while (/[\-\+0-9]/.test(text[index])) {
						value += text[index];
						index++;
					}

					value = Number(value);
				} else if (type === 'string') {
					while (/[a-zA-Z \(\)0-9]/.test(text[index])) {
						value += text[index];
						index++;
					}
				}

				index += this.indexJumpNewline(text, index);

				return [value, index];
			} else {
				throw new Error("Couldn't find " + option + "'s ' = '");
			}
		} else {
			throw new Error("Couldn't find " + option);
		}
	}

	indexJumpNewline (text, index) {
		if (text[index] === '\r' && text[index + 1] === '\n') {
			return 2;
		} else if (text[index] === '\n') {
			return 1;
		}
		return 0; // ehhhhh
	}
}

Controls.controlHeader = '<Control>';
Controls.nameOption = 'Name';
Controls.keyboardButtonOption = 'KeyboardButton';
Controls.mouseButtonOption = 'MouseButton';
Controls.gamepadButtonOption = 'GamepadButton';

module.exports = Controls;