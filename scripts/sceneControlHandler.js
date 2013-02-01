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
	["socket.io-client/dist/socket.io"],
	function () {
		var soundModels = {};
		var m_scene;
		var playingP = {};

		var myInterface = {};
		myInterface.addSM = function (i_modelName, i_soundModel) {
			console.log("Adding sound model in handler");
			soundModels[i_modelName] = i_soundModel;
			playingP[i_modelName] = false;
		};

		myInterface.setScene = function (sceneMapping) {
			console.log("Setting scene in handler");
			m_scene = sceneMapping;
		};

	    var init = function () {
		    var foo;

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
					var handler = m_scene.handlers[msg.id];
					// TODO: Check that the parameter and the message have the same (or a compatible) TYPE
					switch (handler.type) {
					// TODO: Standardise the "val" part
					case "range":
						for (i = 0; i < handler.targets.length; i += 1) {
							targetModelName = handler.targets[i].model;
							targetParamName = handler.targets[i].parameter;
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
					party_setup.parentNode.removeChild(party_setup);
					party_setup = undefined;
				}, 0);
			};
		};

		init();

		return myInterface;
	}
);