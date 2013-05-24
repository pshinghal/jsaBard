define(
	[],
	function () {
		//TODO: Add specific descriptions here. Append generic Handler descriptions TO that.
		var myControllerModel = {
			"interface": [
				{
					"interfaceType": "prslider",
					"eventType": "range",
					"paramioID": "prslider/36474",
					"message": [
						"mousedown"
					],
					"position": {
						"x": "71.39%",
						"y": "2.09%",
						"width": "25.48%",
						"height": "11.15%"
					},
					"orientation": "h",
					"color": "blue",
					"invisible": ""
				},
				{
					"interfaceType": "nStateButton",
					"eventType": "nState",
					"paramioID": "nStateButton/35027",
					"message": [
						"mousedown"
					],
					"position": {
						"x": "9.62%",
						"y": "16.55%",
						"width": "81.73%",
						"height": "24.56%"
					},
					"orientation": "h",
					"numStates": 2,
					"color": "green"
				},
				{
					"interfaceType": "pushButton",
					"eventType": "nState",
					"paramioID": "pushButton/18312",
					"message": [
						"mousedown"
					],
					"position": {
						"x": "10.58%",
						"y": "47.91%",
						"width": "80.05%",
						"height": "26.66%"
					},
					"orientation": "h",
					"numStates": 2,
					"color": "#9900FF"
				},
				{
					"interfaceType": "hslider",
					"eventType": "nState",
					"paramioID": "hslider/33536",
					"message": [
						"mousedown"
					],
					"position": {
						"x": "9.62%",
						"y": "85.71%",
						"width": "81.73%",
						"height": "7.49%"
					},
					"orientation": "h",
					"numStates": 2,
					"color": "#0099FF"
				}
			]
		};
		return myControllerModel;
	}
);

/*
 * Model to follow:
 * [
 *   {
 *     paramioID: "<the name of the controller element>"
 *     eventType: "range" // or "nState"
 *     numStates: 2 // or other number
 *   }
 * ]
 */
