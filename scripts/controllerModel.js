define(
	[],
	function () {
		//TODO: Add specific descriptions here. Append generic Handler descriptions TO that.
		var myControllerModel = {
			pitch: {
				type:"range"
			},
			roll: {
				type:"range"
			},
			toggle: {
				type:"play_stop"
			},
			dummyTwoState: {
				type:"nState",
				arg: {
					n: 2
				}
			},
			sceneChange: {
				type:"scene_change"
			}
		};
		return myControllerModel;
	}
);

/*
 * Model to follow:
 * [
 *   {
 *     paramioID: "<the name of the controller element>"
 *     eventType: "range" // or "nState"
 *     numStates: 2 // or other number
 *   }
 * ]
 */
