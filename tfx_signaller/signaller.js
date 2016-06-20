/*global console*/
var config = require('getconfig'),
    fs = require('fs'),
    sockets = require('./sockets'),
    port = parseInt(process.env.PORT || config.server.port, 10),
    server_handler = function (req, res) {
        res.writeHead(404);
        res.end();
    },
    server = null;

// Create an http(s) server instance to that socket.io can listen to
if (config.server.secure) {
    server = require('https').Server({
        key: fs.readFileSync("/etc/letsencrypt/live/tfxserver.above-inc.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/tfxserver.above-inc.com/cert.pem"),
        requestCert: true,
        rejectUnauthorized: false
    }, server_handler);
} else {
    server = require('http').Server(server_handler);
}

server.listen(port);

console.log("Signaller started -----> ", config);

sockets(server, config);

if (config.uid) process.setuid(config.uid);
