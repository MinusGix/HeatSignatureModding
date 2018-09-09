# Heat Signature Modding Tools

What it has: (So far most of these just make it easier to edit files)
	- Parse Controls (Parses the controls file into json and back, so if you want to edit those)
	- Parse Dat Files (Parses the various .dat files the game uses for various things like characters, scenarios, etc. into json and back)
	- Parse Dialogue (Parses Dialogue Files which are located in {Heat Signature Game Directory}/Dialog/ into json and back. This was a pain)
	- Parse Names (Parses the name files into json and back. Really useless and tiny as it just splits it on newlines)
	- Parse Options (Parses the options files (not options.ini the one in %AppData%/Heat_Signature/Options.txt))

The Dat file parsing makes it easier to give your character custom weapons (and other things) as it decodes the base64 into readable text and auto recodes it when you want it to.
The Dialogue parsing would make it easier to build a dialogue tree generator program.

Texture files (which this doesn't touch so far) for ships are stored in their respective faction folders in the game directories and can easily be replaced (I did a simple inversion of the colors as a test and it worked), but the textures and such for people aren't in those folders and I believe they might be packed into the game executable (Gamemaker Studio, I believe). That makes them a bit of a pain to get out, and I haven't looked too much at it yet.

TODO:
	- Make a parser for galaxy colors (and parseback)
	- For various parsers (Especially dat files) when converting to json, make more decisions about types to make them even easier to work with. (Make arrays, colors, and find out the various types and values of different things)
	- Find a way to unpack the character/enemy textures from the game
	- Find a way to make deeper modifications to the game. (Such as making weapon's different for everyone) It might be viable to make edits for your characters items, but thats just for that singular item. (I believe, I haven't actually done any character modification)
	- Find a way to disable item sharing if the game is modded. This might happen already, as there is a checksum in several of the files, but I haven't tested.