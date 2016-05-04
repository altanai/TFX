/*
* Signal master modified  to add a key value cache base Datastore
* date : 5 Feb 2014
* Project : TFX Sessions
* Author : altanai <tara181989@gmail.com>
*/
var redisServerPort=6379,
	port=8888;

/*global console*/
var config = require('getconfig'),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    io = require('socket.io').listen(port),
    redisServer = require('redis-server'),
   	redisClient = require('redis');


	//port = parseInt(process.env.PORT || config.server.port, 10);

// ---------------------------Redis Server ---------------
/*var redisServerInstance = new redisServer(redisServerPort);
console.log(redisServerInstance);

redisServerInstance.open(function (error) {
  	if (error) {
  		console.log(" Redis Server cannot start threw error ");
    	throw new Error(error);
  	}
 	console.log("Redis server running in" + redisServerPort);	
});*/
 
//--------------------------Redis Client--------------------

var redisclient = redisClient.createClient(); 
	redisclient.on("Redis Client ", function (err) {
	console.log("Error on redis client " + err);
});

redisclient.on("connect", getrooms);

/* maintain name of rooms */
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
        audio: true
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
        if (typeof name !== 'string') return;
		console.log(" ---------- client wants to join room -> ", name );

		//-------------make a redis check and entry-----------------------------------------------------
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
				console.log(" If room is added 1  otherwise an 0 -> ", result);
				if(result ==1){
					redisclient.set(name,1 ,  function (err, reply) {
						console.log( "keyvalue for room/mem,ok or error -> ", reply.toString());
								// leave any existing rooms
								removeFeed();
								safeCb(cb)(null, describeRoom(name));
								console.log("----------------- client about to join room ", name );
								client.join(name);
								client.room = name;						
					});			
				}
				else{
					redisclient.get(name, function (err, reply) {
						if (err) {
				             		console.error("error");
				         	}
						else{
							var memresult=reply.toString()
							console.log(" num mem in room already present ", memresult);
							if(memresult=="0") {
								console.log(" 0 value keys should be deleted " );
							}	
							else if(memresult =="1"){
								 console.log("place for one more member in room adding key value 2");
								 redisclient.set(name,2 ,function (err, reply) {
									console.log( "keyvalue for room/mem,ok or error -> ", reply.toString());
									// leave any existing rooms
									removeFeed();
									safeCb(cb)(null, describeRoom(name));
									console.log("----------------- client about to join room ", name );
									client.join(name);
									client.room = name;
								});
							}
							else if(memresult =="2"){
								console.log(" room is occuped by 2 members already return error message ");
								//safeCb(cb)('taken');
								//client.emit("roomfull");
								safeCb(cb)(null,"roomfull");						
								return;
							}
							else {
								 console.log(" How are the memresults anything except 0,1,2 ?? ");
							}
						}									
					});
				}	
			});
	 	}

    }

    // we don't want to pass "leave" directly because the event type string of "socket end" gets passed too.
    client.on('disconnect', function () {
		console.log(" --------- disconneted room -> ", client.room);
        removeFeed();
	
		/*		
		redisclient.get(name, function (err, reply) {
				var memresult=reply.toString()
				console.log(" num mem in room alreadt present ", memresult);
				if(memresult=="0") {
					console.log(" 0 value keys should be deleted " );
				}	
				else if(memresult =="1"){
					 console.log("Room is occupied by 1 member , reucing to 0  ");
				}
				else if(memresult =="2"){
					console.log(" How come room is occuped by 2 members, reducing to 1 ");
				}
				else {
					 console.log(" How are the memresults anything except 0,1,2 ?? ");
				}									
	});
*/
    });

    client.on('leave', function () {
		var name=client.room;
		console.log(" ---------- leave Room ", name);
        removeFeed();
	if(name!=undefined){
		redisclient.get(name, function (err, reply) {
			if (err) {
                     		console.error("error");
                 	}
			else{
				var memresult=reply.toString()
				console.log(" num mem in room alreadt present ", memresult);
				if(memresult=="0") {
					console.log(" 0 value keys should be deleted " );
				}	
				else if(memresult =="1"){
					 console.log("Room is occupied by 1 member ,  del key ");
						 redisclient.del(name,function (err, reply) {
							 if(err){
								console.log(" err "); 
							 }
							 else{
								console.log( "key delted -> ", reply.toString());
							 	redisclient.srem("rooms",name,function (err, reply) {
									console.log(" del from rooms set -> ",reply.toString());
								});	
							}						
						});
				}
				else if(memresult =="2"){
					console.log(" How come room is occuped by 2 members, reducing to 1 ");
						 redisclient.set(name,1 ,function (err, reply) {
							console.log( "key value set to 1 mem -> ", reply.toString());
						});
				}
				else {
					 console.log(" How are the memresults anything except 0,1,2 ?? ");
				}
			}									
		});
	}
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
	    console.log("------------  taken");
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
console.log(' -- signal master is running at: http://ip:' + port);
