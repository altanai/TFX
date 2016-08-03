#### Start the web Server

directory : tfx_web
role: starts thttps server to render the webpages 


> tfx_web git:(master) ✗ node webrtcserver.js 
>Folder Path  /home/altanai/tfx/tfx_module { root: '/home/altanai/tfx/tfx_module',
>  options: 
>   { cache: 3600,
>     gzip: true,
>     indexFile: 'index.html',
>     headers: { server: 'node-static/0.7.6', 'cache-control': 'max-age=3600' } },
>  cache: 3600,
>  defaultHeaders: { server: 'node-static/0.7.6', 'cache-control': 'max-age=3600' },
>  serverInfo: 'node-static/0.7.6' }
> WebRTC server env => local running at
> 8084/
>CTRL + C to shutdown


#### Starting the Signalling Server

directory : tfx_signaller
role: starts the signaller server using socketio on https for secure webrtc 

should run

> cd tfx_signaller
> NODE_ENV=production node server.js
-- signal master is running at: https://localhost:8888


#### Starting the Web Client

goto url : https://localhost:8084

#### Starting the Web Extension

make a zip and install to chorme ->settings ->extensions
