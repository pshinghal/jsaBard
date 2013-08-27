START /MIN /B CMD /C "node" bardServer.js
START  CMD /C START ipconfig
START "" "http://localhost:8000"
echo "Hello from bard"
