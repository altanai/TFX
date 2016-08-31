            var room =  localStorage.getItem("room");
	      
            // create our webrtc connection
            var webrtc = new SimpleWebRTC({
                localVideoEl: 'localVideo',
                remoteVideosEl: '',
                autoRequestMedia: true,
                debug: false,
                detectSpeakingEvents: true,
                autoAdjustMic: false
            });

            webrtc.on('readyToCall', function () {
               console.log("----alt : point 2-> readyToCall ");
                if (room) webrtc.joinRoom(room); 
            });

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

            webrtc.on('channelMessage', function (peer, label, data) {
                if (data.type == 'volume') {
                    showVolume(document.getElementById('volume_' + peer.id), data.volume);
                }
                if (data.type == 'message') {
		               $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() + data.message );
                }
                if (data.type == 'widgetMessage') {
                }
            });

            webrtc.on('videoAdded', function (video, peer) {
                var remotes = document.getElementById('remotes');
                if (remotes) {
                    var d = document.createElement('div');
                    d.className = 'videoContainer';
                    d.id = 'container_' + webrtc.getDomId(peer);
        		  	//adding script to make video hidden 
        			video.setAttribute("type", "hidden");
        		    video.setAttribute("autoplay", "true");
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

        			//make canvas 
        			resizeCanvas();
                }
            });

            webrtc.on('videoRemoved', function (video, peer) {
                var remotes = document.getElementById('remotes');
                var el = document.getElementById('container_' + webrtc.getDomId(peer));
                if (remotes && el) {
                    remotes.removeChild(el);
                }
            });

            // Since we use this twice we put it here
            function setRoom(name) {
                $('#RoomName').text(name);
                $('body').addClass('active');
            }

	    function sendMessage(){
		   var msg=$('#MessageBox').val();
		   if(room) webrtc.sendControlPackets(msg);
	    }

        function sendBroplugWidgetInfo(widgetmsg){
           if(room) webrtc.sendControlPackets(widgetmsg);
        }
