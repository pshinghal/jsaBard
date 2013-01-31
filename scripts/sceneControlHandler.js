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
		var m_sm;
		var m_scene;
		var playingP = false;

		var myInterface = {};
		myInterface.setSM = function (i_sm) {
			console.log("setting sound model in handler");
			m_sm = i_sm;
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


				var handlers = {};

				function defaultHandler(msg) {
					console.error(JSON.stringify(msg));
				}

				//TODO: (MAYBE) implement way of specifying whether we want to STOP or to RELEASE
				// This currently interfaces with the sliderBox, so play and release are no different. i.e. play() while playing is the same as release()
				// Keeping this at the moment, for possible future use.
				var play_stop = function (msg) {
					if (m_sm && playingP) {
						m_sm.release();
						console.log("releaseing sound");
						playingP = false;
					} else {
						m_sm.play();
						console.log("playing sound");
						playingP = true;
					}
				};

				function dispatch(msg) {
					// (handlers[msg.selector] || defaultHandler)(msg); // cool javascript pattern!!!! 
					var handler = m_scene.handlers[msg.id];
					// TODO: Check that the parameter and the message have the same (or a compatible) TYPE
					switch (handler.type) {
					// TODO: Standardise the "val" part
					case "range":
						m_sm.setRangeParamNorm(handler.parameter, msg.val);
						break;

					//This is a special type.
					//TODO: Have a more "standardised" version of this, too.
					//Well, in a way, both are special types. Anything other than range and play/stop is unlikely to exist.
					case "play_stop":
						play_stop();
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

				handlers.pitchroll = function (msg) {
					if (m_sm) {
						m_sm.setParamNorm(2, msg.p);
						m_sm.setParamNorm(3, msg.r);
					}
				};

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