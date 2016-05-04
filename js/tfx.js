/*---------- broplug API methods to let widgets access the video and audio -----------*/

  TFXlocalVideo = function getTFXlocalVideo(plugintype,elementid){
    console.log("TFX Local Video for plugin " + plugintype+" ||  element id " + elementid);
    var childvideo = document.getElementById(plugintype).contentWindow.pluginlocalVideo;
    var childsource = document.createElement('source');

    childsource.setAttribute('src', document.getElementById("localVideo").src);

    childvideo.appendChild(childsource);
    childvideo.play();
  }

  TFXremoteVideo = function getTFXremoteVideo(plugintype,elementid){
    console.log("TFX Remote Video for plugin " + plugintype+" ||  element id " + elementid);
    var childvideo = document.getElementById(plugintype).contentWindow.pluginremoteVideo;
    var childsource = document.createElement('source');
    childsource.setAttribute('src', document.getElementById("remotes").getElementsByTagName("video")[0].src);
    childvideo.appendChild(childsource);
    childvideo.play();
  }



TFXjoinroom=function(){
	room = location.search.substring(1);
	localStorage.setItem("session", "active");

	if (room){
		    webrtc.joinRoom(room);
		    var url=window.location+'?roomname='+room;
	    gapi.load('client', function() { 
		  console.log('gapi.client loaded.');
		  shortenURL(url);
		});
	} 

	membersCount=webrtc.webrtc.getPeers().length+1;
	resizeCanvas(membersCount, document.getElementById("localVideo"),null);
}


//function to return room name to any widget thats asks for it 
TFXgetRoom= function getCurrentRoom(){
	if(room!="undefined" && room!="")
		return room ;
	else 
		return location.search.substring(1); 
}

//function to replicate the behaviour from another peer .listen to datachannel for acting on peers behaviour
TFXPluginFunction = function doplugin(plugintype , dimensionh , dimensionw){

      if (document.getElementById(plugintype)!=null){       //frame exists just edit the src
      		if(plugintype==currentframe){                   //hide/unload the current clicked frame 
             	removeFrame(plugintype , dimensionh , dimensionw);
             	TFXPluginRemoveFunction(plugintype);
            }
            else{
            	prepareFrame(plugintype , dimensionh , dimensionw);
            	var widget={
				    "type":"plugin",
				    "plugintype": plugintype,
				    "dimensionh": dimensionh,
				    "dimensionw": dimensionw,
				    "action":"EqualSize"
				    };
				sendWidgetMessage(widget);
            }
      } 
      else{											//this iframe doesnt exist send equal size followed by create frame
			var widget={
			    "type":"plugin",
			    "plugintype": plugintype,
			    "dimensionh": dimensionh,
			    "dimensionw": dimensionw,
			    "action":"EqualSize"
			    };
			sendWidgetMessage(widget);
      }
}

//send message to peer to create the frame as well 
TFXPluginShareFunction = function doshareplugin(plugintype , dimensionh , dimensionw){
    var widget={
	    "type":"plugin",
	    "plugintype":plugintype,
	    "dimensionh": dimensionh,
	    "dimensionw": dimensionw,
	    "action":"create"
	    };
    sendWidgetMessage(widget);
}

TFXPluginRemoveFunction= function doremoveplugin(plugintype){
	var widget={
	    "type":"plugin",
	    "plugintype":plugintype,
	    "action":"remove"
	    };
    sendWidgetMessage(widget);
}

TFXvoiceon = function voiceon(){
	webrtc.unmute();
}

TFXvoiceoff = function voiceoff(){
  webrtc.mute();
}

TFXvideoon = function videoon(){
  webrtc.resumeVideo();
}

TFXvideooff = function videooff(){
  webrtc.pauseVideo();
}

TFXclose= function close(){
  open(location, '_self').close();
}

TFXRemoteVideoon= function remotevideoon(){
    showDiv(document.getElementById("remotes").getElementsByTagName("video")[0].id);
}

