define(
	["Scene"],
	function (Scene) {
		return function () {
			var myInterface = {};

			var story = [];
			var currentScene = null;
			var currentSceneId = -1;

			var nextSceneId = 0;
			myInterface.getNextSceneId = function () {
				return nextSceneId;
			};

			function getNewScene() {
				return Scene();
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

			myInterface.getStoryArr = function () {
				var i;
				var arr = [];
				for (i = 0; i < story.length; i++) {
					arr.push(story[i].getSceneObj());
				}

				return arr;
			};

			return myInterface;
		};
	}
);