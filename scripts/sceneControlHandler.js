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
	[ "require", "jsaSound/jsaCore/sliderBox", "rig", "/socket.io/socket.io.js"],
	// TODO: init and initScene need to be cleaned up/combined.
	// Doesn't look nice that both async inits are executed in a non-daisy-chained manner.
	function (require, makeSliderBox, rig) {
		var soundModels = {};
		var m_scene;
		var playingP = {};
		var currState = {};

		var myInterface = {};

		var currentScene, numScenes;

		var initScene = function () {
			if (rig.length <= 0) {
				console.log("Rig has no scenes!");
				return;
			}
			numScenes = rig.length;
			currentScene = 0;
			// set initial scene to nullScene
			myInterface.setScene(rig[currentScene]);
		};

		myInterface.addSM = function (i_modelName, i_soundModel) {
			console.log("Adding sound model in handler");
			soundModels[i_modelName] = i_soundModel;
			playingP[i_modelName] = false;
		};

		myInterface.setScene = function (newScene) {
			console.log("Setting scene in handler to scene " + newScene);
			m_scene = newScene;
			loadSoundModels(m_scene, initialiseTwoStates);
		};

		//Callback is optional
		function loadSoundModels(scene, callback) {
			function soundModelHelper(num) {
				if (num < scene.models.length) {
					console.log("The scene you are loading has " + scene.models.length + " models.");
					require(
						// Get the model
						["jsaSound/jsaModels/" + scene.models[num]],
						// And open the sliderBox
						function (currentSM) {
							console.log("making slider box");
							console.log("RIG is " + rig);
							console.log("scenelist  " + rig[0]);
							var sb = makeSliderBox(currentSM());
							myInterface.addSM(scene.models[num], sb);
							soundModelHelper(num + 1);
						}
					);
				} else if (callback)
					callback();

			}
			soundModelHelper(0);
		}

		function closeSoundModels(scene){
			var currentSMName;
			//console.log("closeing " + soundModels.length + " soundmodels.");
			for (currentSMName in soundModels){
				//console.log("i is " + i + " and soundModels[i] is "  + soundModels[i]);
				if (soundModels.hasOwnProperty(currentSMName))
					soundModels[currentSMName].close();
			}
			for (currentSMName in playingP) {
				playingP[currentSMName] = false;
			}
			soundModels = {};
		}

		var initialiseTwoStates = function () {
			var handler;
			var firstStateTargets;
			var i;
			for (handler in m_scene.handlers) {
				if (m_scene.handlers.hasOwnProperty(handler) && m_scene.handlers[handler].type === "twoState") {
					currState[handler] = 0;
					firstStateTargets = m_scene.handlers[handler].targets[0];
					for (i = 0; i < firstStateTargets.length; i += 1) {
						//console.log("firstStateTargets[i].model " + firstStateTargets[i].model);
						//console.log("soundModels " + soundModels[firstStateTargets[i].model]);
						//console.log("setting value to " + firstStateTargets[i].defaultValue);
						soundModels[firstStateTargets[i].model].setParamNorm(firstStateTargets[i].parameter, firstStateTargets[i].defaultValue);
						if (firstStateTargets[i].defaultState && (firstStateTargets[i].defaultState === "play")){
							soundModels[firstStateTargets[i].model].play();
						}
					}
				}
			}
		};

		var init = function () {
			// These are on the controlee web page:
			var party_setup = document.getElementById('party_setup');
			var party_box = document.getElementById('party_box');
			var join_party_btn = document.getElementById('join_party');

			join_party_btn.removeAttribute('disabled');

			join_party_btn.onclick = function (e) {
				var partyName = party_box.value.toLowerCase().replace(/[^a-z]/g, '');
				party_box.value = "Joined!";

				console.log("button click to join " + partyName);

				var socket = io.connect(window.jsaHost);
				console.log("joining using socket " + socket);


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
						closeSoundModels(rig[currentScene]);
						currentScene = (currentScene+1)%numScenes;
						myInterface.setScene(rig[currentScene]);
						break;

					default:
						console.log("Bad parameter type!");
					}
				}

				socket.on('connect', function () {
					console.log("socket.on ");
					socket.on('message', function (msgStr) {
						//console.log("-----");
						//console.log ("dispatching message  " + msgStr);
						dispatch(JSON.parse(msgStr));
					});
					console.log("emit the register message  ");
					socket.emit('register', { party: partyName, type: 'synth' });
				});

				setTimeout(function () {
					console.log("timeout");
					//party_setup.parentNode.removeChild(party_setup);
					//party_setup = undefined;
				}, 0);
			};
		};

		initScene();

		init();

		return myInterface;
	}
);
