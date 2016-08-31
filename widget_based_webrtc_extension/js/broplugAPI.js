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
var TFXjoinRoom , TFXPluginFunction ,TFXstats;;
var TFXgetRoom;

var widgetarray=[];
var currentframe='';
var finalh , finalw ;
var remoteVideoHandler;


/*----------------------detect OS -----------------*/
var OSName="Unknown OS";
if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";

console.log('Your OS: '+OSName);
/*------------------------------------------------*/

//window.onload=windowOnload;
function windowOnload() {

  //load from jspon widget file 
  readWidgetsjson();
  
  //speed test
  window.setTimeout(MeasureConnectionSpeed, 1);
  
  // create our webrtc connection
  webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: '',
    autoRequestMedia: true,
    debug:false,
    detectSpeakingEvents: false,
    autoAdjustMic: false
  });

  console.log(" Signalling server ", webrtc.config.url);
  console.log(" Socketio ", webrtc.config.socketio);
  console.log(" ICE  ", webrtc.webrtc.config.peerConnectionConfig.iceServers);

  webrtc.on('readyToCall', function () {
    console.log(" connection established with server --- ");
    //switchVideo(membersCount);
  });

  //setting the media paremeteres
  document.getElementById('videomute').value="unmuted";
  document.getElementById('voicemute').value="unmuted";
   //document.getElementById("remotes").value="muted";

 //test if mike and camera are connected 
 // testWebRTCLocalVideo( webrtc);
 // testWebRTCLocalAudio( webrtc);

