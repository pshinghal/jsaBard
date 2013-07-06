/* ---------------------------------------------------------------------------------------
This jsaSound Code is distributed under LGPL 3
Copyright (C) 2012 National University of Singapore
Inquiries: director@anclab.org

This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.
This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNULesser General Public License for more details.
You should have received a copy of the GNU General Public License and GNU Lesser General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
------------------------------------------------------------------------------------------*/
// Kumar Subramanian (http://nishabdam.com) is the Guru responsible for the party node.js architecture! -->
// Modified, adapted, and further messed with by:
//	Lonce Wyse, July 2010
//------------------------------
// This is where we set up the responses to incoming control messages.

define(
	[ "require", "jsaSound/jsaCore/sliderBox", "jquery", "controllerModel", "Story", "/socket.io/socket.io.js"],
	// TODO: init and initScene need to be cleaned up/combined.
	// Doesn't look nice that both async inits are executed in a non-daisy-chained manner.
	function (require, makeSliderBox, $, controllerModel, Story) {
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

		function initStory (storyArr) {
			story = Story();
			story.setStoryArr(storyArr);
			if (storyArr.length <= 0) {
				console.log("This story has no scenes!");
				return;
			}
			numScenes = storyArr.length;
			initMessaging();
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

		function defaultHandler(msg) {
			console.error(JSON.stringify(msg));
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

		function dispatch(msg) {
			var i, targetModelName, targetParamName, targetVal;
			// (handlers[msg.selector] || defaultHandler)(msg); // cool javascript pattern!!!! 
			var handlerName = msg.id;
			var handler = m_scene.handlers[handlerName];

			if (! handler){
				//console.log("message " + handlerName + " not used in this scene");
				return;
			}

			// TODO: Check that the parameter and the message have the same (or a compatible) TYPE
			switch (handler.type) {
			// TODO: Standardise the "val" part
			case "range":
				for (i = 0; i < handler.targets.length; i += 1) {
					targetModelName = handler.targets[i].model;
					targetParamName = handler.targets[i].parameter;
					// console.log("got range message, targetModelName = " + targetModelName + ", and with soundModels = " + soundModels+ ", and soundModels[targetModelName] = " + soundModels[targetModelName]);
					soundModels[targetModelName].setParamNorm(targetParamName, msg.val);
				}
				break;

			//This is a special type.
			//TODO: Have a more "standardised" version of this, too.
			//Well, in a way, both are special types. Anything other than range and play/stop is unlikely to exist.
			case "play_stop":
				for (i = 0; i < handler.targets.length; i += 1) {
					targetModelName = handler.targets[i].model;
					play_stop(targetModelName);
				}
				break;

			case "twoState":
				console.log("Two state !!!");
				currState[handlerName] = (currState[handlerName] + 1) % 2;
				var targetState = currState[handlerName];
				// console.log("Setting state " + targetState);
				for (i = 0; i < handler.targets[targetState].length; i += 1) {
					targetModelName = handler.targets[targetState][i].model;
					targetParamName = handler.targets[targetState][i].parameter;
					// If no value has been passed, the model will be updated with the dafault value
					// IMPORTANT NOTE: This specifies an EXACT way in which the value must be passed to control a twoState type function.
					// MAY NEED TO BE CHANGED
					targetVal = (msg.val && msg.val[targetModelName] && msg.val[targetModelName][targetParamName]) ? msg.val : handler.targets[targetState][i].defaultValue;
					soundModels[targetModelName].setParamNorm(targetParamName, targetVal);
				}
				break;

			case "scene_change":
				console.log("sceneChange!");
				currentScene = (currentScene+1)%numScenes;
				setScene(rig[currentScene]);
				break;

			default:
				console.log("Bad parameter type!");
			}
		}

		var initMessaging = function () {
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

			var partyName = makeParty(3);

			var socket = io.connect(window.jsaHost);
			socket.on("connect", function () {
				console.log("Synth connected to server with party name: " + partyName);
				var registerMessage = {
					party: partyName.replace(/ /g, ''),
					type: "synth"
				};
				socket.emit("register", registerMessage);
				socket.on("confirm", function (data) {
					if (data.party === registerMessage.party) {
						partyNameElem.innerHTML = partyName;
						socket.on("message", function (msgStr) {
							dispatch(JSON.parse(msgStr));
						});
					} else {
						partyNameElem.innerHTML = "Failed!";
					}
				});
			});
		};

		function loadStory() {
			// TODO: (MAYBE) Ensure another story isn't already loaded
			var storyName = elem("storyName").value;

			function goodCb(res) {
				alert("Story loaded!");
				console.log("Response: " + JSON.stringify(res));
				elem("loadStory").setAttribute("disabled");
				elem("storyName").setAttribute("disabled");
				initStory(res);
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
