define(
	[],
	function () {
		var handlers = {};
		handlers.range = {
			"description": "This handler produces a range of values by interpolating between a 'minimum' and a 'maximum' state",
			"content": {
				"max": {
					"text": "Max",
					"type": "Array/ArrayArray/SoundStateArray"
				},
				"min": {
					"text": "Min",
					"type": "Array/ArrayArray/SoundStateArray"
				}
				//"targets": {
				//	"text": "Targets",
				//	"type": "Array/ObjectArray/TargetArray",
				//	"length": 0, // Default Size
				//	"isAppendable": true, // Implies it can grow
				//	"content": {
				//		"text": "Target",
				//		"type": "Object/Target",
				//		"content": {
				//			"model": "String/ModelName",
				//			"parameter": "String/ParamaterName"
				//		}
				//	}
				//}
			}
		};

		handlers.nState = {
			"description": "This handler switches between a discrete set of states",
			"content": {
				"states": {
					"text": "",
					// takes argument from controllerModel
					"length": "arg/n",
					"isAppendable": false,
					"content": {
						"text": "State",
						"type": "Array/ArrayArray/SoundStateArray"
					}
				}
			}
		};

		// handlers.play_stop = {
		// 	"description": "This handler triggers Play/Stop events",
		// 	"content": {
		// 		"targets": {
		// 			"text": "Targets",
		// 			"type": "Array/ObjectArray/TargetArray",
		// 			"length": 0, // Default Size
		// 			"isAppendable": true, // Implies it can grow
		// 			"content": {
		// 				"text": "Target",
		// 				"type": "Object/Target",
		// 				"content": {
		// 					"model": "String/ModelName"
		// 				}
		// 			}
		// 		}
		// 	}
		// };

		// handlers.twoState = {
		// 	"description": "This handler switches between two states. Each Target Set represents one state.",
		// 	"content": {
		// 		// TODO: Should these be called "States" instead?
		// 		"targetSets": {
		// 			"text": "TargetSets",
		// 			"type": "Array/ObjectArray/TargetArrayArray",
		// 			"length": 2,
		// 			"isAppendable": false,
		// 			"content": {
		// 				"targets": {
		// 					"text": "Targets",
		// 					"type": "Array/ObjectArray/TargetArray",
		// 					"length": 0, // Default Size
		// 					"isAppendable": true, // Implies it can grow
		// 					"content": {
		// 						"text": "Target",
		// 						"type": "Object/Target",
		// 						"content": {
		// 							"model": "String/ModelName",
		// 							"parameter": "String/ParamaterName",
		// 							// TODO: IMPORTANT: This may not always be an integer
		// 							"defaultValue": "Integer/ParameterValue",
		// 							//TODO: IMPORTANT: This MAY BE VERY WRONG
		// 							"defaultState": "String"
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// };

		handlers.scene_change = {
			//TODO: How does a "previous scene" handler fit in this equation?
			"description": "This handler advances the scene",
			"content": {
			}
		};

		return handlers;
	}
);