/*  function testWebRTCLocalVideo(obj){
     obj.playVideo();
  }

  function testWebRTCLocalAudio(obj){
     obj.playAudio();
  }*/


   TFXjoinroom=function(){
    room = location.search.substring(1);
    localStorage.setItem("session", "active");

    if (room){
    	console.log(" room to join it ",room);
   	  webrtc.joinRoom(room);
    } 
/*    else{
	   var roomname=location.search;
	    console.log(" Room doesnt exist creating a room ",roomname);
	   webrtc.createRoom(roomname);
    }*/
    membersCount++;
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
    console.log(" Joined Room @#%#Q$^W&*(*^&^$%#@$%^&I*&^%$#%^&");
    $('#notifications').prepend(" Joined the room ");
  });

  webrtc.on("RoomTaken",function(){
    console.log(" Room is already taken by 2 members");
    $('#notifications').text(" Sorry this room is taken , please choose another room name ");
  });
  

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
              console.log("Cretae Msg : Plugin  "+ data.dimensionh + " " + data.dimensionw);
              doplugin(data.plugintype , data.dimensionh , data.dimensionw );
          }
          else if(data.action=='update'){
              console.log("Update Msg : Plugin  " + data.plugintype );
              updateplugin(data.plugintype , data.content);
          }
          else if (data.action=='EqualSize'){
              console.log("EqualSize Msg : Plugin  "+ data.dimensionh + " " + data.dimensionw);
              prepareFrame(data.plugintype, data.dimensionh, data.dimensionw);
          }
  }
  });

  webrtc.on('videoAdded', function (video, peer) {

  var remotes = document.getElementById('remotes');
  if (remotes) {

      var d = document.createElement('div');
      d.className = 'videoContainer';
      d.id = 'container_' + webrtc.getDomId(peer);
      console.log("remote video buffered length "+ video.buffered.length);
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

      membersCount++;
      console.log(" Peer Added || Memebers count "+ membersCount);

      //call was established sucessfully between 2 particiapnats  
      callflag=1;

      //send both video for caanvas to show local on side screen and 
      //remote video on main canvas
      resizeCanvas(membersCount,document.getElementById("localVideo"),video);
  }
  });

  webrtc.on('videoRemoved', function (video, peer) {
  var remotes = document.getElementById('remotes');
  var el = document.getElementById('container_' + webrtc.getDomId(peer));
  if (remotes && el) {
      remotes.removeChild(el);

      membersCount--;
      console.log(" Peer removed || Memebers count "+ membersCount);

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

  //function to return room anme to any widget thats asks for it 
  TFXgetRoom= function getCurrentRoom(){
    return room ;
  }
  //function to replcate the bahaviour from another peer .
  // listen to datachannel for acting on peers behaviour
  TFXPluginFunction=  function doplugin(plugintype , dimensionh , dimensionw){
  syncFrame(plugintype , dimensionh, dimensionw);
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
  window.addEventListener('resize', resizeCanvas, false);

  var canvas =document.getElementById('myCanvas');
  var v='';
  var w , h; // height and width
  var i , j; // interval  for local and remote video

  function resizeCanvas(membersCount,video1,video2) {
  console.log("canvas resized and reset");
    w=canvas.width = window.innerWidth;
    h=canvas.height = window.innerHeight;
    switchVideo(membersCount,video1, video2);
  }

  // switch video from local area to widget area on members participlation 
  function switchVideo(memCount,v1,v2){
  console.log("No of participants:" +membersCount);

  if(memCount<2){
    //only one participant in session , show his video on canvas
    // show waiting for other parties to join above his video stream
    if(v1!=null && v2==null){
        console.log("draw canvas for single memeber "+ memCount);
        drawStuff(v1,v2,h,w);
        hideDiv("localVideo");
    }

    if (callflag==0){
        // first time joiing a meeting session 
        $('#notifications').text('Waiting for another person to join');
        //play the waiting music 
       // playWaitingMusic();

      }
      else if(callflag==1){
      //a peer has left the metting 
      $('#notifications').text('your partner has left the conversation ');
     }
  }

  else{
       // more than one mebers present add the remote persons video to canvas center
       //stop the waiting music 
       // stopWaitingMusic();

        if(v1!=null && v2!=null && v1!=v2){
            console.log(" draw canvas for many members " + memCount);
            drawStuff(v1,v2,h,w);
            showDiv("localVideo");
        }

        $('#notifications').text('');
        
  } 

  }

  function drawStuff(localvideo,remotevideo,height,width) {

  var ctx = canvas.getContext('2d');
  //clear(ctx,"black");

    if( localvideo!=null && remotevideo==null){
      console.log(" drawing local video on canvas ");
      localvideo.addEventListener('play', paintCanvas(localvideo , ctx, width , height));
      // if(video.paused || video.ended ) return false;
    }

    else if ( localvideo!=null && remotevideo!=null  && localvideo != remotevideo){
      console.log(" drawing remote video on canvas ");
      clearInterval(i);
      // localvideo.removeEventListener('play',paintCanvas(localvideo , ctx, width , height));
      remotevideo.addEventListener('play', paintCanvas(remotevideo , ctx, width , height));
    }
    //Hide Flash screen
    setTimeout(function(){
      $("#flash_screen").fadeOut(500);
    },2*1000)
  }

  function paintCanvas(v,c,w,h) {
    i=window.setInterval(function() {
               c.drawImage(v,0,0,w,h)
               },20);
  }

  function clearCanvas(context, color){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  function showDiv(name){
  document.getElementById(name).removeAttribute("hidden");
  }

  function hideDiv(name){
  document.getElementById(name).hidden = true;
  }

  /*---------- broplug API methods to let wwidgets access the video and audio -----------*/

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

  function readWidgetsjson(){
    $.getJSON('../../widgetsmanisfest.json')
    .done(function (data) {
       widgetarray = data;
       console.log(" widgestarray "+ widgetarray.length);

      for (x in widgetarray){
      //console.log(" adding widgets to panel : "+ widgetarray[x].id, '----->'+x+ widgetarray[x].url);
      appendWidgetLeftPanel( widgetarray[x].id, widgetarray[x].title, 
                widgetarray[x].icon,  widgetarray[x].type);
      }
    });
  }

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
  }

  function widgetbutton(type){
    var widget={
    "type":"plugin",
    "plugintype":type,
    "dimensionh": $(window).height(),
    "dimensionw": $(window).width(),
    "action":"create"
    };
    console.log("Code Plugin Sender "+ widget.dimensionh + " " + widget.dimensionw);
    sendWidgetMessage(widget);
  }

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
    $(this).toggleClass("audio_btn_inactive");
    voicemuteunmute();
  });

  $("#videomute" ).click(function() {
    console.log("video off ");
    $(this).toggleClass("camera_btn_inactive");
    videomuteunmute();
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
  //add text to text area for message log
    $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() + '\n'+ 'you : '+ msg);
  }


  function voicemuteunmute() {
    //var statusvoice = document.getElementById('voicemute').value;
    if(document.getElementById('voicemute').value == "unmuted"){
        document.getElementById('voicemute').value="muted";
        TFXvoiceoff();
        
    }
    else  {
        document.getElementById('voicemute').value="unmuted";
        TFXvoiceon();   
        
    }
  }

  function videomuteunmute() {
    //status = document.getElementById('videomute').value;
    if(document.getElementById('videomute').value=="unmuted"){
        document.getElementById('videomute').value="muted";
        TFXvideooff();    
    }
    else {
       document.getElementById('videomute').value="unmuted";
        TFXvideoon();     
    }
  }

  function remotemuteunmute() {
    //status = document.getElementById('remotewindow').value;
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

  function prepareWidgetDiv(){
  //$('#widget_loader').height($(window).height());
  //$('#widget_loader').width($(window).width());
  }

  // prepare the widget iframe for self side 
  function prepareFrame(plugintype, finalh , finalw) {
      console.log("Self Widget change "+plugintype);
      prepareWidgetDiv();
      //frame exists just edit the src
      if (document.getElementById(plugintype)!=null){
            if(plugintype==currentframe){
              // just hide the current( clicked ) frame
              currentframe='';
              hideframe(plugintype);
            }
            else{
              // switch between parallel frames
              showcurrentwidget(plugintype);
            }
      }

      //first time creating frame . ifrmae doesnt exist create one and edit src
      else {
          createframe(plugintype, finalh, finalw);
          //add it to widgets div
          var target = document.getElementById("widget_loader");
          target.appendChild(ifrm);

          showcurrentwidget(plugintype);
      }
  }


  //function to sync the frame activity with peer 
  // dimensionh and dimensionw are the window sizes of peer 
  // check to see if they fit within our scrren 
  function syncFrame(plugintype, dimensionh, dimensionw){
      console.log("Widget changed " + plugintype);
      prepareWidgetDiv();

      //frame exists just edit the src
      if (document.getElementById(plugintype)!=null){
          console.log(" Switch between widgets in self and send Equal size to sender ");
          // switch between parallel frames
          showcurrentwidget(plugintype);
          //send details to peer to craete frmae with specified final size too 
          var widget={
              "type":"plugin",
              "plugintype": plugintype,
              "dimensionh": finalh,
              "dimensionw": finalw,
              "action":"EqualSize"
              };
          sendWidgetMessage(widget);
      }

      //first time creating frame . ifrmae doesnt exist create one and edit src
      else {
        var peerFrameh= dimensionh;
        var peerFramew= dimensionw;
        var selfFrameh= $(window).height();
        var selfFramew= $(window).width();
        // console.log("Computig plugin sizes ");
        // console.log( "Self height Size "+ selfFrameh + "  || Peer height Zize "+ peerFrameh);
        // console.log( "Self Width size "+ selfFramew + "  || Peer nWidth soze "+ peerFramew);
        finalh = dimensionh < selfFrameh ? dimensionh : selfFrameh;
        finalw = dimensionw < selfFramew ? dimensionw : selfFramew;
        // console.log( " Final selected h "+ finalh+ " final selecetd width "+ finalw);

        createframe(plugintype , finalh , finalw);

        //send details to peer to craete frmae with specified final size too 
        var widget={
            "type":"plugin",
            "plugintype": plugintype,
            "dimensionh": $(window).height(),
            "dimensionw": $(window).width(),
            "action":"EqualSize"
            };
        sendWidgetMessage(widget);

        //add  our frame with final sizes to widgets div
        var target = document.getElementById("widget_loader");
        target.appendChild(ifrm);

        showcurrentwidget(plugintype);
      }
  }

  //create a iframe for holding the pluginn 
  //size of iframe is determined by prepareframe ans sync frame functions 
  function createframe(plugin, pluginh, pluginw){

    console.log(" creating the frame "+ plugin);

    ifrm = document.createElement("IFRAME");
    ifrm.setAttribute("id", plugin);
    ifrm.setAttribute("frameborder",0);

    //set url for iframe location
    var i;
    for(i = 0; i < widgetarray.length; i++) {
        
      if(widgetarray[i].plugintype==plugin){

         console.log(" widgetarray[i].plugintype : "+ widgetarray[i].plugintype+ " || url :" + widgetarray[i].url);
  	
  	     ifrm.className = "widget_"+i;
          //check if resize if required or not 
          if(widgetarray[i].resize=="yes"){
              console.log("widegt size eqialise yes");
              //ifrm.style.height=pluginh+"px";
             // ifrm.style.width=pluginw+"px";
          }
          else if (widgetarray[i].resize=="no"){
            console.log("widegt size eqialise no");
            //  ifrm.style.height= document.getElementById("widget_loader").style.height;
             // ifrm.style.width=document.getElementById("widget_loader").style.width;
          }

          // here i need to check if the ifrma src exists or not 
          // if not display a small message that widget is unsvaiable instead of blank page
          //var url = widgetarray[i].url;
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
      
    }
  }

  function showcurrentwidget(plugin){
  //iframes exists just call the approproate iframe for the widget
  frames = document.getElementsByTagName("IFRAME");
  for (var i = 0; i < frames.length; i++) {
    if(frames[i].id==plugin){
      //frame for this plugin alfreday exists . just load it and block it to make visible
      currentframe=frames[i].id;
      showframe(frames[i].id);
    }
    else{
      // hide othe iframes
      hideframe(frames[i].id);
    }
  }
   //Widget close button
  // $("#widget_close_btn").show()
  }


  function showframe(framename){
  document.getElementById(framename).removeAttribute("hidden");
  }

  function hideframe(framename){
  document.getElementById(framename).hidden = true;

  //Widget close button
  // $("#widget_close_btn").hide()
  }


  /*--------------------- tool tip -----------------------*/
 // $( document ).tooltip();

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


  /*------------------ make local video draggable and movable -----------------
  $('#localVideoContainer').draggable();
  $('#localVideoContainer').resizable({
      aspectRatio: true,
      handles: 'ne, se, sw, nw'
  });*/

//}); // document on ready finishes 
} // window on load finisnhes 
//-------------------------------------------------------------------------


//overwriting the getWebRTCstarts function with more detailed logic
var globalObject = {
    audio: {},
    video: {}
};

function getWebrtcStats(peer) {
    console.log(" --------------------statistics ---------------");
    
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
//  alert( name);
  document.getElementById(name).contentWindow.postMessage(content,'*');
}

/*--------------------- help and seetings ------------------------------*/
/*jQuery.fn.center = function(parent) {
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

$("div.target:nth-child(1)").center(true).hide();
$("div.target:nth-child(2)").center(true).hide();*/

//--------------------------------------------------------

function onWebRTCError(type,err){
  
  console.log( " test fail "+JSON.stringify(err));

  if(type=="audio"){
   // $('#notifications').prepend('<img src="../../icons/audio_Notworking.png"/>');
   // $('#notifications').prepend("Audio Fail " + err.name +" Goto Settings ");
  }
    
  else if ( type=="video"){
   // $('#notifications').prepend('<img src="../../icons/video_Notworking.png"/>');
    //$('#notifications').prepend("Video Fail ." + err.name +" Goto Settings ");
  }
  else{
    $('#notifications').prepend("Media Fail - " + "<a href='' id='settings'>err.name </a>");
    //Settings window
    $("#settings").click(function() {
        console.log(" Settings ");
        var newURL = 'https://tfxserver.above-inc.com/static/TFXSettings/src/audiovideoaccesserror.html';
        chrome.tabs.create({ url: newURL });
    });
  }
/*
  $("#jointfx").hide();
  $('#notifications').append($('#settings'));*/
}


function onWebRTCSucess(type,stream){
  console.log( " test okay for "+ type);
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

/*window.onload = function() {
    window.setTimeout(MeasureConnectionSpeed, 1);
};*/

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

        if(speedMbps < 2){
          $('#notifications').prepend("slow connection");
        }
        console.log(speedMbps + " Mbps<br />");
        //$('#notifications').prepend(speedMbps + " Mbps<br />");
/*        oProgress.innerHTML = "Your connection speed is: <br />" + 
           speedBps + " bps<br />"   + 
           speedKbps + " kbps<br />" + 
           speedMbps + " Mbps<br />";*/
    }
}