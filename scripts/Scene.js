define(
	// TODO: Remove handlerModel ASAP
	["controllerModel", "handlerModel"],
	function (controllerModel, handlerModel) {
		return function () {
			var i;

			// TODO IMPORTANT!
			// THIS CODE SHOULD PROBABLY BE MOVED SOMEWHERE ELSE LATER!
			var tempControllerModel = { interface: {} };
			for (i = 0; i < controllerModel.interface.length; i++) {
				var x;
				var name = controllerModel.interface[i].paramioID;
				tempControllerModel.interface[name] = {};
				for (x in controllerModel.interface[i]) {
					if (controllerModel.interface[i].hasOwnProperty(x) && x != "paramioID") {
						tempControllerModel.interface[name][x] = controllerModel.interface[i][x];
					}
				}
			}
			controllerModel = tempControllerModel;
			console.log(controllerModel);
			// END IMPORTANT

			var myInterface = {};
			var temp;
			var nextSoundKey = 0; //NEVER DECREMENT!

			var scene = {};
			myInterface.getSceneObj = function () {
				return scene;
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

			function tokenizeBySlash(s) {
				return s.trim().split("/");
			}

			function makeUniqueList(list) {
				var newList = [];
				var i;
				for (i = 0; i < newList.length; i++)
					if (newList.indexOf(list[i]) < 0)
						newList.push(list[i]);
				return newList;
			}

			function getSoundId(name) {
				return scene.sounds.indexOf(name);
			}

			function getSoundModelFromName(name) {
				return tokenizeBySlash(name)[0];
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
					case "scene_change":
						addSoundToSceneChangeHandler(handler);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			}

			// Returns the name this sound is given. Format: <model name>/<key>. eg. jsaMp3/2
			myInterface.addSound = function (modelName) {
				var handlerName;
				var soundName = modelName + "/" + nextSoundKey;
				nextSoundKey++;
				// if (scene.models.indexOf(modelName) > -1)
					// return;
				scene.sounds.push(modelName);
				for (handlerName in scene.handlers) {
					if (scene.handlers.hasOwnProperty(handlerName)) {
						addSoundToHandler(scene.handlers[handlerName]);
					}
				}
				return soundName;
			};
			// myInterface.removeSound = function (modelName) {
			//	var pos = scene.models.indexOf(modelName);
			//	if (pos === -1)
			//		scene.models.splice(pos, 1);
			// };

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
					case "scene_change":
						removeSoundFromSceneChangeHandlerById(handler, id);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			}

			myInterface.removeSoundById = function (id) {
				var handlerName;
				scene.sounds.splice(id, 1);
				for (handlerName in scene.handlers) {
					if (scene.handlers.hasOwnProperty(handlerName)) {
						removeSoundFromHandlerById(scene.handlers[handlerName], id);
					}
				}
			};

			myInterface.removeSoundByName = function (name) {
				var id = getSoundId(name);
				if (id < 0) {
					console.log("Whoops! There's no sound by that name!");
					return;
				}
				removeSoundById(id);
			};

			myInterface.getSoundNames = function () {
				return scene.soundNames;
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
				var type = controllerModel[handlerName].type;
				myHandler.type = type;
				myHandler.description = "" + controllerModel[handlerName].description + handlerModel[type].description;
				switch (type) {
					case "range":
						buildRangeHandler(myHandler);
						break;
					case "nState":
						buildNStateHandler(myHandler, controllerModel[handlerName].numStates);
						break;
					case "scene_change":
						buildSceneChangeHandler(myHandler);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			}

			scene.handlers = [];

			for (temp in controllerModel) {
				if (controllerModel.hasOwnProperty(temp)) {
					scene.handlers[temp] = buildHandler(temp);
					scene.handlers[temp].type = controllerModel[temp].eventType;
					if (controllerModel[temp].hasOwnProperty("numStates"))
						scene.handlers[temp].numStates = controllerModel[temp].numStates;

					//TODO: Populate dynamically instead
					// scene.handlers[temp].targets = [];

					console.log("Added to sceneHandler " + temp + " a type of " + controllerModel[temp]);
				}
			}

			// function getItemModel(handlerType, item) {
			//	console.log("called getItemModel with " + handlerType + ": " + item);
			//	var currItem = item.split("/");
			//	var itemWord = currItem.shift();
			//	var itemModel = handlerModel[handlerType].content[itemWord];
			//	while ((itemWord = currItem.shift()) && itemModel) {
			//		console.log("Getting model of word " + itemWord);
			//		itemModel = itemModel.content[itemWord];
			//	}
			//	return itemModel;
			// }

			// function getItemArray(handler, item) {
			//	var itemList = item.split("/");
			//	var arr = scene.handlers[handler];
			//	var currItem;
			//	while ((currItem = itemList.shift()))
			//		arr = arr[currItem];
			//	return arr;
			// }

			function tokenizeAddress(handlerContentAddress) {
				return tokenizeBySlash(handlerContentAddress);
			}

			function getHandlerNameFromContentAddress(handlerContentAddress) {
				var tokens = tokenizeAddress(handlerContentAddress);
				return tokens[0];
			}

			// function isItemAppendableArray(handlerType, item) {
			//	var itemModel = getItemModel(handlerType, item);
			//	// If that item doesn't exist, do nothing
			//	if (!itemModel)
			//		return false;
			//	if (!itemModel.isAppendable)
			//		return false;

			//	// TODO: Extend support to items other than Arrays (?)
			//	if (itemModel.type.split("/")[0] !== "Array")
			//		return false;

			//	return true;
			// }

			function setRangeSoundState(handler, handlerControlAddress, soundId, state) {
				var tokens = tokenizeAddress(handlerContentAddress);
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

			function setNStateSoundState(handler, handlerControlAddress, soundId, state) {
				var tokens = tokenizeAddress(handlerContentAddress);
				var stateId = tokens[1];
				if (stateId > handler.states.length) {
					console.log("ERROR: Can't set that state!");
					return;
				}
				handler.states[stateId] = state;
			}

			function setSceneChangeSoundState(handler, handlerControlAddress, soundId, state) {
				// Cheerio!
				return;
			}

			// handlerContentAddress specifies which exact row of soundStates is being affected.
			// For example: "roll/min" or "myFiveStateController/0"
			// It should probably be (part of) the button's ID
			myInterface.setSoundState = function (handlerContentAddress, soundName, state) {
				var soundId = getSoundId(soundName);
				var handlerName = getHandlerNameFromContentAddress(handlerContentAddress);
				// IF the handler doesn't exist, do nothing
				if (!scene.handlers[handlerName])
					return false;
				var handler = scene.handlers[handlerName];
				switch (handler.type) {
					case "range":
						setRangeSoundState(handler, handlerControlAddress, soundId, state);
						break;
					case "nState":
						setNStateSoundState(handler, handlerControlAddress, soundId, state);
						break;
					case "scene_change":
						setSceneChangeSoundState(handler, handlerControlAddress, soundId, state);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			};

			function getRangeSoundState(handler, handlerControlAddress, soundId, state) {
				var tokens = tokenizeAddress(handlerContentAddress);
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

			function getNStateSoundState(handler, handlerControlAddress, soundId) {
				var tokens = tokenizeAddress(handlerContentAddress);
				var stateId = tokens[1];
				if (stateId > handler.states.length) {
					console.log("ERROR: Can't get that state!");
					return;
				}
				return handler.states[stateId];
			}

			function getSceneChangeSoundState(handler, handlerControlAddress, soundId) {
				// Cheerio!
				return;
			}

			// To set in the sliderBoxes when that state is clicked
			myInterface.getSoundState = function (handlerContentAddress, soundName) {
				var soundId = getSoundId(soundName);
				var handlerName = getHandlerNameFromContentAddress(handlerContentAddress);
				// IF the handler doesn't exist, do nothing
				if (!scene.handlers[handlerName])
					return false;
				var handler = scene.handlers[handlerName];
				switch (handler.type) {
					case "range":
						getRangeSoundState(handler, handlerControlAddress, soundId);
						break;
					case "nState":
						getNStateSoundState(handler, handlerControlAddress, soundId);
						break;
					case "scene_change":
						getSceneChangeSoundState(handler, handlerControlAddress, soundId);
						break;
					default:
						console.log("ERROR! Got an unknown handler type: " + type);
						break;
				}
			};

			// myInterface.add = myInterface.addHandlerContentItem;

			// myInterface.removeHandlerContentItem = function (handler, item, id) {
			//	// IF the handler doesn't exist, do nothing
			//	if (!scene.handlers[handler])
			//		return false;
			//	var handlerType = scene.handlers[handler].type;

			//	if (!isItemAppendableArray(handlerType, item))
			//		return false;

			//	getItemArray(handler, item).splice(id, 1);
			//	return true;
			// // };
			// myInterface.getHandler

			return myInterface;
		};
	}
);
