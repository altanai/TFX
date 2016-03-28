/*globals $:false */

// grab the room from the URL
var room = location.search && location.search.split('?')[1];

// create our webrtc connection
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: '',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false
});

// when it's ready, join if we got a room from the URL
webrtc.on('readyToCall', function () {
    // you can name it anything
    if (room) webrtc.joinRoom(room);
});

webrtc.on('videoAdded', function (video, peer) {
    console.log('video added', peer);
    var remotes = document.getElementById('remotes');
    if (remotes) {
        var d = document.createElement('div');
        d.className = 'videoContainer';
        d.id = 'container_' + webrtc.getDomId(peer);
        d.appendChild(video);
        var vol = document.createElement('div');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume_bar';
        video.onclick = function () {
            video.style.width = video.videoWidth + 'px';
            video.style.height = video.videoHeight + 'px';
        };
        d.appendChild(vol);
        remotes.appendChild(d);
    }
});

webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed ', peer);
    var remotes = document.getElementById('remotes');
    var el = document.getElementById('container_' + webrtc.getDomId(peer));
    if (remotes && el) {
        remotes.removeChild(el);
    }
});



/************************************************************************8
Volume changed 
***************************************************************/

function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}
webrtc.on('volumeChange', function (volume, treshold) {
    //console.log('own volume', volume);
    showVolume(document.getElementById('localVolume'), volume);
});


/************************************************************************
channel message 
************************************************************************/
webrtc.on('channelMessage', function (peer, label, data) {
    if (data.type == 'volume') {
        showVolume(document.getElementById('volume_' + peer.id), data.volume);
        //return;
    } else if (data.type == "stoppedSpeaking") {
        //return;
    } else if (data.type == "speaking") {
        //return;
    } else if (data.type == "chat") {
        console.log("chat", data);
        $('#messages').append('<br> Other :<br>' + data.payload.message);
    } else {
        console.log("Unclassified channelMessage", data);
        if (data.payload.type === 'chat') {
            $('#messages').append('<br> Other :<br>' + data.payload.message);
        }
    }

});

/************************************************************************8
Room
*************************************************************************/

// Since we use this twice we put it here
function setRoom(name) {
    $('form').remove();
    $('h1').text(name);
    $('#subTitle').text('Link to join: ' + location.href);
    $('body').addClass('active');
}

if (room) {
    setRoom(room);
} else {
    $('form').submit(function () {
        var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
        webrtc.createRoom(val, function (err, name) {
            console.log(' create room cb', arguments);
        
            var newUrl = location.pathname + '?' + name;
            if (!err) {
                history.replaceState({foo: 'bar'}, null, newUrl);
                setRoom(name);
            } else {
                console.log(err);
            }
        });
        return false;
    });
}

/********************************************************************
Screenshare 
********************************************************************/

var button = $('#screenShareButton'),
    setButton = function (bool) {
        button.text(bool ? 'share screen' : 'stop sharing');
    };
webrtc.on('localScreenStopped', function () {
    setButton(true);
});

setButton(true);

button.click(function () {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
        setButton(true);
    } else {
        webrtc.shareScreen(function (err) {
            if (err) {
                setButton(true);
            } else {
                setButton(false);
            }
        });
        
    }
});

/*************************************************************************
Failures 
*******************************************************************************/
// local p2p/ice failure
webrtc.on('iceFailed', function (peer) {
    var pc = peer.pc;
    console.log('had local relay candidate', pc.hadLocalRelayCandidate);
    console.log('had remote relay candidate', pc.hadRemoteRelayCandidate);
});

// remote p2p/ice failure
webrtc.on('connectivityError', function (peer) {
    var pc = peer.pc;
    console.log('had local relay candidate', pc.hadLocalRelayCandidate);
    console.log('had remote relay candidate', pc.hadRemoteRelayCandidate);
});

/************************************************************************8
chat
**********************************************************************/

$("#messageInput").keyup(function (e) {
    if (e.keyCode == 13) {
        var msg = $('#messageInput').val();
        console.log("chat ", msg);
        //webrtc.sendToAll('chat',{ type:"chat" , message: msg });
        webrtc.sendDirectlyToAll('', 'chat', {message: msg});
        $('#messages').append('<br>You:<br>' + msg);
        $('#messageInput').val('');
    }
});

/* **********************************************************************88
Fil transfer 
* ********************************************************************************* */

var fileinput = document.getElementById('fileInput');

// send a file
fileinput.addEventListener('change', function () {
    fileinput.disabled = true;
    var file = fileinput.files[0];
    var sender = peer.sendFile(file);
});

