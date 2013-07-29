define(
	["Scene"],
	function (Scene) {
		return function (controllerModel) {
			//TODO: Handle the changing of currentScene and currentSceneId when scenes are deleted.
			var myInterface = {};

			var story = [];
			var currentScene = null;
			var currentSceneId = -1;

			var nextSceneId = 0;
			// Must be auto-generated when story is loaded from JSON

			myInterface.getNextSceneId = function () {
				return nextSceneId;
			};

			function getNewScene() {
				return Scene(controllerModel);
			}

			myInterface.addSceneAtEnd = function (newScene) {
				story.push(newScene);
				nextSceneId++;
			};

			// This may have a "pos" variable later, so that we can insert after the current, "active" scene
			myInterface.addScene = function (newScene) {
				this.addSceneAtEnd(newScene);
			};

			myInterface.addNewSceneAtEnd = function () {
				this.addScene(getNewScene());
			};

			myInterface.addNewScene = function () {
				this.addNewSceneAtEnd();
			};

			myInterface.removeScene = function (id) {
				story.splice(id, 1);
				nextSceneId--;
				if (id < currentSceneId)
					currentSceneId--;
				else if (id === currentSceneId)
					if (nextSceneId <= currentSceneId) {
						currentSceneId = nextSceneId - 1;
						currentScene = null;
					} else {
						this.setCurrentScene(currentSceneId);
					}
			};

			myInterface.setCurrentScene = function (id) {
				console.log("At Story: got setCurrentScene at " + id);
				console.log("ID has type " + typeof id);
				console.log(story);
				if (!story[id]) {
					console.log("BUT IT IS INVALID!!");
					return false;
				}
				currentSceneId = id;
				currentScene = story[id];
				return true;
			};

			myInterface.getCurrentSceneId = function () {
				return currentSceneId;
			};

			// We allow direct access to the scene's public members
			myInterface.getCurrentScene = function () {
				return currentScene;
			};

			myInterface.getStoryObj = function () {
				var i;
				var obj = {
					controller: controllerModel,
					scenes: []
				};
				for (i = 0; i < story.length; i++) {
					obj.scenes.push(story[i].getSceneObj());
				}

				return obj;
			};

			myInterface.setStoryScenes = function (scenes) {
				var i;
				for (i = 0; i < scenes.length; i++) {
					var temp = Scene(controllerModel);
					temp.setSceneObj(scenes[i]);
					this.addScene(temp);
				}
				nextSceneId = scenes.length;
			};

			return myInterface;
		};
	}
);