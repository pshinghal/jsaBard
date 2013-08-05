define(
	[],
	function () {
		return function (controllerModel) {
			var myInterface = {};
			var temp;
			var nextSoundKey = 0; //NEVER DECREMENT!
			// If scene objects are constructed from JSON representations, this value will have to
			// be stored in the JSON too (or derived from the list of sound names.
			// i.e. nextSoundKey = <highest key in list> + 1)
			function getHighestKey() {
				var i, max = -1;
				for (i = 0; i < scene.sounds.length; i++) {
					max = Math.max(max, getSoundKeyFromName(scene.sounds[i]));
				}
				return max;
			}

			var scene = {};
			myInterface.getSceneObj = function () {
				return scene;
			};

			// Used to "import" a text-only scene into an object with the required methods
			// TODO: Add a way to set the custom controllerModel
			myInterface.setSceneObj = function (newScene) {
				scene = newScene;
				nextSoundKey = getHighestKey();
			};

			myInterface.getJSON = function () {
				return JSON.stringify(scene);
			};

			scene.name = "Default";
			myInterface.getName = function () {
				return scene.name;
			};
			myInterface.setName = function (newName) {
				scene.name = newName;
			};

			scene.sounds = [];

			function tokenizeByVBar(s) {
				return s.trim().split("|");
			}

			function makeUniqueList(list) {
				var newList = [];
				var i;
				for (i = 0; i < list.length; i++)
					if (newList.indexOf(list[i]) < 0)
						newList.push(list[i]);
				return newList;
			}

			function getSoundId(name) {
				return scene.sounds.indexOf(name);
			}

			function getSoundModelFromName(name) {
				return tokenizeByVBar(name)[0];
			}
			function getSoundKeyFromName(name) {
				return tokenizeByVBar(name)[1];

			}

			function addSoundToRangeHandler(handler) {
				handler.min.push([]);
				handler.max.push([]);
			}

			function addSoundToNStateHandler(handler) {
				var i;
				for (i = 0; i < handler.states.length; i++) {
					handler.states[i].push([]);
				}
			}

			function addSoundToSceneChangeHandler(handler) {
				// Cheerio!
				return;
			}

			function addSoundToHandler(handler) {
				switch (handler.type) {
					case "range":
						addSoundToRangeHandler(handler);
						break;
					case "nState":
						addSoundToNStateHandler(handler);
						break;
					case "sceneChange":
						addSoundToSceneChangeHandler(handler);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + handler.type);
						break;
				}
			}

			// Returns the name this sound is given. Format: <model name>/<key>. eg. jsaMp3/2
			myInterface.addSound = function (modelName) {
				var handlerName;
				var soundName = modelName + "|" + nextSoundKey;
				nextSoundKey++;
				scene.sounds.push(soundName);
				for (handlerName in scene.handlers) {
					if (scene.handlers.hasOwnProperty(handlerName)) {
						addSoundToHandler(scene.handlers[handlerName]);
					}
				}
				return soundName;
			};

			function removeSoundFromRangeHandlerById(handler, id) {
				handler.min.splice(id, 1);
				handler.max.splice(id, 1);
			}

			function removeSoundFromNStateHandlerById(handler, id) {
				var i;
				for (i = 0; i < handler.states.length; i++) {
					handler.states[i].splice(id, 1);
				}
			}

			function removeSoundFromSceneChangeHandlerById(handler, id) {
				// Cheerio!
				return;
			}

			function removeSoundFromHandlerById(handler, id) {
				switch (handler.type) {
					case "range":
						removeSoundFromRangeHandlerById(handler, id);
						break;
					case "nState":
						removeSoundFromNStateHandlerById(handler, id);
						break;
					case "sceneChange":
						removeSoundFromSceneChangeHandlerById(handler, id);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			}

			function removeSoundById(id) {
				var handlerName;
				scene.sounds.splice(id, 1);
				for (handlerName in scene.handlers) {
					if (scene.handlers.hasOwnProperty(handlerName)) {
						removeSoundFromHandlerById(scene.handlers[handlerName], id);
					}
				}
			}

			myInterface.removeSoundByName = function (name) {
				var id = getSoundId(name);
				if (id < 0) {
					console.log("Whoops! There's no sound by that name!");
					return;
				}
				removeSoundById(id);
			};

			myInterface.getSoundNames = function () {
				return scene.sounds.slice(0);
			};

			myInterface.getSoundModels = function () {
				return makeUniqueList(scene.sounds.map(getSoundModelFromName));
			};

			function buildRangeHandler(myHandler) {
				myHandler.max = [];
				myHandler.min = [];
			}

			function buildNStateHandler(myHandler, n) {
				var i;
				myHandler.states = [];
				for (i = 0; i < n; i++) {
					myHandler.states.push([]);
				}
			}

			function buildSceneChangeHandler(myHandler) {
				// Cheerio!
				return;
			}

			function buildHandler(handlerName) {
				var myHandler = {};
				var type = controllerModel.interface[handlerName].eventType;
				console.log(type);
				console.log(controllerModel.interface[handlerName]);
				myHandler.type = type;
				myHandler.description = "" + controllerModel.interface[handlerName].description;
				switch (type) {
					case "range":
						buildRangeHandler(myHandler);
						break;
					case "nState":
						buildNStateHandler(myHandler, controllerModel.interface[handlerName].numStates);
						break;
					case "sceneChange":
						buildSceneChangeHandler(myHandler);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
				return myHandler;
			}

			scene.handlers = {};

			for (temp in controllerModel.interface) {
				if (controllerModel.interface.hasOwnProperty(temp)) {
					scene.handlers[temp] = buildHandler(temp);
					if (controllerModel.interface[temp].hasOwnProperty("numStates"))
						scene.handlers[temp].numStates = controllerModel.interface[temp].numStates;

					console.log("Added to sceneHandler " + temp + " a type of " + controllerModel.interface[temp]);
				}
			}

			function tokenizeAddress(address) {
				return tokenizeByVBar(address);
			}

			function getHandlerNameFromAddress(address) {
				var tokens = tokenizeAddress(address);
				return tokens[0];
			}

			function setRangeSoundState(handler, address, soundId, state) {
				var tokens = tokenizeAddress(address);
				var minmax = tokens[1];
				switch (minmax) {
					case "min":
						handler.min[soundId] = state;
						break;
					case "max":
						handler.max[soundId] = state;
						break;
					default:
						console.log("ERROR: Don't know whether to set Minimum or Maximum!");
						break;
				}
			}

			function setNStateSoundState(handler, address, soundId, state) {
				var tokens = tokenizeAddress(address);
				var stateId = tokens[1];
				if (stateId > handler.states.length) {
					console.log("ERROR: Can't set that state!");
					return;
				}
				handler.states[stateId][soundId] = state;
			}

			function setSceneChangeSoundState(handler, address, soundId, state) {
				// Cheerio!
				return;
			}

			// address specifies which exact row of soundStates is being affected.
			// For example: "roll/min" or "myFiveStateController/0"
			// It should probably be (part of) the button's ID
			myInterface.setSoundState = function (address, soundName, state) {
				console.log("setSoundState got addr: " + address + " soundName: " + soundName + " state: " + JSON.stringify(state));
				var soundId = getSoundId(soundName);
				var handlerName = getHandlerNameFromAddress(address);
				// IF the handler doesn't exist, do nothing
				if (!scene.handlers[handlerName]) {
					console.log("ERROR! handler " + handlerName + " does not exist!");
					return false;
				}
				var handler = scene.handlers[handlerName];
				switch (handler.type) {
					case "range":
						setRangeSoundState(handler, address, soundId, state);
						break;
					case "nState":
						setNStateSoundState(handler, address, soundId, state);
						break;
					case "sceneChange":
						setSceneChangeSoundState(handler, address, soundId, state);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			};

			function getRangeSoundState(handler, address, soundId, state) {
				var tokens = tokenizeAddress(address);
				var minmax = tokens[1];
				switch (minmax) {
					case "min":
						return handler.min[soundId];
					case "max":
						return handler.max[soundId];
					default:
						console.log("ERROR: Don't know whether to get Minimum or Maximum!");
						return;
				}
			}

			function getNStateSoundState(handler, address, soundId) {
				var tokens = tokenizeAddress(address);
				var stateId = tokens[1];
				if (stateId > handler.states.length) {
					console.log("ERROR: Can't get that state!");
					return;
				}
				return handler.states[stateId][soundId];
			}

			function getSceneChangeSoundState(handler, address, soundId) {
				// Cheerio!
				return;
			}

			// To set in the sliderBoxes when that state is clicked
			myInterface.getSoundState = function (address, soundName) {
				var soundId = getSoundId(soundName);
				var handlerName = getHandlerNameFromAddress(address);
				// IF the handler doesn't exist, do nothing
				if (!scene.handlers[handlerName]) {
					console.log("ERROR! handler " + handlerName + " does not exist!");
					return false;
				}
				var handler = scene.handlers[handlerName];
				switch (handler.type) {
					case "range":
						return getRangeSoundState(handler, address, soundId);
					case "nState":
						return getNStateSoundState(handler, address, soundId);
					case "sceneChange":
						return getSceneChangeSoundState(handler, address, soundId);
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						return null;
				}
			};

			return myInterface;
		};
	}
);
