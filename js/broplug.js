
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
var broPlugId = chrome.runtime.id;

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

console.log('Your OS: '+OSName);


/* --------------widgets -------------------------------*/
  function readWidgetsjson(){
    $.getJSON('../../widgetsmanisfest.json')
    .done(function (data) {
       	widgetarray = data;
       	console.log(" widgestarray ", widgetarray, "||", widgetarray.length);
	    for (x in widgetarray){
	      	appendWidgetLeftPanel( widgetarray[x].id, widgetarray[x].title, 
	        widgetarray[x].icon,  widgetarray[x].type);
	    }
    });
  }

/*------------------------------------------------*/

//load from jspon widget file 
	readWidgetsjson();

// speed test every 3 minutes interval
// window.setInterval(MeasureConnectionSpeed, 120000);

webrtc = new SimpleWebRTC({
    url: 'http://127.0.0.1:8888',
    //url: 'http://192.168.0.119:8888',
    socketio: {/* 'force new connection':true*/},
    debug: true,
    localVideoEl: 'localVideo',
    remoteVideosEl: '',
    enableDataChannels: true,
    autoRequestMedia: false,
    autoRemoveVideos: true,
    adjustPeerVolume: false,
    //adjustPeerVolume: true,
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

membersCount=webrtc.webrtc.getPeers().length+1;

webrtc.on('readyToCall', function () {
    console.log(" connection established with server --- ");
    console.log(webrtc.webrtc.isAudioEnabled);
    console.log(webrtc.webrtc.isVideoEnabled);
});



  	webrtc.on("joinedRoom",function(){
	    console.log("Joined Room",room);
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
      //console.log("remote video buffered length "+ video.buffered.length);
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

      /*d.appendChild(vol);*/
      remotes.appendChild(d);
      membersCount=webrtc.webrtc.getPeers().length+1;
      console.log("Peer Added || Memebers count "+ membersCount);
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

      console.log(" Peer removed || Memebers count "+ membersCount);

      //send only local video to be show on main canvas 
      resizeCanvas(membersCount,document.getElementById("localVideo"),null);
      //clear the activity on frames . so that when partner joins he has fresh frames 
      //clearFrames();
  }
});




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
		console.log("No of participants: membersCount -> " +membersCount );

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
       // console.log("more than one mebers present add the remote persons video to canvas center");
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
  	console.log("localvideo ", localvideo, " remotevideo", remotevideo, " height ", height , "width ", width);
  	var canvas = document.getElementById('myCanvas');
	  var ctx =canvas.getContext("2d");
	  var v = '';
  	//clearCanvas(ctx,"#000");
  	
    if( localvideo!=null && remotevideo==null){
      console.log(" drawing local video on canvas" );
      clearInterval(i);
      localvideo.addEventListener('play', paintCanvas(localvideo , ctx, width , height));
    }

    else if ( localvideo!=null && remotevideo!=null  && localvideo != remotevideo){
      console.log(" drawing remote video on canvas ");
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
  console.log("clear canvas ");
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
}

function showDiv(name){
  document.getElementById(name).removeAttribute("hidden");
}

function hideDiv(name){
  document.getElementById(name).hidden = true;
}



 	// showtooltip(tooltiproomnotifications , 'Enter session name here .Click on the tango button and share the session link with your partner');
	// showtooltip(tooltiproomnotifications , "bubbletooltip" , 'Enter session name here');

	//setting the media paremeteres
	document.getElementById('videomute').value="unmuted";
	document.getElementById('voicemute').value="unmuted";
	//document.getElementById("remotes").value="muted";


 	function shortenURL(url){
		
		if(gapi.client!=undefined && url!=null){
			console.log("shorten this URL : ", url);
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
			            console.log('Error: ' + resp.error.message);

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
			console.log(" gapi.client is undefined ");
		}
	}

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
				console.log(widgetarray[x].type);
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

		//console.log(membersCount);
	}

   var checkmemCounVar = setInterval(function(){ checkmembersCount() }, 3000);





  /* ------------------------- canvas settings ------------------------------- */
  window.addEventListener('resize', resizeCanvasalready, false);
  var w , h; // height and width of video container 
  var i , j; // interval  for local and remote video



  

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

/*--------------------speed test with tfx server tfx icon -----------*/

//JUST AN EXAMPLE, PLEASE USE YOUR OWN PICTURE!
var imageAddr = "https://tfxserver.above-inc.com/static/tfx1.png"; 
var downloadSize = 1160471; //bytes

function MeasureConnectionSpeed() {

    console.log("testing for speed ");
    var startTime, endTime;
    var download = new Image();

    download.onload = function () {
        endTime = (new Date()).getTime();
        showResults();
    }
    
    download.onerror = function (err, msg) {
        //oProgress.innerHTML = "Invalid image, or error downloading";
        showResultsNonetwork();
        console.log(err, "||" , msg);
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
        console.log(speedMbps + " Mbps<br/>");
    }


    function showResultsNonetwork(){
    	$('#network').attr('class', 'tango-nav-btn network_btn_unavailable');
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