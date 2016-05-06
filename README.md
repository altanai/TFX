#### Straing the web Server

directory : tfx_web
role: starts thttps server to render the webpages 


#### Starting the Signalling Server

directory : tfx_signaller
role: starts the signaller server using socketio on https for secure webrtc 

should run
'''
> cd tfx_signaller
> NODE_ENV=production node server.js
-- signal master is running at: https://localhost:8888
'''