TFXRemoteVideooff= function remotevideooff(){
    hideDiv(document.getElementById("remotes").getElementsByTagName("video")[0].id);




  /*------------------ audio stream gathering from simplewebrtc and pasing to plugin frames ------------*/

  TFXlocalStream=function sendaudiostream(pluginname,ss){
    var resultstream;

    if(ss=="ask"){
	     console.log(" broplug requested simplewebrtc for stream ");
	     webrtc.pluginRequestStream(pluginname) 
    }

    else {
	    console.log(" Audio Stream obtained", ss);
	    resultstream=ss;
	    document.getElementById(pluginname).contentWindow.fetchstream(resultstream);
    }
  }

  /*--------------------get statistics from peer connection obeject --------*/

  TFXstats=function stats(){
  	webrtc.passWebrtcStats(); 
  }

  /*---------------------------load widgets ------------------------------*/


/*
  function appendWidgetLeftPanel( id, title , icon , type){
    var li = document.createElement("li");
    console.log('widget description ----- >', type, icon);
    li.setAttribute('id', id);
    li.setAttribute('title',title);
    li.addEventListener('click', function() {
     widgetbutton(type);
    }, false);

    var ic = document.createElement("div");        
    ic.className =icon;
    li.appendChild(ic);
    document.getElementById("widget_toolbar").appendChild(li);
  }*/


  /*---------------------widget buttons -------------------------*/

  //Message Function
  $("#SendMessage").click(function(){
    var msg=$('#MessageBox').val();
    sendMessage(msg);
    addMessaheLog(msg);
    $("#MessageBox").val('');
  });

  //send message when mouse is on mesage dicv ans enter is hit
  $("#messageContent").keyup(function(event){
    if(event.keyCode == 13){
        $("#SendMessage").click();
    }
  });

  $("#voicemute" ).click(function() {
    console.log(" Voice Mute ");
    if(!$("#voicemute").hasClass("audio_btn_Notworking")){
	    $(this).toggleClass("audio_btn_inactive");
	    voicemuteunmute();
    }

  });

  $("#videomute" ).click(function() {
    console.log("video off ");
    if(!$("#videomute").hasClass("camera_btn_Notworking")){
    	$(this).toggleClass("camera_btn_inactive");
    	videomuteunmute();
    }

  });

  $("#remotewindow" ).click(function() {
    console.log("remote window ");
    $(this).toggleClass("btn-style-active");
    remotemuteunmute();
  });

  //manuals 
  $("#manuals").click(function() {
      console.log(" Manuals ");
      var newURL = 'https://tfxserver.above-inc.com/static/manuals/src/menu.html';
      chrome.tabs.create({ url: newURL });
  });




  /* ---------------------- widget action -------------------------------- */


  // prepare the widget iframe for self side 
  function prepareFrame(plugintype, finalh , finalw) {

      if (document.getElementById(plugintype)!=null){       //frame exists just edit the src		
      		console.log(" switch between parallel frames ");
      		showcurrentwidget(plugintype);    // switch between parallel frames                       
      }      
      else { 						            //iframe doesnt exist create one and edit src
          createFrame(plugintype, finalh, finalw);
          TFXPluginShareFunction(plugintype, finalh, finalw);
      }
  }

  //create a iframe for holding the plugin / size of iframe is determined by prepareframe ans sync frame functions 
  function createFrame(plugin, pluginh, pluginw){

  	if(document.getElementById(plugin)==null){
  		console.log(" creating the frame "+ plugin);

	    ifrm = document.createElement("IFRAME");
	    ifrm.setAttribute("id", plugin);
	    ifrm.setAttribute("frameborder",0);

	        //set url for iframe location
	    var i;
	    for(i = 0; i < widgetarray.length; i++) {
	        
		      if(widgetarray[i].plugintype==plugin){

		  	     ifrm.className = "widget_"+i;
		          //check if resize if required or not 
		          if(widgetarray[i].resize=="yes"){             // console.log("widegt size eqialise yes");
		             //ifrm.style.height=pluginh+"px"; 
		             // ifrm.style.width=pluginw+"px";
		          }
		          else if (widgetarray[i].resize=="no"){            //console.log("widegt size eqialise no");
		            //  ifrm.style.height= document.getElementById("widget_loader").style.height;
		             // ifrm.style.width=document.getElementById("widget_loader").style.width;
		          }

		          // here i need to check if the ifrma src exists or not if not display a small message that widget is unsvaiable instead of blank page
		          var url = "widgets/"+widgetarray[i].path+"/index.html";

		          window.updateWidget(i)

		          $.get(url).done(function () {          
		              ifrm.src=url;
		              console.log(" sucessfully loaded Iframe url : "+ ifrm.src);
		          }).fail(function (err) {
		              console.log(" Error"+  err);
		              ifrm.src="../../src/error/error.html";            
		          });
		      }     
	    } // finish creating the iframe

		  var target = document.getElementById("widget_loader");
		  target.appendChild(ifrm);
	  	}
        showcurrentwidget(plugin);		// switch between parallel frames
  }

  function showcurrentwidget(plugin){
			//iframes exists just call the approproate iframe for the widget hide other iframes
  	    for (x in widgetarray){
		    if(widgetarray[x].type!=plugin && document.getElementById(widgetarray[x].type)!=null){			      	
		      	if(widgetarray[x].persistance=="true")
		      		hideframe(widgetarray[x].type);
		      	else if(widgetarray[x].persistance=="false") {
		      		closeframe(widgetarray[x].type);
		      	}
	      	}
	      	else if(widgetarray[x].type==plugin && document.getElementById(widgetarray[x].type)!=null){
	      		currentframe=widgetarray[x].type;
	      		showframe(widgetarray[x].type);
	      	}
	  	}
  }

	function removeFrame(plugin){
	    console.log(" Hide current frame -> leave screen blank");
         //check for persistance flag in widgets manifest if persistance if true then do not unload otherwise unload ( remove ) the iframe
            for (x in widgetarray){
			    if(widgetarray[x].type==plugin && document.getElementById(widgetarray[x].type)!=null){			      	
			      	if(widgetarray[x].persistance=="true")
			      		hideframe(widgetarray[x].type);
			      	else if(widgetarray[x].persistance=="false") {
			      		closeframe(widgetarray[x].type);
			      	}
		      	}
		  	}
        currentframe='';
	}

  function showframe(framename){
 			document.getElementById(framename).removeAttribute("hidden");
  }

  function hideframe(framename){
  		document.getElementById(framename).hidden = true;
  }

  function closeframe(framename){
	  	var someIframe = window.parent.document.getElementById(framename);
			someIframe.parentNode.removeChild(window.parent.document.getElementById(framename));
  }


  /*----------------script for drawers -------------------------*/
  //$("#flash_screen").show();

$(".main_container").show();

$(".widget-panel").animate({"left":"-60px"});

$("#widget_toolbar").height(window.innerHeight-42);
		var _controls = $(".controls");

$(".settings_btn").click(function(){
  if (_controls.css('left') == "0px") {
    _controls.animate({"left":-1*_controls.width()+"px"})
  }else{
    _controls.animate({"left":"0px"})
  }   
});

$("#media_settings_btn").click(function(){
	  if($("#videomute").attr('class').indexOf("camera_btn_Notworking")<=0 && 
	  	$("#voicemute").attr('class').indexOf("audio_btn_Notworking")<=0)	  	 
	  	chooseMedia();
	  else
	  	alert("To Choose Media Devices remove media block permissions from Chrome Settings");
});

/*  ------------------ make local video draggable and movable ----------------- */
/*  $('#localVideoContainer').draggable();
  $('#localVideoContainer').resizable({
      aspectRatio: true,
      handles: 'ne, se, sw, nw'
  });*/

} // window on load finisnhes 


