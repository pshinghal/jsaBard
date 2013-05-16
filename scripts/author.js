define(
	["controllerModel", "handlerModel", "Story"],
	function (controllerModel, handlerModel, Story) {
		var nextSceneId = 0;
		var nextHandlerContentItemId = 0;
		var nextModelId = 0;

		var elemIds = {
			scenesDiv: "scenes",
			descriptionDiv: "description",
			handlerContentsDiv: "handlerContents",
			modelsDiv: "models",
			newSceneButton: "newScene",
			newHandlerContentItemButton: "newHandlerContentItem",
			newModelButton: "newModel"
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

		//===============
		// DOM functions
		//===============

		function getNewScene() {
			var nextSceneId = story.getNextSceneId();
			var sceneDiv = document.createElement("div");
			sceneDiv.setAttribute("class", "scene");
			sceneDiv.setAttribute("id", "scene/" + nextSceneId);

			var pDiv = document.createElement("p");
			pDiv.innerHTML = "Scene " + nextSceneId;
			pDiv.addEventListener("click", makeSceneSelector(pDiv));
			sceneDiv.appendChild(pDiv);

			var deleteButton = document.createElement("button");
			deleteButton.innerHTML = "Delete";
			deleteButton.setAttribute("class", "deleteScene");
			deleteButton.addEventListener("click", makeSceneDeleter(deleteButton));
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
			console.log("Current Adtive ID = " + currSceneId);
			if (currSceneId > -1)
				removeActive(elem("scene/" + currSceneId));
			setActive(sceneNode);
			var sceneId = atoi(sceneNode.getAttribute("id").split("/").pop());
			console.log("This scene has ID=" + sceneId);
			story.setCurrentScene(sceneId);
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

		function makeSceneSelector(node) {
			return function () {
				selectSceneByNode(node);
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

		function makeSceneDeleter(button) {
			return function (e) {
				e.preventDefault();
				removeSceneByButton(button);
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
		}*/

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
			// TODO: Change this to the "ByButton" style
			deleteButton.addEventListener("click", makeHandlerContentItemDeleter(nextModelId));
			modelDiv.appendChild(deleteButton);

			// Add horizontal rule at the end
			modelDiv.appendChild(document.createElement("hr"));

			nextModelId++;

			return modelDiv;
		}

		mapElementsToIds();

		elements.newSceneButton.addEventListener("click", addNewScene);
		elements.newHandlerContentItemButton.addEventListener("click", addNewHandlerContentItem);
	}
);