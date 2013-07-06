/* ---------------------------------------------------------------------------------------
This jsaSound Code is distributed under LGPL 3
Copyright (C) 2012 National University of Singapore
Inquiries: director@anclab.org

This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.
This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNULesser General Public License for more details.
You should have received a copy of the GNU General Public License and GNU Lesser General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
------------------------------------------------------------------------------------------*/
// Kumar Subramanian (http://nishabdam.com) is the Guru responsible for the party node.js architecture!
// Modified, adapted, and further messed with by:
//	Lonce Wyse, July 2010
// Re-done by Pallav Shinghal (http://pshinghal.com)

require.config({
	shim: {
		"socketio": {
			exports: "io"
		}
	},
	paths: {
		"jsaSound": "http://animatedsoundworks.com:8001/",
		"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min",
		"socketio": "/socket.io/socket.io"
	}
});

define(
	[ "require", "jsaSound/jsaCore/sliderBox", "jquery", "Story", "socketio"],
	function (require, makeSliderBox, $, Story, io) {
		var story = {};

		var sliderBoxes = {};
		var soundModelNames = [];
		var soundModels = {};

		var isPlaying = {};
		var currState = {};

		var numScenes;

		function elem(id) {
			return document.getElementById(id);
		}

		function tokenizeByVBar(s) {
			return s.trim().split("|");
		}

		function getSoundModelFromName(name) {
			return tokenizeByVBar(name)[0];
		}

		function initStory (storyObj, storyName) {
			story = Story(storyObj.controller);
			story.setStoryScenes(storyObj.scenes);
			if (storyObj.scenes.length <= 0) {
				console.log("This story has no scenes!");
				return;
			}
			numScenes = storyObj.scenes.length;
			initMessaging(storyName);
			setScene(0);
		}

		function setScene (sceneId) {
			console.log("Setting scene in handler to scene " + sceneId);
			story.setCurrentScene(sceneId);
			reloadSounds();
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

		function reloadSounds() {
			closeSliderBoxes();
			clearSliderBoxes();
			reloadSoundModels(loadSounds);
		}

		function reloadSoundModels(callback) {
			// Memory leak?
			soundModelNames = [];
			soundModels = {};
			if (!story.getCurrentScene())
				return;
			soundModelNames = story.getCurrentScene().getSoundModels();

			loadSoundModels(callback);
		}

		//Callbacks are optional
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
							console.log("Making slider box");
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

		function loadSounds() {
			initIsPlaying();
			loadSliderBoxes();
			initNStates();
			// There may be a need to initialise other types of handlers as well
			// Currently, other types will start with their default values from jsaSound
			// Later on, we could have them start with default values from the story. eg.
		}

		// Defaults all sounds to NOT PLAYING
		function initIsPlaying() {
			isPlaying = {};
			var soundList = story.getCurrentScene().getSoundNames();

			var i;
			for (i = 0; i < soundList.length; i++) {
				isPlaying[soundList[i]] = false;
			}
		}

		function loadSliderBoxes() {
			if (!story.getCurrentScene())
				return;
			var soundList = story.getCurrentScene().getSoundNames();

			var i;
			for (i = 0; i < soundList.length; i++) {
				var model = getSoundModelFromName(soundList[i]);
				//DANGER. May be incorrect.
				sliderBoxes[soundList[i]] = makeSliderBox(soundModels[model]());
			}
		}

		function setState(state) {
			var i, j;
			var soundList = story.getCurrentScene().getSoundNames();
			for (i = 0; i < soundList.length && i < state.length; i++) {
				var sliderBox = sliderBoxes[soundList[i]];
				var soundState = state[i];
				if (!sliderBox) {
					console.log("ERROR: There's no slider box for " + soundList[i]);
					continue;
				}
				for (j = 0; j < soundState.length; j++) {
					if (soundState[j].type === range)
						sliderBox.setParamNorm(soundState[j].name, soundState[j].value);
					else
						sliderBox.setParam(soundState[j].name, soundState[j].value);
				}
			}
		}

		function interpolateVals(low, high, weight) {
			return low + (weight * (high - low));
		}

		function interpolateStates(low, high, weight) {
			var newState = {};
			var i, j, k;
			for (i = 0; i < low.length && i < high.length; i++) {
				var lowSoundState = low[i];
				var highSoundState = high[i];
				newState.push([]);
				for (j = 0; j < lowSoundState.length; j++) {
					if (lowSoundState[j].type !== "range")
						continue;
					var lowName = lowSoundState[j].name;
					for (k = 0; k < highSoundState.length; k++) {
					// Inefficient, but safe
						var highName = highSoundState[k].name;
						if (lowName === highName) {
							newState[i].push({
								name: highName,
								type: highSoundState[k].type,
								value: interpolateVals(lowSoundState[j].value, highSoundState[k].value, weight)
							});
							break;
						}
					}
				}
			}
			return newState;
		}

		function initNStates() {
			var handlerName;
			var handlers = story.getCurrentScene().getSceneObj().handlers;
			var firstStateTargets;
			var i;
			for (handlerName in handlers) {
				if (handlers.hasOwnProperty(handlerName) && handlers[handlerName].type === "nState") {
					currState[handlerName] = 0;
					setState(handlers[handlerName].states[0]);
				}
			}
		}

		//TODO: (MAYBE) implement way of specifying whether we want to STOP or to RELEASE
		// This currently interfaces with the sliderBox, so play and release are no different. i.e. play() while playing is the same as release()
		// Keeping this at the moment, for possible future use.
		var play_stop = function (targetModelName) {
			console.log("Play/Stop " + targetModelName);
			if (soundModels[targetModelName] && playingP[targetModelName]) {
				// console.log("Yes, playing");
				// console.log(soundModels[targetModelName]);
				soundModels[targetModelName].release();
				// console.log("releasing sound");
				playingP[targetModelName] = false;
			} else {
				// console.log("Not playing");
				// console.log(soundModels[targetModelName]);
				soundModels[targetModelName].play();
				// console.log("playing sound");
				playingP[targetModelName] = true;
			}
		};

		function rangeMessageHandler(handler, value) {
			setState(interpolateStates(handler.min, handler.max, value));
		}

		function nStateMessageHandler(handler, value) {
			setState(handler.states[value]);
		}

		function sceneChangeMessageHandler(handler, value) {
			var sceneNum = Math.max(story.getCurrentSceneId() + 1, story.getNextSceneId() - 1); //Don't go beyond the last scene!
			setScene(sceneNum);
		}

		function defaultHandler(handlerName) {
			console.log("ERROR: Message handler for " + handlerName + " does not exist!");
		}

		var messageHandlers = {
			"range": rangeMessageHandler,
			"nState": nStateMessageHandler,
			"sceneChange": sceneChangeMessageHandler
		};

		function dispatch(msg) {
			var i, targetModelName, targetParamName, targetVal;
			var handlerName = msg.id;
			var handler = story.getCurrentScene().getSceneObj().handlers[handlerName];

			if (!handler) {
				console.log("ERROR: Handler " + handlerName + " does not exist!");
				return;
			}

			if (messageHandlers[handler.type])
				messageHandlers[handler.type](handler, msg.val);
			else
				defaultHandler(handlerName);
		}

		function initMessaging(storyName) {
			var partyDiv = elem("partySelector");
			partyDiv.removeAttribute("hidden");
			var partyNameElem = elem("partyName");

			var makeParty = (function () {
				var letters  = "abcdefghijklmnopqrstuvwxyz";
				var category = "vcccvcccvcccccvcccccvccccc";
				var consonants = "bcdfghjklmnpqrstvwxyz";
				var vowels = "aeiou";

				return function (n) {
					var result = [];
					var i, k, a1, a2, a3;
					for (i = 0; i < n; ++i) {
						k = Math.floor(Math.random() * letters.length);
						a1 = letters.charAt(k);
						a2 = vowels.charAt(Math.floor(Math.random() * vowels.length));
						a3 = consonants.charAt(Math.floor(Math.random() * consonants.length));

						if (category.charAt(k) === 'c') {
							// First letter is a consonant. Make the second
							// a vowel and the third a consonant.
							result.push(a1 + a2 + a3);
						} else {
							// First letter is a vowel. Make the second a consonant
							// and the third a vowel.
							result.push(a1 + a3 + a2);
						}
					}
					return result.join(' ');
				};
			}());

			function getMessageId(obj) {
				return obj.data[0];
			}

			// Works ONLY with one-piece values
			function getMessageVal(obj) {
				return obj.data[1];
			}

			var partyName = makeParty(3);

			var socket = io.connect(window.jsaHost);
			socket.on("connect", function () {
				console.log("Synth connected to server with party name: " + partyName);
				var registerMessage = {
					party: partyName.replace(/ /g, ''),
					type: "synth",
					story: storyName
				};
				socket.emit("register", registerMessage);
				socket.on("confirm", function (data) {
					if (data.party === registerMessage.party) {
						partyNameElem.innerHTML = partyName;
						socket.on("message", function (msgStr) {
							var msgObj = JSON.parse(msgStr);
							dispatch({
								id: getMessageId(msgObj),
								val: getMessageVal(msgObj)
							});
						});
					} else {
						partyNameElem.innerHTML = "Failed!";
					}
				});
			});
		}

		function loadStory() {
			// TODO: (MAYBE) Ensure another story isn't already loaded
			var storyName = elem("storyName").value;

			function goodCb(res) {
				alert("Story loaded!");
				console.log("Response: " + JSON.stringify(res));
				elem("loadStory").setAttribute("disabled");
				elem("storyName").setAttribute("disabled");
				initStory(res, storyName);
			}

			function badCb() {
				alert("Could not load story!");
			}

			$.get("/loadStory", {name: storyName})
			.done(function (res) {
				if (res)
					goodCb(res);
				else
					badCb();
			}).fail(badCb);
		}

		elem("loadStory").addEventListener("click", loadStory);
	}
);