//---------------------------------statistics----------------------------------------

//overwriting the getWebRTCstarts function with more detailed logic
var globalObject = {
    audio: {},
    video: {}
};

function getWebrtcStats(peer) {
    console.log(" ----statistics-----");
    
    peer.getStats(function (param,results) {
        
        var result = {
            audio: {},
            video: {},
            results: results
        };

        for (var i = 0; i < results.length; ++i) {
              
              var res = results[i];

              if (res.googCodecName == 'opus') {
                  if (!globalObject.audio.prevBytesSent)
                      globalObject.audio.prevBytesSent = res.bytesSent;

                  var bytes = res.bytesSent - globalObject.audio.prevBytesSent;
                  globalObject.audio.prevBytesSent = res.bytesSent;

                  var kilobytes = bytes / 1024;

                  result.audio = merge(result.audio, {
                      availableBandwidth: kilobytes.toFixed(1),
                      inputLevel: res.audioInputLevel,
                      packetsLost: res.packetsLost,
                      rtt: res.googRtt,
                      packetsSent: res.packetsSent,
                      bytesSent: res.bytesSent
                  });
              }

              if (res.googCodecName == 'VP8') {
                  if (!globalObject.video.prevBytesSent)
                      globalObject.video.prevBytesSent = res.bytesSent;

                  var bytes = res.bytesSent - globalObject.video.prevBytesSent;
                  globalObject.video.prevBytesSent = res.bytesSent;

                  var kilobytes = bytes / 1024;

                  result.video = merge(result.video, {
                      availableBandwidth: kilobytes.toFixed(1),
                      googFrameHeightInput: res.googFrameHeightInput,
                      googFrameWidthInput: res.googFrameWidthInput,
                      googCaptureQueueDelayMsPerS: res.googCaptureQueueDelayMsPerS,
                      rtt: res.googRtt,
                      packetsLost: res.packetsLost,
                      packetsSent: res.packetsSent,
                      googEncodeUsagePercent: res.googEncodeUsagePercent,
                      googCpuLimitedResolution: res.googCpuLimitedResolution,
                      googNacksReceived: res.googNacksReceived,
                      googFrameRateInput: res.googFrameRateInput,
                      googPlisReceived: res.googPlisReceived,
                      googViewLimitedResolution: res.googViewLimitedResolution,
                      googCaptureJitterMs: res.googCaptureJitterMs,
                      googAvgEncodeMs: res.googAvgEncodeMs,
                      googFrameHeightSent: res.googFrameHeightSent,
                      googFrameRateSent: res.googFrameRateSent,
                      googBandwidthLimitedResolution: res.googBandwidthLimitedResolution,
                      googFrameWidthSent: res.googFrameWidthSent,
                      googFirsReceived: res.googFirsReceived,
                      bytesSent: res.bytesSent
                  });
              }

              if (res.type == 'VideoBwe') {
                  result.video.bandwidth = {
                      googActualEncBitrate: res.googActualEncBitrate,
                      googAvailableSendBandwidth: res.googAvailableSendBandwidth,
                      googAvailableReceiveBandwidth: res.googAvailableReceiveBandwidth,
                      googRetransmitBitrate: res.googRetransmitBitrate,
                      googTargetEncBitrate: res.googTargetEncBitrate,
                      googBucketDelay: res.googBucketDelay,
                      googTransmitBitrate: res.googTransmitBitrate
                  };
              }
                    
              // res.googActiveConnection means either STUN or TURN is used.
              if (res.type == 'googCandidatePair' && res.googActiveConnection == 'true') {
                  result.connectionType = {
                      local: {
                          candidateType: res.googLocalCandidateType,
                          ipAddress: res.googLocalAddress
                      },
                      remote: {
                          candidateType: res.googRemoteCandidateType,
                          ipAddress: res.googRemoteAddress
                      },
                      transport: res.googTransportType
                  };
              }
         } // close for loop

/*       console.log(result.audio);
         console.log(result.video);
         console.log(result.connectionType);
         console.log(result.results);*/
         
        document.getElementById("stats").contentWindow.printStats("audiostats",result.audio);
        document.getElementById("stats").contentWindow.printStats("videostats",result.video);
        document.getElementById("stats").contentWindow.printStats("connectionstats",result.connectionType);

        setTimeout(function () {
            getWebrtcStats(peer);
        }, 2000);

    }); // close peer.getstats
} // close webrtcgetstats


function merge(mergein, mergeto) {
    if (!mergein) mergein = {};
    if (!mergeto) return mergein;

    for (var item in mergeto) {
        mergein[item] = mergeto[item];
    }
    return mergein;
}

function sendMessage(msg){
    if(room) webrtc.sendControlPackets(msg);
}

function sendWidgetMessage(widgetmsg){
    if(room) webrtc.sendControlPackets(widgetmsg);
}

function sendWidgetContent(evt){
    if(room) webrtc.sendControlPackets(evt.data);
}

window.onunload = window.onbeforeunload = function(){
  localStorage.setItem("room", '');
  webrtc.leaveRoom(); // just as joinRoom() is called on webrtc event line 19 . This is calling leave room onbeforeunload
  localStorage.setItem("session", "inactive");
  chrome.extension.sendMessage({status: "bye"}, function() {});
}
window.addEventListener("message",sendWidgetContent,false);

function updateplugin(name , content){
  document.getElementById(name).contentWindow.postMessage(content,'*');
}