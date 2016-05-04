
/*
* This is Broplug API 
* It uses simplewebrtc.js and socket.io to make a plugin based platform 
* over WebRTC API . It establhes a p2p media stream network and loads widgets from 
* widgetmanifest.json .
* Author : Altanai
* Date : 12 Jan 2015 
* Product : TFX
*/

//use  window.load or document.ready to wait till the contents of window have loaded .
// this is done in order to avoid jquerry not loading problems 
var broPlugId= chrome.runtime.id;

//var room =  localStorage.getItem("room");
var room = null;
var membersCount=0;
var callflag=0;
var webrtc; // universal method for webrtc initiliiazation
var TFXlocalVideo,TFXremoteVideo , TFXlocalStream , TFXremoteStream;
var TFXvoiceoff , TFXvoiceon , TFXvideooff , TFXvideoon , TFXclose ; 
var TFXjoinRoom , TFXPluginFunction , TFXPluginShareFunction ,TFXstats;
var TFXgetRoom;

var widgetarray=[];
var currentframe='';
var finalh , finalw ;
var remoteVideoHandler;


/*--------------------- Media choose settings ------------------------------*/

//default media options , will be changed with choose media 

var mediaOptions = {
    audio: true,
    video: true
};

if(localStorage.getItem('selectedVideoDevice')!=''){
	  mediaOptions.video = {
	      optional: [
	        { sourceId: localStorage.getItem('selectedVideoDevice') }
	      ]
	  };
}

if(localStorage.getItem('selectedAudioDevice')!=''){
	mediaOptions.audio = {
	  optional: [
	    { sourceId: localStorage.getItem('selectedAudioDevice') }
	  ]
	};
}


var audioDevices = [],
    videoDevices = [];

