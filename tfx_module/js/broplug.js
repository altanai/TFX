
/*
* This is Broplug API 
* It uses simplewebrtc.js and socket.io to make a plugin based platform 
* over WebRTC API . It establhes a p2p media stream network and loads widgets from 
* widgetmanifest.json .
* Author : Altanai
* Date : 12 Jan 2015 
* Product : TFX
*/

//var broPlugId = chrome.runtime.id;
var broPlugId = "123456";

//var room =  localStorage.getItem("room");
var room = null;
var membersCount=0;
var callflag=0;
var webrtc; // universal method for webrtc initiliiazation

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



/* --------------webrtc -------------------------------*/

webrtc = new SimpleWebRTC({
    url: 'https://tfxserver.above-inc.com:8888',
    socketio: {/* 'force new connection':true*/},
    debug: true,
    localVideoEl: 'localVideo',
    remoteVideosEl: '',
    enableDataChannels: true,
    autoRequestMedia: true,
    autoRemoveVideos: true,
    adjustPeerVolume: true,
    peerVolumeWhenSpeaking: 0.25,
    media: {
        video: true,
        audio: true
    },
    localVideo: {
        autoplay: true,
        mirror: true,
        muted: true
    }
});

console.log(" webrtc ",webrtc );
console.log(" Signalling server ", webrtc.config.url);
console.log(" Socketio ", webrtc.config.socketio);
console.log(" ICE  ", webrtc.webrtc.config.peerConnectionConfig.iceServers);

//membersCount=webrtc.webrtc.getPeers().length+1;

webrtc.on('readyToCall', function () {
  console.log(" readyToCall : connection established with server --- ");
  console.log(webrtc.webrtc.isAudioEnabled);
  console.log(webrtc.webrtc.isVideoEnabled);
  $("#notificationsBox").html(" connected to Server ");
  $("#roomnameInputDiv").show();
  showtooltip(tooltiproomnotifications , "bubbletooltip" , "Enter session name here");
});

webrtc.on("joinedRoom",function(){
  $("#connectionnotification").text("Joined the session");

  if(webrtc.webrtc.getPeers().length==0){
    $("#notificationsimage").attr('src','');
  	$("#notificationsBox").html('<div class="roboto"> <span class="fw-100">Oops!</span> <br/> 	<span class="fw-400">It takes two to Tango</span> <br/> <span class="fw-100-small">Why dont you invite someone</span>  </div>');
    hidetooltip(tooltiproomnotifications);
    LoadshareButtons(room);
    $('#shareDiv').share({
    	networks: ['facebook','googleplus','twitter','email' ,'linkedin', 'tumblr']
	  });
    showDiv('shareDiv');
    $("#roomName").html(webrtc.roomName);
    $("#roomnameInputDiv").hide();
    $("#roomNameDiv").show();
  }
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
     $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() +'\n'+ 'other : '+ data.message );
  	}
  
  	if (data.type == 'plugin') {
         console.log("plugin message recived"+ data.action);
          
         if(data.action=='create'){
              console.log("Create Plugin  "+data.plugintype);
              createFrame(data.plugintype , data.dimensionh , data.dimensionw );
         }else if(data.action=='update'){
              console.log("Update Plugin  " + data.plugintype );
              updateplugin(data.plugintype , data.content);
         }else if (data.action=='EqualSize'){
              console.log("EqualSize  Plugin  "+data.plugintype+" || " + data.dimensionh + " " + data.dimensionw);
              prepareFrame(data.plugintype, data.dimensionh, data.dimensionw);
         }else if (data.action=='remove'){
              console.log("Close Plugin  "+data.plugintype);
              removeFrame(data.plugintype);
         }
  	}
});

webrtc.on("RoomTaken",function(){
  console.log(" Room is already taken by 2 members");
 	showtooltip(tooltiproomnotifications, "bubbletooltip","Sorry this session name is already taken");
});

