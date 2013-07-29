require.config({
	paths: {
		"jsaSound": "http://animatedsoundworks.com:8001/",
		"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min"
	}
});
define(
	["Story", "jsaSound/jsaCore/sliderBox", "jquery"],
	function (Story, makeSliderBox, $) {
		//TODO: Do not allow models to be added when no scene is selected (but a scene HAS been created). Maybe avoid non-selection completely

		var i;
		var controllerModel = {};

		function setController(model) {
			var tempControllerModel = { interface: {} };
			controllerModel.interface = {};
			for (i = 0; i < model.interface.length; i++) {
				var x;
				var name = model.interface[i].paramioID;
				controllerModel.interface[name] = {};
				for (x in model.interface[i]) {
					if (model.interface[i].hasOwnProperty(x) && x != "paramioID") {
						controllerModel.interface[name][x] = model.interface[i][x];
					}
				}
			}
		}

		// FOR DEBUGGING
		function printArr(arr) {
			console.log("---");
			for (var i = 0; i < arr.length; i++) {
				console.log(arr[i]);
			}
			console.log("---");
		}
		// END DEBUGGING

		var nextSceneId = 0;

		// TODO: Re-populate and use in the code
		var elemIds = {
			scenesDiv: "scenes",
			sceneEditorDiv: "sceneEditor",
			newSceneButton: "newScene",
			newSoundButton: "newSound",
			newSoundNameField: "newSoundName",
			saveStoryButton: "saveButton",
			saveStoryNameField: "storyName",
			soundList: "soundList",
			controllerElementParams: "controllerElementParams",
			welcomeContainer: "welcomeContainer",
			authorContainer: "authorContainer",
			controllerInput: "controllerInput",
			loadControllerButton: "loadControllerButton"
		};

		var story;

		var sliderBoxes = {};
		var soundModelNames = [];
		var soundModels = {};

		var elements = {};

		function elem(id) { return document.getElementById(id); }
		function hide(id) { elem(id).setAttribute("hidden"); }
		function show(id) { elem(id).removeAttribute("hidden"); }
		function disable(id) { elem(id).setAttribute("disabled"); }
		function enable(id) { elem(id).removeAttribute("disabled"); }
		function atoi(str) { return parseInt(str, 10); }

		function tokenizeByVBar(s) { return s.trim().split("|"); }
		function joinByVBar() { return Array.prototype.join.call(arguments, "|"); }
		function setActive(node) { node.setAttribute("active"); }
		function removeActive(node) { node.removeAttribute("active"); }

		function mapElementsToIds() {
			var x;
			for (x in elemIds) {
				elements[x] = elem(elemIds[x]);
			}
		}

		function getCurrentSoundState(soundName) {
			if (!sliderBoxes[soundName])
				return null;
			return sliderBoxes[soundName].getSelected();
		}

		function setCurrentSoundState(soundName, state) {
			if (!sliderBoxes[soundName])
				return;
			sliderBoxes[soundName].setState(state);
		}

		//===============
		// DOM functions
		//===============

		function getNewScene() {
			var nextSceneId = story.getNextSceneId();
			// console.log("Scene id is " + nextSceneId);
			var sceneDiv = document.createElement("div");
			sceneDiv.setAttribute("class", "scene");
			sceneDiv.setAttribute("id", joinByVBar("scene", nextSceneId));

			var pDiv = document.createElement("p");
			pDiv.innerHTML = "Scene " + nextSceneId;
			pDiv.addEventListener("click", makeSceneSelector(sceneDiv));
			sceneDiv.appendChild(pDiv);

			var deleteButton = document.createElement("button");
			deleteButton.innerHTML = "Delete";
			deleteButton.setAttribute("class", "deleteScene");
			deleteButton.addEventListener("click", makeSceneDeleter(sceneDiv));
			sceneDiv.appendChild(deleteButton);

			// Add horizontal rule at the end
			sceneDiv.appendChild(document.createElement("hr"));

			return sceneDiv;
		}

		function appendScenes(sceneNode) {
			var temp = elements.newSceneButton;
			temp.parentNode.removeChild(temp);
			elements.scenesDiv.insertAdjacentElement("beforeend", sceneNode);
			elements.scenesDiv.insertAdjacentElement("beforeend", temp);
		}

		function addNewScene() {
			console.log("Adding new scene");
			var newScene = getNewScene();
			appendScenes(newScene);
			story.addNewScene();
			selectScene(newScene);
		}

		// REDUCES subsequent nodes
		function removeScene(sceneNode) {
			var sceneId = atoi(tokenizeByVBar(sceneNode.getAttribute("id")).pop());
			console.log("Removing scene with ID " + sceneId);
			var nextNode = sceneNode.nextSibling;
			sceneNode.parentNode.removeChild(sceneNode);

			adjustSceneIdsFrom(nextNode, -1);
			// TODO: Remove Everything else attached to this scene

			story.removeScene(sceneId);
		}

		// Unused. Keeping it just in case
		function removeSceneById(id) {
			console.log("Removing scene with ID " + id);
			removeScene(elem(joinByVBar("scene", id)));
		}

		// Unused. Keeping it just in case
		function removeSceneByButton(button) {
			console.log("Starting with node:");
			console.log(button);
			var currNode = button;
			while (currNode && (!currNode.getAttribute("class") || tokenizeByVBar(currNode.getAttribute("class"))[0] !== "scene"))
				currNode = currNode.parentNode;
			console.log("Bubbled up to node:");
			console.log(currNode);
			removeScene(currNode);
		}

		function loadSliderBoxes() {
			if (!story.getCurrentScene())
				return;
			var soundList = story.getCurrentScene().getSoundNames();

			var i;
			for (i = 0; i < soundList.length; i++) {
				var model = tokenizeByVBar(soundList[i])[0];
				//DANGER. May be incorrect.
				sliderBoxes[soundList[i]] = makeSliderBox(soundModels[model]());
			}
		}

		//Callback is optional
		function loadSoundModels(callback) {
			// TODO: Sanitize list (?)
			function soundModelHelper(num) {
				if (num < soundModelNames.length) {
					console.log("The scene you are loading has " + soundModelNames.length + " models.");
					require(
						// Get the model
						["jsaSound/jsaModels/" + soundModelNames[num]],
						// And open the sliderBox
						function (currentSM) {
							console.log("Adding " + soundModelNames[num] + " to soundModels object");

							soundModels[soundModelNames[num]] = currentSM;
							soundModelHelper(num + 1);
						}
					);
				} else if (callback)
					callback();
			}
			soundModelHelper(0);
		}

		function reloadSoundModels(callback) {
			// Memory leak?
			soundModelNames = [];
			soundModels = {};
			if (!story.getCurrentScene())
				return;
			soundModelNames = story.getCurrentScene().getSoundModels();
			console.log("Sound models received:");
			printArr(soundModelNames);

			loadSoundModels(callback);
		}

		function clearSliderBoxes() {
			// Memory leak?
			sliderBoxes = {};
		}

		function closeSliderBoxes() {
			var x;
			for (x in sliderBoxes) {
				if (sliderBoxes.hasOwnProperty(x)) {
					sliderBoxes[x].close();
				}
			}
		}

		function refreshSliderBoxes() {
			closeSliderBoxes();
			clearSliderBoxes();
			reloadSoundModels(loadSliderBoxes);
		}

		function selectScene(sceneNode) {
			// TODO: Stop "concurrent" selection.

			// console.log("Selecting scene:");
			// console.log(sceneNode);
			var currSceneId = story.getCurrentSceneId();
			// console.log("Current Active ID = " + currSceneId);
			if (currSceneId > -1)
				removeActive(elem(joinByVBar("scene", currSceneId)));
			setActive(sceneNode);
			var sceneId = atoi(tokenizeByVBar(sceneNode.getAttribute("id")).pop());
			// console.log("This scene has ID=" + sceneId);
			story.setCurrentScene(sceneId);
			console.log("Set Story's current scene to " + sceneId);
			redrawSceneEditor();

			refreshSliderBoxes();
		}

		// Unused. Keeping it just in case
		function selectSceneById(id) {
			console.log("Selecting by ID " + id);
			selectScene(elem(joinByVBar("scene", id)));
		}

		// Unused. Keeping it just in case
		function selectSceneByNode(node) {
			var currNode = node;
			while (currNode && (!currNode.getAttribute("class") || tokenizeByVBar(currNode.getAttribute("class"))[0] !== "scene"))
				currNode = currNode.parentNode;
			selectScene(currNode);
		}

		function makeSceneSelector(sceneDiv) {
			return function (e) {
				e.preventDefault();
				selectScene(sceneDiv);
			};
		}

		function adjustSceneIdsFrom(firstNode, diff) {
			// console.log("Adjusting IDs From a node:" + firstNode);
			var currNode = firstNode;
			var currId;
			while(currNode && currNode.getAttribute("class") && currNode.getAttribute("class").split(" ").indexOf("scene") > -1) {
				// console.log("This node IS a scene");
				currId = atoi(tokenizeByVBar(currNode.getAttribute("id")).pop());
				// console.log("It has ID=" + currId);
				currId += diff;
				// console.log("It's new ID is=" + currId);
				currNode.setAttribute("id", joinByVBar("scene", currId));
				// console.log("Set it's new ID!");
				currNode = currNode.nextSibling;
				// console.log("Moved to the next Node!");
			}
		}

		function makeSceneDeleter(sceneDiv) {
			return function (e) {
				e.preventDefault();
				removeScene(sceneDiv);
			};
		}

		function makeControllerName(name, type) {
			var rowDiv = document.createElement("div");
			rowDiv.setAttribute("class", "controllerNameRow");

			var namePara = document.createElement("p");
			namePara.setAttribute("class", "controllerName");
			namePara.innerHTML = name;

			rowDiv.appendChild(namePara);

			return rowDiv;
		}

		function getStateByButton(button) {
			var id = button.getAttribute("id");

			var tokens = tokenizeByVBar(id);
			var address = joinByVBar(tokens[0], tokens[1]);
			var soundName = joinByVBar(tokens[2], tokens[3]);

			setCurrentSoundState(soundName, story.getCurrentScene().getSoundState(address, soundName));
			console.log("Got sound into " + address + " " + soundName);
		}

		function setStateByButton(button) {
			// TODO: Add visual feedback (?)
			var id = button.getAttribute("id");

			var tokens = tokenizeByVBar(id);
			var address = joinByVBar(tokens[0], tokens[1]);
			//TODO: This depends on current soundName format. Generalise.
			var soundName = joinByVBar(tokens[2], tokens[3]);

			story.getCurrentScene().setSoundState(address, soundName, getCurrentSoundState(soundName));
		}

		function makeStateGetterSetter(button) {
			return function (e) {
				e.preventDefault();
				if (e.shiftKey)
					setStateByButton(button);
				else
					getStateByButton(button);
			};
		}

		function createSetStateButton(controllerName, paramName, soundName) {
			var button = document.createElement("button");
			button.setAttribute("class", "setStateButton");
			button.setAttribute("id", joinByVBar(controllerName, paramName, soundName));
			button.innerHTML = "SET";

			button.addEventListener("click", makeStateGetterSetter(button));

			return button;
		}

		function clearAllStateSetters() {
			// TODO: IMPORTANT Handle crazy memory leaks! (I think)
			var containers = document.getElementsByClassName("buttonContainer");
			var i;
			for (i = 0; i < containers.length; i++) {
				while (containers[i].hasChildNodes())
					containers[i].removeChild(containers[i].lastChild);
			}
		}

		// Assumes sound has been added at the end
		function populateStateSettersBySound(soundName) {
			var containers = document.getElementsByClassName("buttonContainer");
			var i;
			for (i = 0; i < containers.length; i++) {
				var tokens = tokenizeByVBar(containers[i].getAttribute("id"));
				var button = createSetStateButton(tokens[0], tokens[1], soundName);
				containers[i].appendChild(button);
			}
		}

		function removeStateSettersBySound(soundName) {
			var buttons = document.getElementsByClassName("setStateButton");
			var i;
			for (i = 0; i < buttons.length; i++) {
				var button = buttons[i];
				var id = button.getAttribute("id");
				var tokens = tokenizeByVBar(id);

				//TODO: This depends on current soundName format. Generalise.
				var currentSoundName = joinByVBar(tokens[2], tokens[3]);

				if (currentSoundName === soundName) {
						button.parentNode.removeChild(button);
				}
			}
		}

		function populateStateSettersByContainer(buttonContainer, controllerName, paramName) {
			if (!story.getCurrentScene())
				return;

			var soundNames = story.getCurrentScene().getSoundNames();
			var i;
			for (i = 0; i < soundNames.length; i++) {
				var button = createSetStateButton(controllerName, paramName, soundNames[i]);
				buttonContainer.appendChild(button);
			}
		}

		function makeControllerParamRow(controllerName, paramName, paramWords) {
			console.log("Called makeControllerParamRow:");
			printArr(arguments);
			var row = document.createElement("div");
			row.setAttribute("class", "controllerParamRow");
			row.setAttribute("id", joinByVBar(controllerName, paramName));

			var nameDiv = document.createElement("div");
			nameDiv.setAttribute("class", "controllerParamRowName");

			nameDiv.innerHTML = paramWords;
			row.appendChild(nameDiv);

			var buttonContainer = document.createElement("div");
			buttonContainer.setAttribute("class", "buttonContainer");
			buttonContainer.setAttribute("id", joinByVBar(controllerName, paramName, "buttonContainer"));
			row.appendChild(buttonContainer);
			populateStateSettersByContainer(buttonContainer, controllerName, paramName);

			return row;
		}

		function makeRangeParamRows(name) {
			var container = document.createElement("div");
			container.setAttribute("class", "controllerParamContainer");

			var minDiv = makeControllerParamRow(name, "min", "Min");
			var maxDiv = makeControllerParamRow(name, "max", "Max");
			container.appendChild(minDiv);
			container.appendChild(maxDiv);

			return container;
		}

		function makeNStateParamRows(name, num) {
			var container = document.createElement("div");
			container.setAttribute("class", "controllerParamContainer");

			var i;
			for (i = 0; i < num; i++) {
				var stateRow = makeControllerParamRow(name, i, "State " + i); //Could make the "words" part 1-based instead
				container.appendChild(stateRow);
			}

			return container;
		}

		function makeControllerParamRows(name, type, args) {
			console.log("Called makeControllerParamRows:");
			printArr(arguments);
			switch (type) {
				case "range":
					return makeRangeParamRows(name);
				case "nState":
					return makeNStateParamRows(name, args.numStates);
				default:
					console.log("Invalid type!");
			}
		}

		function makeControllerBlock(name, type, args) {
			console.log("Called makeControllerBlock:");
			printArr(arguments);
			var blockDiv = document.createElement("div");
			blockDiv.setAttribute("class", "controllerBlock");
			blockDiv.setAttribute("id", name);

			var nameDiv = makeControllerName(name, type);
			blockDiv.appendChild(nameDiv);

			var paramRows = makeControllerParamRows(name, type, args);
			blockDiv.appendChild(paramRows);

			return blockDiv;
		}

		function addNewSound(soundModel) {
			if (!story.getCurrentScene())
				return;

			// TODO: Sanitize
			// Note: Scene does NOT care about the models
			var soundName = story.getCurrentScene().addSound(soundModel);
			selectSceneById(story.getCurrentSceneId());
			elements.newSoundNameField.value = "";
		}

		function deleteSoundByButton(button) {
			var tokens = tokenizeByVBar(button.getAttribute("id"));
			var soundName = joinByVBar(tokens[0], tokens[1]);
			story.getCurrentScene().removeSoundByName(soundName);
			var soundBox = elem(joinByVBar(soundName, "soundBox"));
			soundBox.parentNode.removeChild(soundBox);

			removeStateSettersBySound(soundName);
		}

		function makeSoundDeleter(button) {
			return function (e) {
				e.preventDefault();
				deleteSoundByButton(button);
			};
		}

		function makeSoundBox(name) {
			var soundDiv = document.createElement("div");
			soundDiv.setAttribute("class", "sound");
			soundDiv.setAttribute("id", joinByVBar(name, "soundBox"));

			soundDiv.innerHTML = name;

			var deleteButton = document.createElement("button");
			deleteButton.setAttribute("class", "soundDelete");
			deleteButton.setAttribute("id", joinByVBar(name, "delete"));
			deleteButton.addEventListener("click", makeSoundDeleter(deleteButton));
			deleteButton.innerHTML = "X";
			soundDiv.appendChild(deleteButton);

			return soundDiv;
		}

		function drawSoundList() {
			if (!story.getCurrentScene())
				return;

			var soundNames = story.getCurrentScene().getSoundNames();
			var i;
			for (i = 0; i < soundNames.length; i++) {
				elements.soundList.appendChild(makeSoundBox(soundNames[i]));
			}
		}

		function clearSoundList() {
			while (elements.soundList.hasChildNodes()) {
				elements.soundList.removeChild(elements.soundList.lastChild);
			}
		}

		function redrawSoundList() {
			clearSoundList();
			drawSoundList();
		}

		function drawControllerEditors() {
			var editorDiv = elements.controllerElementParams;
			var x;
			for (x in controllerModel.interface) {
				if (controllerModel.interface.hasOwnProperty(x)) {
					var name = x;
					var type = controllerModel.interface[x].eventType;
					var args = {};
					if (controllerModel.interface[x].hasOwnProperty("numStates"))
						args.numStates = controllerModel.interface[x].numStates;

					editorDiv.appendChild(makeControllerBlock(name, type, args));
				}
			}
		}

		function redrawStateSetters() {
			clearAllStateSetters();

			var soundNames = story.getCurrentScene().getSoundNames();

			var i;
			for (i = 0; i < soundNames.length; i++) {
				populateStateSettersBySound(soundNames[i]);
			}
		}

		function drawSceneEditor() {
			drawSoundList();
			drawControllerEditors();
		}

		function redrawSceneEditor() {
			redrawSoundList();
			redrawStateSetters();
		}

		function newSoundHandler() {
			var model = elements.newSoundNameField.value;
			addNewSound(model);
		}

		function saveCurrentStory(storyName) {
			var data = {
				story: JSON.stringify(story.getStoryObj()),
				name: storyName
			};
			console.log("Saving story:");
			console.log(story.getStoryObj());

			var failCb = function () {
				alert("Whoops! Couldn't save it");
			};

			var successCb = function () {
				alert("Story saved!");
			};

			$.post("/saveStory", data)
			.done(function (res) {
				if (res)
					successCb();
				else
					failCb();
			})
			.fail(failCb);
		}

		function saveStoryHandler() {
			var storyName = elements.saveStoryNameField.value;
			saveCurrentStory(storyName);
		}

		function cleanup() {
			closeSliderBoxes();
		}

		function initWelcomeView() {
			function loadController() {
				var controllerModelName = elements.controllerInput.value;
				console.log("Loading controller " + controllerModelName);
				disable("loadControllerButton");
				disable("controllerInput");

				function successCb(res) {
					initAuthorView(res);
				}

				function failCb() {
					alert("Nope! Cant't load that");
					elements.controllerInput.value = "";
					enable("loadControllerButton");
					enable("controllerInput");
					elements.controllerInput.focus();
				}

				$.get("/loadController", {name: controllerModelName})
				.done(function (res) {
					if (res)
						successCb(res);
					else
						failCb();
				})
				.fail(failCb);
			}

			enable("loadControllerButton");
			enable("controllerInput");
			elements.controllerInput.focus();
			elements.loadControllerButton.addEventListener("click", loadController);
		}

		function initAuthorView(model) {
			hide("welcomeContainer");
			show("authorContainer");
			setController(model);
			story = Story(controllerModel);
			drawSceneEditor();
			elements.newSceneButton.addEventListener("click", addNewScene);
			elements.newSoundButton.addEventListener("click", newSoundHandler);
			elements.saveStoryButton.addEventListener("click", saveStoryHandler);
			window.onbeforeunload = cleanup;
		}

		mapElementsToIds();

		$(initWelcomeView);

		console.log("Completed loading author.js");
	}
);
