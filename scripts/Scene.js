define(
	["controllerModel", "handlerModel"],
	function (controllerModel, handlerModel) {
		return function () {
			var myInterface = {};

			var temp;

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

			scene.models = [];
			myInterface.addModel = function (modelName) {
				if (scene.models.indexOf(modelName) > -1)
					return;
				scene.models.push(modelName);
			};
			myInterface.removeModel = function (modelName) {
				var pos = scene.models.indexOf(modelName);
				if (pos === -1)
					scene.models.splice(pos, 1);
			};
			myInterface.getModels = function () {
				return scene.models;
			};

			scene.handlers = [];
			for (temp in controllerModel) {
				if (controllerModel.hasOwnProperty(temp)) {
					scene.handlers[temp] = {};
					scene.handlers[temp].type = controllerModel[temp];
					//TODO: Populate dynamically instead
					scene.handlers[temp].targets = [];

					// console.log("Added to sceneHandler " + temp + " a type of " + controllerModel[temp]);
				}
			}

			function getItemModel(handlerType, item) {
				console.log("called getItemModel with " + handlerType + ": " + item);
				var currItem = item.split("/");
				var itemWord = currItem.shift();
				var itemModel = handlerModel[handlerType].content[itemWord];
				while ((itemWord = currItem.shift()) && itemModel) {
					console.log("Getting model of word " + itemWord);
					itemModel = itemModel.content[itemWord];
				}
				return itemModel;
			}

			function getItemArray(handler, item) {
				var itemList = item.split("/");
				var arr = scene.handlers[handler];
				var currItem;
				while ((currItem = itemList.shift()))
					arr = arr[currItem];
				return arr;
			}

			function isItemAppendableArray(handlerType, item) {
				var itemModel = getItemModel(handlerType, item);
				// If that item doesn't exist, do nothing
				if (!itemModel)
					return false;
				if (!itemModel.isAppendable)
					return false;

				// TODO: Extend support to items other than Arrays (?)
				if (itemModel.type.split("/")[0] !== "Array")
					return false;

				return true;
			}

			// TODO: Add usage of limit in array "length", as specified in model
			myInterface.addHandlerContentItem = function (handler, item, value) {
				// IF the handler doesn't exist, do nothing
				if (!scene.handlers[handler])
					return false;
				var handlerType = scene.handlers[handler].type;

				if (!isItemAppendableArray(handlerType, item))
					return false;

				// TODO: Validate value (?)
				getItemArray(handler, item).push(value);
				return true;
			};

			myInterface.add = myInterface.addHandlerContentItem;

			myInterface.removeHandlerContentItem = function (handler, item, id) {
				// IF the handler doesn't exist, do nothing
				if (!scene.handlers[handler])
					return false;
				var handlerType = scene.handlers[handler].type;

				if (!isItemAppendableArray(handlerType, item))
					return false;

				getItemArray(handler, item).splice(id, 1);
				return true;
			};
			// myInterface.getHandler

			return myInterface;
		};
	}
);