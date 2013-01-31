README

jsaPhoneControl is an experiment in using smartphones as controllers for jsaSound Models.

DEPENDS ON: 
	1) node.js, and socket.io.js 
	2  jsaSounds gitHub project (for 3 directories: jsaCore, jsaModels, jsaOpCodes, 
					 and 1 file:  scripts/require.js)


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

jsaPhoneControl code should all reside on a server.
run message-router.js on the server
Point your client browser to index.html.
Point your phone browser to control.html
A 9-letter code will show up in your phone window that you can type in to the space provided at SoundManagerControlee.html. 
Bob is your uncle.


Currently hardcoded to run at:
  http://animatedsoundworks.com/ctlexp/SoundManagerControlee.html
It might be availabe there right now.


If you want to run it on a different server (e.g. locally), 
At the top of files
	control.html and SoundManagerControlee.html
           1) change jsaHost to the name or IP address of the server
	   2) change the following line to reflect the host IP or name
    		<script src="http://192.168.1.85:8000/socket.io/socket.io.js"></script>


To run on local windows 7 machine:
   	(Install IIS -  http://www.youtube.com/watch?v=dC84NQqjYEc)
        Make sure Firewall allows connections.

	Control Panel -> Adminstrative Tools -> IIS Manager
        Create a website (don't use port 8000 cause message-router is using that port) with the project folder as the location. If you are using windows default port 80, then you don't have to specify port number for the web page.

        run: node message-router.js
	Open localhost:port/index.html, 
        point phone browser to [server IP]:port/control.html

