define(
	["controllerModel", "handlerModel"],
	function (controllerModel, handlerModel) {
		var nextSceneId = 1;
		var nextHandlerContentItemId = 1;

		var elemIds = {
			scenesDiv: "scenes",
			descriptionDiv: "description",
			handlerContentsDiv: "handlerContents",
			newSceneButton: "newScene",
			newHandlerContentItemButton: "newHandlerContentItem"
		};

		var elements = {};

		function elem(elemName) {
			return document.getElementById(elemName);
		}

		function mapElementsToIds() {
			var x;
			for (x in elemIds) {
				elements[x] = elem(elemIds[x]);
			}
		}

		function getNewScene() {
			var sceneDiv = document.createElement("div");
			sceneDiv.setAttribute("class", "scene");
			sceneDiv.setAttribute("id", "scene/" + nextSceneId);

			var pDiv = document.createElement("p");
			pDiv.innerHTML = "Scene " + nextSceneId;
			sceneDiv.appendChild(pDiv);

			var deleteButton = document.createElement("button");
			deleteButton.innerHTML = "Delete";
			deleteButton.setAttribute("class", "deleteScene");
			deleteButton.setAttribute("id", "button/scene/" + nextSceneId);
			deleteButton.addEventListener("click", makeSceneDeleter(nextSceneId));
			sceneDiv.appendChild(deleteButton);

			// Add horizontal rule at the end
			sceneDiv.appendChild(document.createElement("hr"));

			nextSceneId++;

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
		}

		function removeScene(sceneNode) {
			sceneNode.parentNode.removeChild(sceneNode);
			// TODO: Remove Everything else attached to this scene
		}

		function removeSceneById(id) {
			removeScene(elem("scene/" + id));
		}

		function makeSceneDeleter(id) {
			return function () {
				removeSceneById(id);
			};
		}

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

		function makeHandlerContentItemDeleter(id) {
			return function () {
				removeHandlerContentItemById(id);
			};
		}

		mapElementsToIds();

		elements.newSceneButton.addEventListener("click", addNewScene);
		elements.newHandlerContentItemButton.addEventListener("click", addNewHandlerContentItem);
	}
);