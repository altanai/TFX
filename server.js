// silly chrome wants SSL to do screensharing
var fs = require('fs'),
    express = require('express'),
    https = require('https'),
    http = require('http');

console.log(' Directory --> '+__dirname);
console.log(' FakeCertificates from  --> '+__dirname+'/fakekeys/certificate.pem');

var privateKey = fs.readFileSync(__dirname+'/fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync(__dirname+'/fakekeys/certificate.pem').toString();

var app = express();

app.use(express.static(__dirname));

https.createServer({key: privateKey, cert: certificate}, app).listen(8000);
http.createServer(app).listen(8001);

console.log('running on https://localhost:8000 and http://localhost:8001');

