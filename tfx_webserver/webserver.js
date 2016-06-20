var fs = require('fs');
var _static = require('node-static');
var https = require('https');
var property = require('./propertyWriter.js')(fs);
/*property.writeEnv();*/
var properties= JSON.parse(property.readEnv());

var folderPath=properties.clientPath;

var file = new _static.Server(folderPath, {
    cache: 3600,
    gzip: true,
    indexFile: "index.html"
});

console.log("Folder Path " ,folderPath , file);

var options = {
  key: "/etc/letsencrypt/live/tfxserver.above-inc.com/privkey.pem",
  cert: "/etc/letsencrypt/live/tfxserver.above-inc.com/cert.pem",
  requestCert: true,
  rejectUnauthorized: false
};

var app = https.createServer(options, function(request, response){
        request.addListener('end', function () {
        file.serve(request, response);
    }).resume();     
});
app.listen(properties.httpsPort);

console.log(" WebRTC server env => "+ properties.enviornment+ " running at\n "+properties.httpsPort+ "/\nCTRL + C to shutdown");