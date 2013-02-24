/*
This jsaSound Code is distributed under LGPL 3
Copyright (C) 2012 National University of Singapore
Inquiries: director@anclab.org

This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.
This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNULesser General Public License for more details.
You should have received a copy of the GNU General Public License and GNU Lesser General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
*/
require.config({
	paths: {
		"jsaSound": "../jsaSound"
	}
});
require(
	["require", "jsaSound/jsaCore/sliderBox", "sceneControlHandler"],
	function (require, makeSliderBox, m_handler) {
		var currentSndModel;
		var soundSelectorElem = document.getElementById("soundSelector");

		//Messages will be sent with an id (IDENTIFYING THE _INPUT_),
		//a type (TODO: match with model param type)
		//and the parameter that they change

		//TODO: Load this dynamically
		var sceneMapping = {
			models: ["jsaRSBeatSet", "jsaMetaMic"],
			handlers: {
				pitch: {
					type: "range",
					targets: [
						{
							model: "jsaRSBeatSet",
							parameter: "Gain"
						},
						{
							model: "jsaMetaMic",
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
								model: "jsaTelephoneSpeech",
								parameter: "filter Q",
								// IMPORTANT NOTE: this value is passed to setParamNorm, so it must be between 0 to 1;
								defaultValue: 2.0 / 150.0
							}
						],
						[
							{
								model: "jsaTelephoneSpeech",
								parameter: "filter Q",
								defaultValue: 50.0 / 150.0
							}
						]
					]
				},
				pushbutton: {
					type: "play_stop",
					targets: [
						{
							model: "jsaMetaMic",
							parameter: "Play/Stop"
						}
					]
				}
			}
		};

		m_handler.setScene(sceneMapping);

		function loadSoundModels() {
			function soundModelHelper(num) {
				if (num < sceneMapping.models.length) {
					require(
						// Get the model
						["jsaSound/jsaModels/" + sceneMapping.models[num]],
						// And open the sliderBox
						function (currentSM) {
							var sb = makeSliderBox(currentSM());
							m_handler.addSM(sceneMapping.models[num], sb);
							soundModelHelper(num + 1);
						}
					);
				}
			}
			soundModelHelper(0);
		}

		loadSoundModels();
	}
);

