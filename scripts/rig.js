require.config({
	paths: {
		"jsaSound": "../jsaSound"
	}
});

define(
["require", "sceneControlHandler"],
	function (require, m_handler) {
		var sceneMapping = {
			models: ["jsaRSBeatSet", "jsaMetaMic2"],
			handlers: {
				pitch: {
					type: "range",
					targets: [
						{
							model: "jsaRSBeatSet",
							parameter: "Gain"
						},
						{
							model: "jsaMetaMic2",
							parameter: "Gain"
						}
					]
				},
				roll: {
					type: "range",
					targets: [
						{
							model: "jsaRSBeatSet",
							parameter: "Rate"
						}
					]
				},
				toggle: {
					type: "play_stop",
					targets: [
						{
							model: "jsaRSBeatSet",
							parameter: "Play/Stop"
						}
					]
				},
				dummyTwoState: {
					// can be generalised to multiple states
					type: "twoState",
					// targets is a 2-d array of target objects:
					// targets[0] is one state, targets[1] is the other.
					targets: [
						[
							{
								model: "jsaMetaMic2",
								parameter: "DryWet",
								// IMPORTANT NOTE: this value is passed to setParamNorm, so it must be between 0 to 1;
								defaultValue: 0,
								defaultState: "play"
							}
						],
						[
							{
								model: "jsaMetaMic2",
								parameter: "DryWet",
								defaultValue: 1
							}
						]
					]
				},


				sceneChange: {
					type: "scene_change"
				}


			}
		};

		var nullScene = {
			models: [],
			handlers: {
				sceneChange: {
					type: "scene_change"
				}
			}
		};


		var sceneList = [nullScene, sceneMapping];
		var currentSceneNum=0;
				//var utils = 3;
		return sceneList;
	}
);