function chooseMedia(){ 
   
  audioDevices = []; 
  videoDevices = [];
  var mediaChooseArea = document.getElementById('mediaChooseArea');

	if (typeof MediaStreamTrack === 'undefined') {
	  console.log('This browser does not support MediaStreamTrack.');
	  audioDevices.push({
	      id: 'default',
	      label: 'Default'
	  });
	  videoDevices.push({
	      id: 'default',
	      label: 'Default'
	  });
	} 

	else {
	    MediaStreamTrack.getSources(function (sourceInfos) {
	      for (var i = 0; i !== sourceInfos.length; ++i) {
	          var sourceInfo = sourceInfos[i];
	          if (sourceInfo.kind === 'audio') {
	              sourceInfo.label = sourceInfo.label || 'microphone ' + (audioDevices.length + 1);
	              audioDevices.push(sourceInfo);
	          } else if (sourceInfo.kind === 'video') {
	              sourceInfo.label = sourceInfo.label || 'camera ' + (audioDevices.length + 1);
	              videoDevices.push(sourceInfo);
	          }
	      }


        $('#videodevices').html(' ');
        $.each(videoDevices, function(index, item) {
            $('#videodevices').append($("<option />").val(item.id).text(item.label));
        }); 

        $('#audiodevices').html(' ');
        $.each(audioDevices, function(index, item) {
            $('#audiodevices').append($("<option />").val(item.id).text(item.label));
        }); 

        if(localStorage.getItem('selectedAudioDevice'))
          $('#audiodevices').val(localStorage.getItem('selectedAudioDevice'));

        if(localStorage.getItem('selectedVideoDevice'))
          $('#videodevices').val(localStorage.getItem('selectedVideoDevice'));

        $("#choosemediapopup" ).dialog({
          resizable: false,
		  width:'35%',
          modal: true,
          buttons: {
            "Save": function() {

              localStorage.setItem('selectedVideoDevice', $('#videodevices').val());
              localStorage.setItem('selectedAudioDevice', $('#audiodevices').val());

              mediaOptions.audio = {
                  optional: [
                    { sourceId: localStorage.getItem('selectedAudioDevice') }
                  ]
              };

              mediaOptions.video = {
                  optional: [
                    { sourceId: localStorage.getItem('selectedVideoDevice') }
                  ]
              };

               window.navigator.webkitGetUserMedia(mediaOptions,function success(stream) {
                   document.getElementById("localVideo").src = window.URL.createObjectURL(stream);
                 },function error(){ alert("Unable to select this media option.");});
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
	    });

		console.log(" choose Media || Video ->  ", videoDevices, " || Audio -> ", audioDevices );
 
	}
} 

/*----------------------detect OS -----------------*/
var OSName="Unknown OS";
if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

DEBUG && console.log('Your OS: '+OSName);

/*------------------------------------------------*/

//window.onload=windowOnload;
function windowOnload() {

  //load from jspon widget file 
  readWidgetsjson();
  
  //speed test every 3 minutes interval
  window.setInterval(MeasureConnectionSpeed, 120000);

  // create our webrtc connection
  webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: '',
    autoRequestMedia: true,
    debug:false,
    detectSpeakingEvents: false,
    autoAdjustMic: false,
    media: mediaOptions
  });

  DEBUG && console.log(" Signalling server ", webrtc.config.url);
  DEBUG && console.log(" Socketio ", webrtc.config.socketio);
  DEBUG && console.log(" ICE  ", webrtc.webrtc.config.peerConnectionConfig.iceServers);

  membersCount=webrtc.webrtc.getPeers().length+1;

  webrtc.on('readyToCall', function () {
    DEBUG && console.log(" connection established with server --- ");
   // alert(webrtc.webrtc.isAudioEnabled);
	/*   webrtc.webrtc.localStream.getVideoTracks.forEach(function (track) {
	            alert(track.enabled);
	        });
	*/
    //alert(webrtc.webrtc.isVideoEnabled);
  });

 // showtooltip(tooltiproomnotifications , 'Enter session name here .Click on the tango button and share the session link with your partner');
//  showtooltip(tooltiproomnotifications , "bubbletooltip" , 'Enter session name here');

  //setting the media paremeteres
  document.getElementById('videomute').value="unmuted";
  document.getElementById('voicemute').value="unmuted";
  //document.getElementById("remotes").value="muted";

 // test if mike and camera are connected 
 // testWebRTCLocalVideo( webrtc);
 // testWebRTCLocalAudio( webrtc);

/*  function testWebRTCLocalVideo(obj){
     obj.playVideo();
  }

  function testWebRTCLocalAudio(obj){
     obj.playAudio();
  }*/

 	function shortenURL(url){
		
		if(gapi.client!=undefined && url!=null){
			DEBUG && console.log("shorten this URL : ", url);
			//var apiKey = 'AIzaSyCs5YkMagLL83csX_6eABwEvsE3Oj_kMmo';
			var apiKey='AIzaSyAnPxrh7veHDrDaPjoTRJJV7GoqIoIYgOw';
			gapi.client.setApiKey(apiKey);
			//var longurl = 'https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid=afbomhocbhkipjmmlpbjceldmpceicgl&roomname=fvbdzf';
			var longurl= url;
			var request , response;

			gapi.client.load('urlshortener', 'v1', function() {
			    
			    request = gapi.client.urlshortener.url.insert({
			        'resource': {
			            'longUrl': longurl
			        }
			    });
			    
			    response = request.execute(function(resp) {
			        if (resp.error) {
			            DEBUG && console.log('Error: ' + resp.error.message);

			            //incase of error return the same url as inputed 
                        localStorage.setItem('shorturl', url);
			            showtooltip(tooltiproomnotifications,"bubbletooltip",url);

			        } else {
			        	//sucessful obatining the short url from googl url shortner API
                        localStorage.setItem('shorturl', resp.id);
			           	showtooltip(tooltiproomnotifications,"bubbletooltip",resp.id);
			           // $("#show").html("Short URL for "+longurl+" is: " + resp.id);
			        }
			    });
			});
		}
		else{
			DEBUG && console.log(" gapi.client is undefined ");
		}
	}

   TFXjoinroom=function(){
    room = location.search.substring(1);
    localStorage.setItem("session", "active");

    if (room){
   	    webrtc.joinRoom(room);
   	    var url='https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+room;
	    gapi.load('client', function() { 
		  DEBUG && console.log('gapi.client loaded.');
		  shortenURL(url);
		});
    } 

    membersCount=webrtc.webrtc.getPeers().length+1;
    resizeCanvas(membersCount, document.getElementById("localVideo"),null);
}

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

  webrtc.on("joinedRoom",function(){
    DEBUG && console.log("Joined Room",room);
    //showtooltip(tooltiproomnotifications, "bubbletooltip","Joined the session");	
    $("#connectionnotification").text("Joined the session");
    membersCount=webrtc.webrtc.getPeers().length+1;

    if(membersCount<=1){
    	$("#notifications").html('<div class="roboto"> <span class="fw-100">Oops!</span> <br/> 	<span class="fw-400">It takes two to Tango</span> <br/> <span class="fw-100-small">Why dont you invite someone</span>  </div>');
	    //load the sharing button so that user can share the 
	    LoadshareButtons(room);
	    $('#shareDiv').share({
	    	networks: ['facebook','googleplus','twitter','email' ,'linkedin', 'tumblr']
		});
	    showDiv('shareDiv');
		// URL for joing page : 'https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname
    }

  });

  webrtc.on("RoomTaken",function(){
    DEBUG && console.log(" Room is already taken by 2 members");
 	showtooltip(tooltiproomnotifications, "bubbletooltip","Sorry this session name is already taken");
  });

  webrtc.on('channelMessage', function (peer, label, data) {
/*  if (data.type == 'volume') {
      showVolume(document.getElementById('volume_' + peer.id), data.volume);
  }*/
  if (data.type == 'message') {
     $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() +'\n'+ 'other : '+ data.message );
  }
  if (data.type == 'plugin') {
          DEBUG && console.log("plugin message recived"+ data.action);
          
          if(data.action=='create'){
              DEBUG && console.log("Create Plugin  "+data.plugintype);
              createFrame(data.plugintype , data.dimensionh , data.dimensionw );
          }
          else if(data.action=='update'){
              DEBUG && console.log("Update Plugin  " + data.plugintype );
              updateplugin(data.plugintype , data.content);
          }
          else if (data.action=='EqualSize'){
              DEBUG && console.log("EqualSize  Plugin  "+data.plugintype+" || " + data.dimensionh + " " + data.dimensionw);
              prepareFrame(data.plugintype, data.dimensionh, data.dimensionw);
          }
          else if (data.action=='remove'){
              DEBUG && console.log("Close Plugin  "+data.plugintype);
              removeFrame(data.plugintype);
          }
  }
  });

  webrtc.on('videoAdded', function (video, peer) {

	  var remotes = document.getElementById('remotes');
	  
	  if (remotes) {

	      var d = document.createElement('div');
	      d.className = 'videoContainer';
	      d.id = 'container_' + webrtc.getDomId(peer);
	      //DEBUG && console.log("remote video buffered length "+ video.buffered.length);
	      video.setAttribute("width", "200px");
	      video.setAttribute("height", "200px");
	      video.setAttribute("hidden", "true");
	      video.setAttribute("autoplay", "true");
	      d.appendChild(video);

/*	      var vol = document.createElement('div');
	      vol.id = 'volume_' + peer.id;
	      vol.className = 'volume_bar';
*/
	      video.onclick = function () {
	          video.style.width = video.videoWidth + 'px';
	          video.style.height = video.videoHeight + 'px';
	      };

	      /*d.appendChild(vol);*/
	      remotes.appendChild(d);

	      membersCount=webrtc.webrtc.getPeers().length+1;
	/*    membersCount++;*/
	      DEBUG && console.log("Peer Added || Memebers count "+ membersCount);
	      
	      callflag=1;		//call was established sucessfully between 2 particiapnats  

	      //send both video for caanvas to show local on side screen and remote video on main canvas
	      resizeCanvas(membersCount,document.getElementById("localVideo"),video);
	  }
  });

  webrtc.on('videoRemoved', function (video, peer) {
	  var remotes = document.getElementById('remotes');
	  var el = document.getElementById('container_' + webrtc.getDomId(peer));
	  if (remotes && el) {
	      remotes.removeChild(el);

		  membersCount=webrtc.webrtc.getPeers().length+1;
	/*    membersCount--;
	      DEBUG && console.log(" Peer removed || Memebers count "+ membersCount);*/

	      //send only local video to be show on main canvas 
	      resizeCanvas(membersCount,document.getElementById("localVideo"),null);
	      //clear the activity on frames . so that when partner joins he has fresh frames 
	      //clearFrames();
	  }
  });

  function setRoom(name) {
	  document.title = "TangoFX Session "+ room;
	  $('body').addClass('active');
  }

	function checkmembersCount(){
		membersCount=webrtc.webrtc.getPeers().length+1;

		// only for cases when video added is not able to recognises peer joining and leaving activity
		if(membersCount>=2){
			callflag=1;		//call was established sucessfully between 2 particiapnats  
	        $('#notifications').text('');
	        hideDiv("notificationsDiv");
	        hidetooltip(tooltiproomnotifications);
		}
		else if(membersCount==1 && callflag ==1){
			//close all current frames
			for (x in widgetarray){
				DEBUG && console.log(widgetarray[x].type);
				if(document.getElementById(widgetarray[x].type)!=null){			      	
			      		closeframe(widgetarray[x].type);
				 }
			}
			//set calllflag back to 0
			callflag=0;
			//show the notification in red color box
	        showDiv("notificationsDiv"); 
	   		$('#notifications').text('Your partner has left');
		}

		//DEBUG && console.log(membersCount);
	}

   var checkmemCounVar = setInterval(function(){ checkmembersCount() }, 3000);

  //function to return room anme to any widget thats asks for it 
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

/* ----------------------------- webrtc media settings ------------------------ */
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
  }
  /* ------------------------- canvas settings ------------------------------- */
  window.addEventListener('resize', resizeCanvasalready, false);
  var w , h; // height and width of video container 
  var i , j; // interval  for local and remote video

//for reszing a canvas where the inner element are not be disturbed  ie just trigered by resize action
  function resizeCanvasalready(){
  	resizeCanvas(membersCount,document.getElementById("localVideo"),document.getElementById("remotes").getElementsByTagName("video")[0]);
  }

//canvas resized and reset
  function resizeCanvas(memCount,video1,video2) {
	var canvas = document.getElementById('myCanvas');
    h=window.innerHeight;
    w=window.innerWidth;
    canvas.height=h;
	canvas.width=w;

    if(video1==undefined)
    	video1=document.getElementById("localVideo");

    if(video2==undefined){
    	if(document.getElementById("remotes").getElementsByTagName("video")[0]!=undefined)
    		video2=document.getElementById("remotes").getElementsByTagName("video")[0];
    	else
    		video2=null;
    }
   	membersCount=webrtc.webrtc.getPeers().length+1;
    switchVideo(membersCount,video1, video2);
  }

  // switch video from local area to widget area on members participlation 
  function switchVideo(memCount,v1,v2){

  	DEBUG && console.log("No of participants: membersCount -> " +membersCount );

		if(membersCount==1){
		    //console.log("only one participant in session , show his video on canvas show waiting for other parties to join above his video stream");
		    drawStuff(v1,v2,h,w);
		    hideDiv("localVideo");
		    $("#media_settings_btn").removeClass("hidedisplay");
		    
		    if (callflag==0){
		       showDiv("notificationsDiv");
		    }
		    else if(callflag==1){
		      showDiv("notificationsDiv"); 
		      $('#notifications').text('Your partner has left');
		    }
		}

		else if(membersCount==2){
	       // DEBUG && console.log("more than one mebers present add the remote persons video to canvas center");
	       //console.log(" video 1 ", v1 , " video 2 ", v2 );
	       //stop the waiting music 
	       // stopWaitingMusic();
	        if(v1!=null && v2!=null && v1!=v2){          
	            drawStuff(v1,v2,h,w);
	            showDiv("localVideo");
	        }
	        $('#notifications').text('');
	        hideDiv("notificationsDiv");
	        $("#media_settings_btn").addClass("hidedisplay");
	        hidetooltip(tooltiproomnotifications);
		} 

  }

  function drawStuff(localvideo,remotevideo,height,width) {
  	DEBUG && console.log("localvideo ", localvideo, " remotevideo", remotevideo, " height ", height , "width ", width);
  	  var canvas = document.getElementById('myCanvas');
	  var ctx =canvas.getContext("2d");
	  var v = '';
  	//clearCanvas(ctx,"#000");
  	
    if( localvideo!=null && remotevideo==null){
      DEBUG && console.log(" drawing local video on canvas" );
      clearInterval(i);
      localvideo.addEventListener('play', paintCanvas(localvideo , ctx, width , height));
    }

    else if ( localvideo!=null && remotevideo!=null  && localvideo != remotevideo){
      DEBUG && console.log(" drawing remote video on canvas ");
      clearInterval(i);
      remotevideo.addEventListener('play', paintCanvas(remotevideo , ctx, width , height));
    }
  }

  function paintCanvas(v,c,w,h) {
    c.clearRect(0, 0, w, h);
    i=window.setInterval(function() {
           c.drawImage(v,0,0,w,h)
         },20);
  }

  function clearCanvas(c, color){
    DEBUG && console.log("clear canvas ");
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  }

  function showDiv(name){
    document.getElementById(name).removeAttribute("hidden");
  }

  function hideDiv(name){
    document.getElementById(name).hidden = true;
  }

  /*---------- broplug API methods to let widgets access the video and audio -----------*/

  TFXlocalVideo = function getTFXlocalVideo(plugintype,elementid){
    DEBUG && console.log("TFX Local Video for plugin " + plugintype+" ||  element id " + elementid);
    var childvideo = document.getElementById(plugintype).contentWindow.pluginlocalVideo;
    var childsource = document.createElement('source');

    childsource.setAttribute('src', document.getElementById("localVideo").src);

    childvideo.appendChild(childsource);
    childvideo.play();
  }

  TFXremoteVideo = function getTFXremoteVideo(plugintype,elementid){
    DEBUG && console.log("TFX Remote Video for plugin " + plugintype+" ||  element id " + elementid);
    var childvideo = document.getElementById(plugintype).contentWindow.pluginremoteVideo;
    var childsource = document.createElement('source');
    childsource.setAttribute('src', document.getElementById("remotes").getElementsByTagName("video")[0].src);
    childvideo.appendChild(childsource);
    childvideo.play();
  }

  /*------------- waiting sound till user joins -------------------*/
  function playWaitingMusic() {
    var audio = document.getElementById('audio1');
    if (audio.paused) {
        audio.volume=0.2;
        audio.play();
    }else{
        audio.pause();
        audio.currentTime = 0
    }
  }

  function stopWaitingMusic() {
    var audio = document.getElementById('audio1');
    audio.pause();
    audio.currentTime = 0;
  }

  /*------------------ audio stream gathering from simplewebrtc and pasing to plugin frames ------------*/

  TFXlocalStream=function sendaudiostream(pluginname,ss){
    var resultstream;

    if(ss=="ask"){
	     DEBUG && console.log(" broplug requested simplewebrtc for stream ");
	     webrtc.pluginRequestStream(pluginname) 
    }

    else {
	    DEBUG && console.log(" Audio Stream obtained", ss);
	    resultstream=ss;
	    document.getElementById(pluginname).contentWindow.fetchstream(resultstream);
    }
  }

  /*--------------------get statistics from peer connection obeject --------*/

  TFXstats=function stats(){
  	webrtc.passWebrtcStats(); 
  }

  /*---------------------------load widgets ------------------------------*/

  function readWidgetsjson(){
    $.getJSON('../../widgetsmanisfest.json')
    .done(function (data) {
       widgetarray = data;
       DEBUG && console.log(" widgestarray ", widgetarray, "||", widgetarray.length);
/*     for (x in widgetarray){
      		appendWidgetLeftPanel( widgetarray[x].id, widgetarray[x].title, 
            widgetarray[x].icon,  widgetarray[x].type);
      }*/
    });
  }
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
    DEBUG && console.log(" Voice Mute ");
    if(!$("#voicemute").hasClass("audio_btn_Notworking")){
	    $(this).toggleClass("audio_btn_inactive");
	    voicemuteunmute();
    }

  });

  $("#videomute" ).click(function() {
    DEBUG && console.log("video off ");
    if(!$("#videomute").hasClass("camera_btn_Notworking")){
    	$(this).toggleClass("camera_btn_inactive");
    	videomuteunmute();
    }

  });

  $("#remotewindow" ).click(function() {
    DEBUG && console.log("remote window ");
    $(this).toggleClass("btn-style-active");
    remotemuteunmute();
  });

  //manuals 
  $("#manuals").click(function() {
      DEBUG && console.log(" Manuals ");
      var newURL = 'https://tfxserver.above-inc.com/static/manuals/src/menu.html';
      chrome.tabs.create({ url: newURL });
  });

  
  /*$("#close" ).click(function() {
    DEBUG && console.log("close window ");
    window.close();
  });

  $("#Help").click(function(){
    DEBUG && console.log("help");
    $("#helpDiv").toggle();
  });

  //Settings window
  $("#Settings").click(function() {
    DEBUG && console.log(" Settings ");
    var newURL = 'chrome-extension://'+broPlugId+'/src/browser_action/SettingsPage.html';
    chrome.tabs.create({ url: newURL });
  });

  $("#Media").click(function(){
    DEBUG && console.log("media");
    $("#mediaDiv").toggle();
  });

  $("#playtestsound").click(function(){
    playtestsound('audio1', 'play');
  });

  $("#filesharing_button").click(function(){
    shareFile();
  });*/

  function chooseDesktop(message, sender, sendResponse) {
    DEBUG && console.log(" choose desktop capture ");
    chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window"],
      function(id) {
        sendResponse({"id": id});
      });
  }

  function addMessaheLog(msg){
    $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() + '\n'+ 'you : '+ msg);
  }


  function voicemuteunmute() {
    if(document.getElementById('voicemute').value == "unmuted"){
        document.getElementById('voicemute').value="muted";
        TFXvoiceoff();        
    }
    else{
        document.getElementById('voicemute').value="unmuted";
        TFXvoiceon();         
    }
  }

  function videomuteunmute() {
    if(document.getElementById('videomute').value=="unmuted"){
        document.getElementById('videomute').value="muted";
        TFXvideooff();    
    }
    else{
       document.getElementById('videomute').value="unmuted";
        TFXvideoon();     
    }
  }

  function remotemuteunmute() {
    if(document.getElementById("remotes").value=="unmuted"){     
        TFXRemoteVideooff();
        document.getElementById("remotes").value="muted";
    }
    else {
        TFXRemoteVideoon();
        document.getElementById("remotes").value="unmuted";
    }
  }

  /* ---------------------- widget action -------------------------------- */


  // prepare the widget iframe for self side 
  function prepareFrame(plugintype, finalh , finalw) {

      if (document.getElementById(plugintype)!=null){       //frame exists just edit the src		
      		DEBUG && console.log(" switch between parallel frames ");
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
  		DEBUG && console.log(" creating the frame "+ plugin);

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
		              DEBUG && console.log(" sucessfully loaded Iframe url : "+ ifrm.src);
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
	    DEBUG && console.log(" Hide current frame -> leave screen blank");
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
    DEBUG && console.log(" ----statistics-----");
    
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

/*       DEBUG && console.log(result.audio);
         DEBUG && console.log(result.video);
         DEBUG && console.log(result.connectionType);
         DEBUG && console.log(result.results);*/
         
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


/*//default media options
var mediaOptions = {
    audio: true,
    video: true
};
if (selectedAudioDevice && selectedAudioDevice.sourceId) {
    mediaOptions.audio = {
        mandatory: [
          { sourceId: selectedAudioDevice.sourceId }
        ]
    };
}
if (selectedVideoDevice && selectedVideoDevice.sourceId) {
    mediaOptions.video = {
        mandatory: [
          { sourceId: selectedVideoDevice.sourceId }
        ]
    };
}*/


/*
jQuery.fn.center = function(parent) {
    if (parent) {
        parent = this.parent();
    } else {
        parent = window;
    }
    this.css({
        "position": "absolute",
        "top": ((($(parent).height() - this.outerHeight()) / 2) + $(parent).scrollTop() + "px"),
        "left": ((($(parent).width() - this.outerWidth()) / 2) + $(parent).scrollLeft() + "px")
    });
return this;
}

$("div.target:nth-child(1)").center(true).hide();*/
/*$("div.target:nth-child(2)").center(true).hide();*/

//--------------------------------------------------------

function onWebRTCError(type,err){
  
    DEBUG && console.log( " test fail "+JSON.stringify(err));

    if(err.name=="PermissionDeniedError"){
    	showtooltip(tooltipwebrtcnotifications,"webrtctooltip", "Block permisson for webcam acesss.");  
    	
    	$("#videomute").removeClass("camera_btn");
    	$("#videomute").addClass("camera_btn_Notworking");	
    	
    	$("#voicemute").removeClass("audio_btn");	
    	$("#voicemute").addClass("audio_btn_Notworking");	
    }
    else{
    	showtooltip(tooltipwebrtcnotifications,"webrtctooltip", err.name);
    }

   //elem.hidden="true";
   //instead of calling the tooltip directly , call it with timeout to show for 5 seconds only 
   // setTimeout(hidetooltip(elem), 5000);
   setTimeout(function(){
		tooltipwebrtcnotifications.hidden="true";
   }, 5000);

/*  if(type=="audio"){
   // $('#notifications').prepend('<img src="../../icons/audio_Notworking.png"/>');
   // $('#notifications').prepend("Audio Fail " + err.name +" Goto Settings ");
  }
    
  else if ( type=="video"){
   // $('#notifications').prepend('<img src="../../icons/video_Notworking.png"/>');
    //$('#notifications').prepend("Video Fail ." + err.name +" Goto Settings ");
  }
  else{
  	alert(" WebRTC Error -> type ", type , "Error ", err);
/*  	showDiv("notificationsDiv");
    $('#notifications').prepend("Media Fail - " + "<a href='' id='settings'>err.name </a>");
    //Settings window
    $("#settings").click(function() {
        var newURL = 'https://tfxserver.above-inc.com/static/TFXSettings/src/audiovideoaccesserror.html';
        chrome.tabs.create({ url: newURL });
    });
  }*/
/*
  $("#jointfx").hide();
  $('#notifications').append($('#settings'));*/
}


function onWebRTCSucess(type,stream){
  DEBUG && console.log( " test okay for "+ type);
/*  if(type=="audio"){
    $('#notifications').prepend('<img src="../../icons/audio_working.png"/>');
   // $('#notifications').prepend("Audio Okay");
  }
  else if ( type=="video"){
    document.getElementById("bgmenuvid").height=screen.height-100;
    document.getElementById("bgmenuvid").width=screen.width-200;
    document.getElementById("bgmenuvid").src=URL.createObjectURL(stream);
   $('#notifications').prepend('<img src="../../icons/video_working.png"/>');
   // $('#notifications').prepend("Video Okay");
  }*/
}

/*--------------------speed test with tfx server tfx icon -----------*/

//JUST AN EXAMPLE, PLEASE USE YOUR OWN PICTURE!
var imageAddr = "https://tfxserver.above-inc.com/static/tfx1.png"; 
var downloadSize = 1160471; //bytes

function MeasureConnectionSpeed() {

    DEBUG && console.log("testing for speed ");
    var startTime, endTime;
    var download = new Image();

    download.onload = function () {
        endTime = (new Date()).getTime();
        showResults();
    }
    
    download.onerror = function (err, msg) {
        //oProgress.innerHTML = "Invalid image, or error downloading";
        showResultsNonetwork();
        DEBUG && console.log(err, "||" , msg);
    }
    
    startTime = (new Date()).getTime();
    var cacheBuster = "?nnn=" + startTime;
    download.src = imageAddr + cacheBuster;
    
    function showResults() {
        var duration = (endTime - startTime) / 1000;
        var bitsLoaded = downloadSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var speedMbps = (speedKbps / 1024).toFixed(2);
        
        $('#network').attr('title',speedMbps+" Mbps");

        if(speedMbps < 2){
              $('#network').attr('class', 'tango-nav-btn network_btn_inactive');
              if(!$("#videomute").hasClass("camera_btn_Notworking") && !$("#videomute").hasClass("camera_btn_inactive")){
              		showtooltip(tooltipnetworknotifications,"networktooltip", 'Low signals. Turn off video for better performance');
          	  }
          	  else{
          	  		showtooltip(tooltipnetworknotifications,"networktooltip", 'Low signals.');
          	  }

        }else{	
        	$('#network').attr('class', 'tango-nav-btn network_btn');
        	hidetooltip(tooltipnetworknotifications);
        }
        DEBUG && console.log(speedMbps + " Mbps<br/>");
    }


    function showResultsNonetwork(){
    	$('#network').attr('class', 'tango-nav-btn network_btn_unavailable');
    }
}

/*--------------------- jquerry share -------------------------*/

/**
 * jQuery.share - social media sharing plugin
 * ---
 * @author Carol Skelly (http://in1.com)
 * @version 1.0
 * @license MIT license (http://opensource.org/licenses/mit-license.php)
 * ---
 */

//(function ( $, window, undefined ) {
   
var LoadshareButtons =  function sharebuttons(roomname){ 
    
    DEBUG && console.log(" Social networking sharing options ");

    var document = window.document;

    $.fn.share = function(method) {
 
        var methods = {

            init : function(options) {
                this.share.settings = $.extend({}, this.share.defaults, options);
                var settings = this.share.settings,
                    networks = this.share.settings.networks,
                    theme = this.share.settings.theme,
                    orientation = this.share.settings.orientation,
                    affix = this.share.settings.affix,
                    margin = this.share.settings.margin,
                    pageTitle = this.share.settings.title||$(document).attr('title'),
                    pageUrl = this.share.settings.urlToShare||$(location).attr('href'),
                    pageDesc = "";
                
                //console.log(" Room  ", roomname);

                $.each($(document).find('meta[name="description"]'),function(idx,item){
                    pageDesc = $(item).attr("content");
        		});
                
                // each instance of this plugin
                return this.each(function() {
                    var $element = $(this),
                        id=$element.attr("id"),
                        u=encodeURIComponent(pageUrl),
                        t=encodeURIComponent(pageTitle),
                        d=pageDesc.substring(0,250),
                        href;
                    //u ="Page URL for TangoFX", TFXgetRoom;
                    
                    //just instructions
                    //t ="Join the TangoFX at "+ roomname;
                    
                    //auto chomre open content injection 
                    //t= "{TangoFXroom:"+roomname+":TangoFXend}";
                    
                    //regex way of determing room content injection 
                    //t="tfx:"+roomname;
                    
                    //give URL for opeininga html page and injecting script inside it 
                    //var newURL = 'chrome-extension://'+broPlugId+'/src/browser_action/SettingsPage.html';
					//chrome.tabs.create({ url: newURL });
                    //t="http://tangofxsessions.com?session="+roomname;
                	//t="<html><head><title>My title</title></head><body>"+roomname+"</body></html>";
                	//t='<a href="file:///home/altanaibisht/Dropbox/Work/tangofxsessionsshare.html?broplugid=dscfusgcusa&roomname=iuwci">TFX</a>';
                	//t='file:///home/altanaibisht/Dropbox/Work/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname;

					if(localStorage.getItem('shorturl')!=null){
						    t=localStorage.getItem('shorturl');
                			u=localStorage.getItem('shorturl');
					}
					else{
               			    t='https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname;
                			u='https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid='+broPlugId+'&roomname='+roomname;
					}


                    //d ="Welcom to TangoFX at "+ roomname;
                    //d="{TangoFXroom:"+roomname+":TangoFXend}";

                    // append HTML for each network button
                    for (var item in networks) {
                        item = networks[item];
                        href = helpers.networkDefs[item].url;
                        href = href.replace('|u|',u).replace('|t|',t).replace('|d|',d)
                                   .replace('|140|',t.substring(0,130));
                        $("<a href='"+href+"' title='Share this page on "+item+
                            "' class='pop share-"+theme+" share-"+theme+"-"+item+"'></a>")
                            .appendTo($element);
                    }
                    
                    // customize css
                    $("#"+id+".share-"+theme).css('margin',margin);
                    
                    if (orientation != "horizontal"){
                        $("#"+id+" a.share-"+theme).css('display','block');
                    }
                    else {
                        $("#"+id+" a.share-"+theme).css('display','inline-block');
                    }
                    
                    if (typeof affix != "undefined"){
                        $element.addClass('share-affix');
                        if (affix.indexOf('right')!=-1){
                            $element.css('left','auto');
                            $element.css('right','0px');
                            if (affix.indexOf('center')!=-1){
                                $element.css('top','40%');
                            }
                        }
                        else if (affix.indexOf('left center')!=-1){
                            $element.css('top','40%');
                        }
                        
                        if (affix.indexOf('bottom')!=-1){
                            $element.css('bottom','0px');
                            $element.css('top','auto');
                            if (affix.indexOf('center')!=-1){
                                $element.css('left','40%');
                            }
                        }
                    }
                    
                    // bind click
                    $('.pop').click(function(){
                        console.log(" $(this).attr('href')" , $(this).attr('href'));
                        console.log(" t ", t);

                        window.open($(this).attr('href'),'t','toolbar=0,resizable=1,status=0,width=640,height=528');
                        return false;
                    });
                    
                    
                });// end plugin instance
            
            }        
        }

        var helpers = {
            networkDefs: {
                facebook:{url:'http://www.facebook.com/share.php?u=|u|'},

                //http://twitter.com/home?status=jQuery%20Share%20Social%20Media%20Plugin%20-%20Share%20to%20multiple%20social%20networks%20from%20a%20single%20form%20http://plugins.in1.com/share/demo
                //twitter:{url:'https://twitter.com/share?url=|u|&text=|140|'},
                //twitter:{url:'https://twitter.com/share?text=|140|'},
                twitter:{url:'https://twitter.com/share?text=|u|'},

                linkedin:{url:'http://www.linkedin.com/shareArticle?mini=true&url=|u|&title=|t|&summary=|d|&source=in1.com'},
                
                in1:{url:'http://www.in1.com/cast?u=|u|',w:'490',h:'529'},
                
                tumblr:{url:'http://www.tumblr.com/share?v=3&u=|u|'},
                
                digg:{url:'http://digg.com/submit?url=|u|&title=|t|'},
                
                googleplus:{url:'https://plusone.google.com/_/+1/confirm?hl=en&url=|u|'},
                //googleplus:{url:'https://plusone.google.com/_/+1/confirm?hl=en&url=|140|'},
                
                reddit:{url:'http://reddit.com/submit?url=|u|'},
                
                pinterest:{url:'http://pinterest.com/pin/create/button/?url=|u|&media=&description=|d|'},
                
                posterous:{url:'http://posterous.com/share?linkto=|u|&title=|t|'},
                
                stumbleupon:{url:'http://www.stumbleupon.com/submit?url=|u|&title=|t|'},
                
                //email:{url:'mailto:?subject=|t|'}
                email:{url:'mailto:?subject=Please%20Join%20the%20Room&body=|t|'}
            }
        }
     
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method "' +  method + '" does not exist in social plugin');
        }

    }

    $.fn.share.defaults = {
        networks: ['facebook','twitter','linkedin'],
        theme: 'icon', // use round icons sprite
        autoShow: true,
        margin: '3px',
        orientation: 'horizontal',
        useIn1: false
    }

    $.fn.share.settings = {}
 }      
/*})(jQuery, window);*/

/*--------------------tooltips---------------------------*/


function showtooltip (elem ,attr, text) {  
    //elem.setAttribute("bubbletooltip",text);
    elem.setAttribute(attr,text);
    elem.removeAttribute("hidden");
}



function hidetooltip (elem) { 
    elem.hidden="true";
}

document.getElementById("tooltiproomnotifications").addEventListener("click", function(){
//   if(document.getElementById("tooltiproomnotifications").getAttribute("bubbletooltip")!="Enter session name here")
   window.prompt(" Send this link to your friend , Copy to clipboard: Ctrl+C, Enter" ,document.getElementById("tooltiproomnotifications").getAttribute("bubbletooltip") );
   //alert(" Send this link to your friend : "+ document.getElementById("tooltiproomnotifications").getAttribute("bubbletooltip"));
   //window.prompt("Copy to clipboard: Ctrl+C, Enter", document.getElementsByTagName("tooltiproomnotifications")[1].textContent);
});

window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    window.location.href = "index.html";
    return true;
}