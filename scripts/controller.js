/* ---------------------------------------------------------------------------------------
This jsaSound Code is distributed under LGPL 3
Copyright (C) 2012 National University of Singapore
Inquiries: director@anclab.org

This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.
This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNULesser General Public License for more details.
You should have received a copy of the GNU General Public License and GNU Lesser General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
------------------------------------------------------------------------------------------*/
// Kumar Subramanian (http://nishabdam.com) is the Guru responsible for the party node.js architecture!

require.config({
	shim: {
		"socketio": {
			exports: "io"
		}
	},
	paths: {
		"socketio": "/socket.io/socket.io",
		"renderer": "http://localhost:8002/appscripts/renderSurface"
	}
});

define(
	["socketio", "renderer"],
	function (io, renderer) {
		function elem(id) { return document.getElementById(id); }
		function hide(id) { elem(id).setAttribute("hidden"); }
		function show(id) { elem(id).removeAttribute("hidden"); }
		function disable(id) { elem(id).setAttribute("disabled"); }
		function enable(id) { elem(id).removeAttribute("disabled"); }

		function mapconstrain(f1, f2, t1, t2, x) {
			var raw = t1 + ((x - f1) / (f2 - f1)) * (t2 - t1);
			return Math.max(t1, Math.min(raw, t2));
		}

		var socket;

		function init() {
			socket = io.connect(window.jsaHost);
			socket.on("connect", initConnectorView);
		}

		function initConnectorView() {
			var partyNameInput = elem("partyName");
			var partyButton = elem("partyButton");

			function joinParty() {
				var partyName = partyNameInput.value.toLowerCase().replace(/[^a-z]/g, '');
				disable("partyButton");
				partyNameInput.value = "loading...";
				disable("partyName");
				console.log("Attempting to join " + partyName);
				socket.on("confirm", function (data) {
					if (data.party === partyName) {
						initControllerView();
					} else {
						alert("Couldn't connect!");
						partyNameInput.value = "";
						partyNameInput.focus();
					}
				});
				socket.emit("register", {
					party: partyName,
					type: "control"
				});
			}

			partyButton.addEventListener("click", joinParty);
			enable("partyName");
			enable("partyButton");
		}

		function initControllerView() {
			function send(msg) {
				socket.send(JSON.stringify(msg));
			}

			function sendOrientation(event) {
				var pitch = event.beta;
				var roll = event.gamma;
				var foo1 = mapconstrain(-45, 45, 0, 1, pitch);
				var foo2 = mapconstrain(-45, 45, 0, 1, roll);

				send({ id: "pitch", type: "range", val: foo1});
				send({ id: "roll", type: "range", val: foo2 });
			}

			function sendToggle (event) {
				event.preventDefault();
				send({ id: "toggle", type: "play_stop", val: "play_stop"});
			}

			function sendPushbuttonDown (event) {
				event.preventDefault();
				send({ id: "pushbutton", type: "play_stop", val: "play"});
			}

			function sendPushbuttonUp (event) {
				event.preventDefault();
				send({ id: "pushbutton", type: "play_stop", val: "stop"});
			}

			function sendTwoStateDown (event) {
				event.preventDefault();
				send({ id: "dummyTwoState", type: "twoState", val: "down"});
			}

			function sendTwoStateUp (event) {
				event.preventDefault();
				send({ id: "dummyTwoState", type: "twoState", val: "up"});
			}

			function sendSceneChange (event){
				event.preventDefault();
				send({id: "sceneChange", type: "scene_change", val: null});
			}

			hide("connectorContainer");
			show("controllerContainer");

			var toggleElem = document.getElementById("toggle");
			var pushbuttonElem = document.getElementById("pushbutton");
			var scenebuttonElem = document.getElementById("scenebutton");

			window.addEventListener("deviceorientation", sendOrientation, false);
			toggleElem.addEventListener("touchstart", sendToggle, false);
			pushbuttonElem.addEventListener("touchstart", sendTwoStateDown, false);
			pushbuttonElem.addEventListener("touchend", sendTwoStateUp, false);
			scenebuttonElem.addEventListener("touchstart", sendSceneChange, false);
		}

		init();
	}
);