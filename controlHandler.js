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


console.log("LOADING CONTROLHANDLER");



 
controlHandler = function(){
	
	var m_sm;
	var playingP=false;
	
	var myInterface = {}
	myInterface.setSM = function(i_sm){
		console.log("setting sound model in handler");
		m_sm = i_sm;
	}
	
    var init = function (){	
	var foo;

	// These are on the controlee web page:
	var party_setup = document.getElementById('party_setup');
	var party_box = document.getElementById('party_box');
	var join_party_btn = document.getElementById('join_party');

	join_party_btn.removeAttribute('disabled');

	join_party_btn.onclick = function (e) {
		var partyName = party_box.value.toLowerCase().replace(/[^a-z]/g, '');
		party_box.value = "Joined!";
		
		console.log ("button click to join " + partyName);
		
		//var socket = io.connect('animatedsoundworks.com:8000');
		var socket = io.connect(jsaHost);
		console.log ("joining using socket " + socket);
		
		
		var handlers = {};

		function defaultHandler(msg) {
			console.error(JSON.stringify(msg));
		}

		function dispatch(msg) {
			(handlers[msg.selector] || defaultHandler)(msg); // cool javascript pattern!!!! 
		}

		socket.on('connect', function () {
			console.log ("socket.on ");
			socket.on('message', function (msgStr) {
				//console.log("-----");
				//console.log ("dispatching message  " + msgStr);
				dispatch(JSON.parse(msgStr));
			});
			console.log ("emit the register message  ");
			socket.emit('register', { party: partyName, type: 'synth' });
		});

		handlers.morph = function (msg) {
			if(m_sm){
				m_sm.setRangeParamNorm (0, msg.x);
				m_sm.setRangeParamNorm (1, msg.y);
			}				
		};

		handlers.play_stop = function (msg) {
			if(m_sm && playingP){
				m_sm.release();
				console.log("releaseing sound");
				playingP=false;
			} else{
				m_sm.play();
				console.log("playing sound");
				playingP=true;
			}
		};
		
		handlers.pitchroll = function (msg) {
			if(m_sm){			    
				m_sm.setRangeParamNorm (2, msg.p);
				m_sm.setRangeParamNorm (3, msg.r);
			} 
		};

		
		setTimeout(function () { 
			console.log("timeout");
			party_setup.parentNode.removeChild(party_setup); 
			party_setup = undefined;
		}, 0);
		
		}
	}();
	
	return myInterface;
}

