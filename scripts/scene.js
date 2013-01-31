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
			model: "jsaMetaDrone2",
			handlers: {
				morphX: {
					type: "range",
					parameter: "Base Note"
				},
				morphY: {
					type: "range",
					parameter: "Number of Generators"
				},
				pitch: {
					type: "range",
					parameter: "Gain"
				}
			}
		};

		var sb;
		require(
			// Get the model
			["jsaSound/jsaModels/" + sceneMapping.model],
			// And open the sliderBox
			function (currentSM) {
				sb = makeSliderBox(currentSM());
				m_handler.setSM(sb);
				m_handler.setScene(sceneMapping);
			}
		);
	}
);