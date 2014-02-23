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
		"jsaSound": (function(){
			if (! window.document.location.hostname){
				alert("This page cannot be run as a file, but must be served from a server (e.g. animatedsoundworks.com:8001, or localhost:8001)." );
			}
			// jsaSound server is hardcoded to port 8001 (on the same server as jsaBard - or from animatedsoundworks)
				//LOCAL var host = "http://"+window.document.location.hostname + ":8001";
				var host = "http://"+window.document.location.hostname + ":8001";
				console.log("jsaBard will look for sounds served from " + host);
				return (host );
			})(),
		"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min",
	}
});
define(
	["require", "jsaSound/jsaCore/sliderBox", "jsaSound/jsaCore/config", "jsaSound/jsaCore/utils", "jquery"],
	function (require, makeSliderBox, jsaSoundConfig, utils) {

		// This funciton just needs to be run once when a program is loaded. 
		// After that, uses can listen for "changes" to the selector element on the DOM, and then call the getModelName we have added to the sector in order to retreive the model name. 
		var soundSelectorElem = document.getElementById("newSoundSelector");

		var currentSndModel;
		var soundServer = jsaSoundConfig.resourcesPath;
		var soundList;

		soundSelectorElem.getModelName=function(){
			var retval;
			if (soundSelectorElem.selectedIndex <1) {
				retval =  undefined;  // we added a "blank" to the selector list.
			} else {
				retval = soundList[soundSelectorElem.selectedIndex-1].fileName;
			}
			soundSelectorElem.options[0].selected="true";
			return retval;
		}

		// Create the html select box using the hard-coded soundList above
		function makeSoundListSelector() {
			var i;
			var currOptionName;


			//$.getJSON("soundList/TestModelDescriptors", function(data){
			$.getJSON(soundServer+"soundList/ModelDescriptors", function(data){

			soundList =  data.jsonItems;
			//console.log("Yip! sound list is " + soundList);
			soundSelectorElem.options.length=0;
			soundSelectorElem.add(new Option('Choose Sound'));
			for (i = 0; i < soundList.length; i += 1) {
				currOptionName = soundList[i].displayName || "";
					//Add option to end of list
					soundSelectorElem.add(new Option(currOptionName));
				}
				soundSelectorElem.options[0].selected="true";
			});
		}

		// When a sound is selected
		function soundChoice() {
			var sb;
			if (soundSelectorElem.selectedIndex <1) return;  // we added a "blank" to the selector list.
			var pathToLoad = "jsaSound/" + soundList[soundSelectorElem.selectedIndex-1].fileName;
			loadSoundFromPath(pathToLoad);
		}

		function loadSoundFromPath(path) {
			require(
				// Get the model
				[path], // -1 since we added a blank first element to the selection options
				// And open the sliderBox
				function (currentSM) {
					if (path.indexOf("jsaSound/") === 0){
						path = path.substr("jsaSound/".length);
						console.log("loadSoundFromPath: " + path)
					//sb = makeSliderBox(currentSM(), path);
					}
				}
			);
		}

		// If model name is assigned in the querystring
		if (utils.getParameterByName("modelname")) {
			loadSoundFromPath(utils.getParameterByName("modelname"));
		}

		makeSoundListSelector();
		//soundSelectorElem.addEventListener("change", soundChoice);
}
);
