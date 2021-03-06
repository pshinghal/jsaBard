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
		"jsaSound": (function(){
			if (! window.document.location.hostname){
				alert("This page cannot be run as a file, but must be served from a server (e.g. animatedsoundworks.com:8001, or localhost:8001)." );
			}
				// jsaSound server is hardcoded to port 8001 (on the same server as jsaBard - or from animatedsoundworks)
				//LOCAL  var host = "http://"+window.document.location.hostname + ":8001";
				var host = "http://animatedsoundworks.com:8001";
				console.log("Will look for sounds served from " + host);
				return (host );
			})(),
		"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min",
		//LOCAL "jquery": "http://localhost:8000/scripts/jquery.min",
		"socketio": "/socket.io/socket.io"
	}
});

define(
	[ "require", "jsaSound/jsaCore/sliderBox", "jsaSound/jsaCore/config", "jquery", "Story", "socketio"],
	function (require, makeSliderBox, jsaSoundConfig, $, Story, io) {
		var story = {};

		var showSliderBoxesP = true;

		var soundServer = jsaSoundConfig.resourcesPath;

		var sliderBoxes = {};
		var soundModelNames = [];
		var soundModelFactories = {};

		var rawSoundModels = {};

		var isPlaying = {};
		var currState = {};

		var numScenes;

		function elem(id) {
			return document.getElementById(id);
		}

		function tokenizeByVBar(s) {
			return s.trim().split("|");
		}

		function getSMFactoryFromName(name) {
			return tokenizeByVBar(name)[0];
		}

		function fixController(model) {
			var controllerModel = {};
			controllerModel.interface = {};
			for (i = 0; i < model.interface.length; i++) {
				var x;
				var name = model.interface[i].paramioID;
				controllerModel.interface[name] = {};
				for (x in model.interface[i]) {
					if (model.interface[i].hasOwnProperty(x) && x != "paramioID") {
						controllerModel.interface[name][x] = model.interface[i][x];
					}
				}
			}
			return controllerModel;
		}

		function initStory (storyObj, storyName) {
			story = Story(fixController(storyObj.controller));
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
			rawSoundModels = {};
		}

		function closeSliderBoxes() {
			var x;
			for (x in sliderBoxes) {
				if (sliderBoxes.hasOwnProperty(x)) {
					sliderBoxes[x].close();
				}
			}

			for (x in rawSoundModels) {
				if (rawSoundModels.hasOwnProperty(x)) {
					rawSoundModels[x].release();
					rawSoundModels[x].destroy();
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
			soundModelFactories = {};
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
						[soundServer + "/jsaModels/" + soundModelNames[num]],
						// And open the sliderBox
						function (currentSM) {
							console.log("Making slider box");
							console.log("Adding " + soundModelNames[num] + " to soundModelFactories object");

							soundModelFactories[soundModelNames[num]] = currentSM;
							console.log("just created soundModelFactories[" + soundModelNames[num] + "]");
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
				var smFactoractory = getSMFactoryFromName(soundList[i]);

				rawSoundModels[soundList[i]] = soundModelFactories[smFactoractory]();
				if (showSliderBoxesP===true){
					sliderBoxes[soundList[i]] = makeSliderBox(rawSoundModels[soundList[i]]);
				} 
			}
		}

		function setState(state) {
			var i, j;
			var soundList = story.getCurrentScene().getSoundNames();

			var model;
			var soundState;


			for (i = 0; i < soundList.length && i < state.length; i++) {

				if (showSliderBoxesP===true){
					model = sliderBoxes[soundList[i]];
				} else{
					model = rawSoundModels[soundList[i]];
				}
				soundState = state[i];

				//console.log("will set state for sliderBoxes[" + soundList[i] + "]");
				console.log("will set state for soundModelss[" + tokenizeByVBar(soundList[i])[0] + "]");


				if (!model) {
					console.log("ERROR: There's no slider box or sound model for " + soundList[i]);
					continue;
				}
				for (j = 0; j < soundState.length; j++) {
					if (soundState[j].type === "range")
						model.setParam(soundState[j].name, soundState[j].value);
					else
						model.setParam(soundState[j].name, soundState[j].value);
				}
			}
		}

		function interpolateVals(low, high, weight) {
			return low + (weight * (high - low));
		}

		function interpolateStates(low, high, weight) {
			var newState = [];
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


		function rangeMessageHandler(handler, value) {
			setState(interpolateStates(handler.min, handler.max, value));
		}

		function nStateMessageHandler(handler, value) {
			setState(handler.states[value]);
		}

		function sceneChangeMessageHandler(handler, value) {
			//console.log("sceneChangeMessageHandler with value = " + value)
			//var sceneNum = Math.min(story.getCurrentSceneId() + 1, story.getNextSceneId() - 1); //Don't go beyond the last scene!
			//setScene(sceneNum);
			setScene(value);
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
				return obj.d[0];
			}

			// Works ONLY with one-piece values
			function getMessageVal(obj) {
				return obj.d[1];
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
							//console.log("Got MESSAGE! Value of msgObj is:");
							//console.log(msgObj);
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
				elem("loadStory").setAttribute("disabled", true);
				elem("storyName").setAttribute("disabled", true);
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