webrtc.on('videoAdded', function (video, peer) {

  	var remotes = document.getElementById('remotes');
  	if (remotes) {
      var d = document.createElement('div');
      d.className = 'videoContainer';
      d.id = 'container_' + webrtc.getDomId(peer);

      video.setAttribute("width", "200px");
      video.setAttribute("height", "200px");
      video.setAttribute("hidden", "true");
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

      callflag=1;		//call was established sucessfully between 2 particiapnats  
      //send both video for caanvas to show local on side screen and remote video on main canvas
      resizeTFX(document.getElementById("localVideo"),video);
      $(window).trigger('resize');
  	}
});

webrtc.on('videoRemoved', function (video, peer) {
  var remotes = document.getElementById('remotes');
  var el = document.getElementById('container_' + webrtc.getDomId(peer));
  if (remotes && el) {
      remotes.removeChild(el);

    resizeTFX(document.getElementById("localVideo"),null);
      //clear the activity on frames . so that when partner joins he has fresh frames 
      //clearFrames();
  }
});


function showDiv(name){
  if(document.getElementById(name))
  document.getElementById(name).removeAttribute("hidden");
}

function hideDiv(name){
  if(document.getElementById(name))
  document.getElementById(name).hidden = true;
}

//setting the media paremeteres
document.getElementById('videomute').value="unmuted";
document.getElementById('voicemute').value="unmuted";
//document.getElementById("remotes").value="muted";


function setRoom(name) {
  document.title = "TangoFX Session "+ room;
  $('body').addClass('active');
}

function checkmembersCount(){

	// only for cases when video added is not able to recognises peer joining and leaving activity
	if(webrtc.webrtc.getPeers().length>1){
		callflag=1;		//call was established sucessfully between 2 particiapnats  
    $('#notifications').text('');
    hideDiv("notificationsDiv");
    hidetooltip(tooltiproomnotifications);
	}
	else if(webrtc.webrtc.getPeers().length==0 && callflag ==1){
		//close all current frames
		for (x in widgetarray){
			if(document.getElementById(widgetarray[x].type)!=null){			      	
		      	closeframe(widgetarray[x].type);
			}
		}
		//set calllflag back to 0
		callflag=0;
    showDiv("notificationsDiv"); 
   	$('#notifications').text('Your partner has left');
	}
}


  /* ------------------------- canvas settings ------------------------------- */


  /*$("#close" ).click(function() {
    console.log("close window ");
    window.close();
  });

  $("#Help").click(function(){
    console.log("help");
    $("#helpDiv").toggle();
  });

  //Settings window
  $("#Settings").click(function() {
    console.log(" Settings ");
    var newURL = 'chrome-extension://'+broPlugId+'/src/browser_action/SettingsPage.html';
    chrome.tabs.create({ url: newURL });
  });

  $("#Media").click(function(){
    console.log("media");
    $("#mediaDiv").toggle();
  });

  $("#playtestsound").click(function(){
    playtestsound('audio1', 'play');
  });

  $("#filesharing_button").click(function(){
    shareFile();
  });*/

  function chooseDesktop(message, sender, sendResponse) {
    console.log(" choose desktop capture ");
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
  
    console.log( " test fail "+JSON.stringify(err));

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
  console.log( " test okay for "+ type);
  if(type=="audio"){
    $('#notifications').prepend('<img src="../../icons/audio_working.png"/>');
   // $('#notifications').prepend("Audio Okay");
  }
  else if ( type=="video"){
    document.getElementById("bgmenuvid").height=screen.height-100;
    document.getElementById("bgmenuvid").width=screen.width-200;
    document.getElementById("bgmenuvid").src=URL.createObjectURL(stream);
   $('#notifications').prepend('<img src="../../icons/video_working.png"/>');
   // $('#notifications').prepend("Video Okay");
  }
}



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
   	window.prompt(" Send this link to your friend , Copy to clipboard: Ctrl+C, Enter" ,document.getElementById("tooltiproomnotifications").getAttribute("bubbletooltip") );
   //window.prompt("Copy to clipboard: Ctrl+C, Enter", document.getElementsByTagName("tooltiproomnotifications")[1].textContent);
});

window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    console.error(" Error " , msg );
    //window.location.href = "index.html";
    //return true;
}

document.addEventListener('DOMContentLoaded', function(){ 
  document.getElementById("btnTangoNow").onclick=function(){
    TFXcreateroom("roomInputBox");
  }
}, false);
