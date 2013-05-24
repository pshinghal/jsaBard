define(
	["controllerModel", "Story"],
	function (controllerModel, Story) {
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
		var nextHandlerContentItemId = 0;
		var nextModelId = 0;

		// TODO: Re-populate and use in the code
		var elemIds = {
			scenesDiv: "scenes",
			descriptionDiv: "description",
			// handlerContentsDiv: "handlerContents",
			sceneEditorDiv: "sceneEditor",
			modelsDiv: "models",
			newSceneButton: "newScene",
			newHandlerContentItemButton: "newHandlerContentItem",
			newModelButton: "newModel",
			newSoundButton: "newSound",
			newSoundNameField: "newSoundName"
		};

		var story = Story();
		var currSceneNumber = 0;

		var elements = {};

		function elem(elemName) {
			return document.getElementById(elemName);
		}

		function atoi(str) {
			return parseInt(str, 10);
		}

		function setActive(node) {
			var currentClass = node.getAttribute("class").trim().split(" ");
			if (currentClass.indexOf("active") > -1)
				return;
			currentClass.push("active");
			node.setAttribute("class", currentClass.join(" "));
		}

		function removeActive(node) {
			var currentClass = node.getAttribute("class").trim().split(" ");
			var pos = currentClass.indexOf("active");
			if (pos == -1)
				return;
			currentClass.splice(pos, 1);
			node.setAttribute("class", currentClass.join(" "));
		}

		function mapElementsToIds() {
			var x;
			for (x in elemIds) {
				elements[x] = elem(elemIds[x]);
			}
		}

		//TODO: Implement with checked sliderBox, etc.
		function getCurrentSoundState(soundName) {
			return null;
		}

		//===============
		// DOM functions
		//===============

		function getNewScene() {
			var nextSceneId = story.getNextSceneId();
			console.log("Scene id is " + nextSceneId);
			var sceneDiv = document.createElement("div");
			sceneDiv.setAttribute("class", "scene");
			sceneDiv.setAttribute("id", "scene/" + nextSceneId);

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
			var scenes = elements.scenesDiv;
			scenes.insertAdjacentElement("beforeend", sceneNode);
			scenes.insertAdjacentElement("beforeend", temp);
		}

		function addNewScene() {
			console.log("Adding new scene");
			appendScenes(getNewScene());
			story.addNewScene();
		}

		// REDUCES subsequent nodes
		function removeScene(sceneNode) {
			var sceneId = atoi(sceneNode.getAttribute("id").split("/").pop());
			console.log("This scene's ID is " + sceneId);
			var nextNode = sceneNode.nextSibling;
			sceneNode.parentNode.removeChild(sceneNode);

			adjustSceneIdsFrom(nextNode, -1);
			// TODO: Remove Everything else attached to this scene

			story.removeScene(sceneId);
		}

		function removeSceneById(id) {
			console.log("Removing scene with ID " + id);
			removeScene(elem("scene/" + id));
		}

		function removeSceneByButton(button) {
			console.log("Starting with node:");
			console.log(button);
			var currNode = button;
			while (currNode && (!currNode.getAttribute("class") || currNode.getAttribute("class").split("/")[0] !== "scene"))
				currNode = currNode.parentNode;
			console.log("Bubbled up to node:");
			console.log(currNode);
			removeScene(currNode);
		}

		function selectScene(sceneNode) {
			console.log("Selecting");
			console.log(sceneNode);
			var currSceneId = story.getCurrentSceneId();
			console.log("Current Active ID = " + currSceneId);
			if (currSceneId > -1)
				removeActive(elem("scene/" + currSceneId));
			setActive(sceneNode);
			var sceneId = atoi(sceneNode.getAttribute("id").split("/").pop());
			console.log("This scene has ID=" + sceneId);
			story.setCurrentScene(sceneId);
			redrawSceneEditor();
			console.log("Set Story's current scene to " + sceneId);
		}

		function selectSceneById(id) {
			console.log("Selecting by ID " + id);
			selectScene(elem("scene/" + id));
		}

		function selectSceneByNode(node) {
			var currNode = node;
			while (currNode && (!currNode.getAttribute("class") || currNode.getAttribute("class").split("/")[0] !== "scene"))
				currNode = currNode.parentNode;
			selectScene(currNode);
		}

		function makeSceneSelector(sceneDiv) {
			// var id = sceneDiv.getAttribute("id").trim().split("/")[1];
			return function (e) {
				e.preventDefault();
				selectScene(sceneDiv);
			};
		}

		function adjustSceneIdsFrom(firstNode, diff) {
			console.log("Adjusting IDs From a node:" + firstNode);
			var currNode = firstNode;
			var currId;
			while(currNode && currNode.getAttribute("class") && currNode.getAttribute("class").split(" ").indexOf("scene") > -1) {
				console.log("This node IS a scene");
				currId = atoi(currNode.getAttribute("id").split("/").pop());
				console.log("It has ID=" + currId);
				currId += diff;
				console.log("It's new ID is=" + currId);
				currNode.setAttribute("id", "scene/" + currId);
				console.log("Set it's new ID!");
				currNode = currNode.nextSibling;
				console.log("Moved to the next Node!");
			}
		}

		function makeSceneDeleter(sceneDiv) {
			// var id = sceneDiv.getAttribute("id").trim().split("/")[1];
			return function (e) {
				e.preventDefault();
				removeScene(sceneDiv);
			};
		}

/*
		function getNewHandlerContentItem() {
			var hDiv = document.createElement("div");
			hDiv.setAttribute("class", "handlerContentItem");
			hDiv.setAttribute("id", "handlerContentItem/" + nextHandlerContentItemId);

			// TODO: Replace with actual content-adders
			var pDiv = document.createElement("p");
			pDiv.innerHTML = "Handler Item " + nextHandlerContentItemId + " will be editable soon";
			hDiv.appendChild(pDiv);

			var deleteButton = document.createElement("button");
			deleteButton.innerHTML = "Delete";
			deleteButton.setAttribute("class", "deleteHandlerContentItem");
			deleteButton.setAttribute("id", "button/handlerContentItem/" + nextHandlerContentItemId);
			deleteButton.addEventListener("click", makeHandlerContentItemDeleter(nextHandlerContentItemId));
			hDiv.appendChild(deleteButton);

			// Add horizontal rule at the end
			hDiv.appendChild(document.createElement("hr"));

			nextHandlerContentItemId++;

			return hDiv;
		}

		function appendHandlerContentItems(handlerContentItemNode) {
			var temp = elements.newHandlerContentItemButton;
			temp.parentNode.removeChild(temp);
			var handlerContents = elements.handlerContentsDiv;
			handlerContents.insertAdjacentElement("beforeend", handlerContentItemNode);
			handlerContents.insertAdjacentElement("beforeend", temp);
		}

		function addNewHandlerContentItem() {
			appendHandlerContentItems(getNewHandlerContentItem());
		}

		function removeHandlerContentItem(handlerContentItemNode) {
			sceneNode.parentNode.removeChild(handlerContentItemNode);
			// TODO: Remove Everything else attached to this scene
		}

		function removeHandlerContentItemById(id) {
			removeScene(elem("handlerContentItem/" + id));
		}

		// TODO: Change this to the "ByButton" styl
		function makeHandlerContentItemDeleter(id) {
			return function () {
				removeHandlerContentItemById(id);
			};
		}

		function getNewModel() {
			var modelDiv = document.createElement("div");
			modelDiv.setAttribute("class", "model");
			modelDiv.setAttribute("id", "model/" + nextModelId);

			// TODO: Replace with text box for new model
			var pDiv = document.createElement("p");
			pDiv.innerHTML = "Model " + nextModelId;
			modelDiv.appendChild(pDiv);

			var deleteButton = document.createElement("button");
			deleteButton.innerHTML = "Delete";
			deleteButton.setAttribute("class", "deleteModel");
			deleteButton.addEventListener("click", makeHandlerContentItemDeleter(nextModelId));
			modelDiv.appendChild(deleteButton);

			// Add horizontal rule at the end
			modelDiv.appendChild(document.createElement("hr"));

			nextModelId++;

			return modelDiv;
		}*/

		function makeControllerName(name, type) {
			var rowDiv = document.createElement("div");
			rowDiv.setAttribute("class", "controllerNameRow");

			var namePara = document.createElement("p");
			namePara.setAttribute("class", "controllerName");
			namePara.innerHTML = name;

			rowDiv.appendChild(namePara);

			return rowDiv;
		}

		function setStateByButton(button) {
			// TODO: Add visual feedback (?)
			var id = button.getAttribute("id");

			var tokens = id.trim().split("/");
			var address = tokens[0] + "/" + tokens[1];
			//TODO: This depends on current soundName format. Generalise.
			var soundName = tokens[2] + "/" + tokens[3];

			story.getCurrentScene().setSoundState(address, soundName, getCurrentSoundState(soundName));
		}

		function makeStateSetter(button) {
			return function (e) {
				e.preventDefault();
				setStateByButton(button);
			};
		}

		function createSetStateButton(controllerName, paramName, soundName) {
			var button = document.createElement("button");
			button.setAttribute("class", "setStateButton");
			button.setAttribute("id", controllerName + "/" + paramName + "/" + soundName);
			button.innerHTML = "SET";

			button.addEventListener("click", makeStateSetter(button));

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
				var tokens = containers[i].getAttribute("id").trim().split("/");
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
				var tokens = id.trim().split("/");

				//TODO: This depends on current soundName format. Generalise.
				var currentSoundName = tokens[2] + "/" + tokens[3];

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
			row.setAttribute("id", controllerName + "/" + paramName);

			var nameDiv = document.createElement("div");
			nameDiv.setAttribute("class", "controllerParamRowName");

			var namePar = document.createElement("p");
			namePar.innerHTML = paramWords;
			nameDiv.appendChild(namePar);
			row.appendChild(nameDiv);

			var buttonContainer = document.createElement("div");
			buttonContainer.setAttribute("class", "buttonContainer");
			buttonContainer.setAttribute("id", controllerName + "/" + paramName + "/buttonContainer");
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
			elem("soundList").appendChild(makeSoundBox(soundName));
			populateStateSettersBySound(soundName);
		}

		function deleteSoundByButton(button) {
			var tokens = button.getAttribute("id").trim().split("/");
			var soundName = tokens[0] + "/" + tokens[1];
			story.getCurrentScene().removeSoundByName(soundName);
			var soundBox = elem(soundName + "/soundBox");
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
			soundDiv.setAttribute("id", name + "/soundBox");

			var namePar = document.createElement("p");
			namePar.innerHTML = name;
			soundDiv.appendChild(namePar);

			var deleteButton = document.createElement("button");
			deleteButton.setAttribute("class", "soundDelete");
			deleteButton.setAttribute("id", name + "/delete");
			deleteButton.addEventListener("click", makeSoundDeleter(deleteButton));
			deleteButton.innerHTML = "Remove";
			soundDiv.appendChild(deleteButton);

			return soundDiv;
		}

		function drawSoundList() {
			var listDiv = elem("soundList");

			if (!story.getCurrentScene())
				return;

			var soundNames = story.getCurrentScene().getSoundNames();
			var i;
			for (i = 0; i < soundNames.length; i++) {
				listDiv.appendChild(makeSoundBox(soundNames[i]));
			}
		}

		function clearSoundList() {
			var listDiv = elem("soundList");
			while (listDiv.hasChildNodes()) {
				listDiv.removeChild(listDiv.lastChild);
			}
		}

		function redrawSoundList() {
			clearSoundList();
			drawSoundList();
		}

		function drawControllerEditors() {
			var editorDiv = elem("controllerElementParams");
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
			// var controllerBox = elem("controllerElementParams");
			// var soundsBox = elem("soundList");

			// while (controllerBox.hasChildNodes())
			// 	controllerBox.removeChild(controllerBox.lastChild);
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

		mapElementsToIds();

		drawSceneEditor();
		elements.newSceneButton.addEventListener("click", addNewScene);
		//elements.newHandlerContentItemButton.addEventListener("click", addNewHandlerContentItem);
		elements.newSoundButton.addEventListener("click", newSoundHandler);
		console.log("Completed loading author.js");
	}
);
