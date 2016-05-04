/*
* Signal master modified by Altanai to add a key value cache base Datastore
* date : 5 Feb 2014
* Project : TFX Sessions
*/

/*global console*/
var yetify = require('yetify'),
    config = require('getconfig'),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    port = parseInt(process.env.PORT || config.server.port, 10),
    io = require('socket.io').listen(port),
    redis = require('redis');
//----------------------------------------------------------------------------

/* maintain name of rooms */
var redisclient = redis.createClient(); //creates a new client 
redisclient.on("error", function (err) {
console.log("Error " + err);
});

redisclient.on("connect", getrooms);

function getrooms() {
	console.log(" Existing rooms ---------");
	redisclient.smembers("rooms", function (err, reply) {
	console.log(reply.toString());
	});
}
//-----------------------------------------------------------------------------

if (config.logLevel) {
    // https://github.com/Automattic/socket.io/wiki/Configuring-Socket.IO
    io.set('log level', config.logLevel);
}

function describeRoom(name) {
    var clients = io.sockets.clients(name);
    var result = {
        clients: {}
    };
    clients.forEach(function (client) {
        result.clients[client.id] = client.resources;
    });
    return result;
}

function safeCb(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}

//on connecetion 
io.sockets.on('connection', function (client) {
    client.resources = {
        screen: false,
        video: true,
        audio: false
    };

    // pass a message to another id
    client.on('message', function (details) {
        if (!details) return;

        var otherClient = io.sockets.sockets[details.to];
        if (!otherClient) return;

        details.from = client.id;
        otherClient.emit('message', details);
    });

    client.on('shareScreen', function () {
        client.resources.screen = true;
    });

    client.on('unshareScreen', function (type) {
        client.resources.screen = false;
        removeFeed('screen');
    });

    client.on('join', join);

    function removeFeed(type) {
        if (client.room) {
            io.sockets.in(client.room).emit('remove', {
                id: client.id,
                type: type
            });
            if (!type) {
                client.leave(client.room);
                client.room = undefined;
            }
        }
    }

    function join(name, cb) {
        // sanity check
        if (typeof name !== 'string') return;
	console.log(" -------client wants to join room -> ", name );

	//-------------make a redis check and entry-----------------
	var roomfull=0;
	console.log("check if room name exists already ");
	redisclient.sismember("rooms",name, function (err, reply) {
		roomfull=reply.toString();		
		console.log(" 0 if room is not present , 1 if room is present -> " , roomfull);	
	});

	if(roomfull==0){
	console.log(" adding room name to rooms set in redis " );	
	redisclient.sadd("rooms", name, function (err, reply) {
		var result=reply.toString();
		console.log(" If room is added OK otherwise an error -> ", result);
		if(result ==1){
			redisclient.set(name,1 ,  function (err, reply) {
				console.log("keyvalue for room/mem, 1 if ok and other on error ", reply.toString());							
			});			
		}
		else{
			redisclient.get(name, function (err, reply) {
				console.log(" num mem in room alreadt present ", reply.toString());					
			});
		}	
	});
 	}

        //--------------------------------------------------------

        // leave any existing rooms
        removeFeed();
        safeCb(cb)(null, describeRoom(name));
        client.join(name);
        client.room = name;
    }

    // we don't want to pass "leave" directly because the
    // event type string of "socket end" gets passed too.
    client.on('disconnect', function () {
	console.log(" --------- disconneted room ");
        removeFeed();
    });

    client.on('leave', function () {
	console.log(" ---------- leave Room ");
        removeFeed();
    });

    client.on('create', function (name, cb) {
    	console.log(" ----------create Room name "+ name);


	if (arguments.length == 2) {
            cb = (typeof cb == 'function') ? cb : function () {};
            name = name || uuid();
        } else {
            cb = name;
            name = uuid();
        }

        // check if exists
        if (io.sockets.clients(name).length) {
	    console.log("------------ Room name taken");
            safeCb(cb)('taken');
        } else {
	    console.log(" ---------- join Room name "+ name );
            join(name);
            safeCb(cb)(null, name);
        }
    });

// ******************* Custom added **************
  // client.on('join', function (name, cb) {
//	    console.log(" ----------Signalling server : point 3 ( duplicate ) : join ",name);
//            join(name);
//            safeCb(cb)(null, name);
//    });
// **********************************************

    // tell client about stun and turn servers and generate nonces
    client.emit('stunservers', config.stunservers || []);
    console.log(" STUN " + config.stunservers );

    // create shared secret nonces for TURN authentication the process is described in draft-uberti-behave-turn-rest
    var credentials = [];
    config.turnservers.forEach(function (server) {
        var hmac = crypto.createHmac('sha1', server.secret);
        // default to 86400 seconds timeout unless specified
        var username = Math.floor(new Date().getTime() / 1000) + (server.expiry || 86400) + "";
        hmac.update(username);
        credentials.push({
            username: username,
            credential: hmac.digest('base64'),
            url: server.url
        });
    });
    client.emit('turnservers', credentials);
});

if (config.uid) process.setuid(config.uid);
console.log(yetify.logo() + ' -- signal master is running at: http://ip:' + port);
