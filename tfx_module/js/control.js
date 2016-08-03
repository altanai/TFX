 /*---------------------video audio control  buttons -------------------------*/

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

	$("#logoff").click(function(){
		logoffHandler()
	});

  $("#voicemute" ).click(function() {
    httpconsole.log(" Voice Mute ");
    if(!$("#voicemute").hasClass("audio_btn_Notworking")){
	    $(this).toggleClass("audio_btn_inactive");
	    voicemuteunmute();
    }

  });

  $("#videomute" ).click(function() {
    httpconsole.log("video off ");
    if(!$("#videomute").hasClass("camera_btn_Notworking")){
    	$(this).toggleClass("camera_btn_inactive");
    	videomuteunmute();
    }

  });

  $("#remotewindow" ).click(function() {
    httpconsole.log("remote window ");
    $(this).toggleClass("btn-style-active");
    remotemuteunmute();
  });



/* -------------------------------manuals ----------------------------------*/
$("#manual_dialog").dialog({
    autoOpen: false,
    modal: true,
    dialogClass: 'manualdialogclass',
    buttons: {
            Cancel: function() {
                    $( this ).dialog( "close" );
            }
    },
    close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
    },
    open: function(ev, ui){
            $("#manual_dialog").html('<iframe src="https://docs.google.com/a/above-inc.com/document/d/1YVeR8k3vMwamkgSwuQupIvW0EEAtfcaXkcn_RM2pEbI/pub?embedded=true"></iframe>');             
    }
});


$("#manuals").click(function() {
    //var  manual_link = 'https://docs.google.com/a/above-inc.com/document/d/1YVeR8k3vMwamkgSwuQupIvW0EEAtfcaXkcn_RM2pEbI/pub';
    /*chrome.tabs.create({ url: newURL });*/
    $('#manual_dialog').dialog('open');
});

  /*------------canvas -------------------*/
window.addEventListener('resize', function(){
  resizeTFX(null,null)
}, false);

var w , h; // height and width of video container 
var i , j; // interval  for local and remote video


function drawStuff(localvideo,remotevideo,height,width) {
    
    var canvas = document.getElementById('myCanvas');
    var ctx =canvas.getContext("2d");
    var v = '';
    //clearCanvas(ctx,"#000");
    
    if( localvideo!=null && remotevideo==null){
      clearInterval(i);
      localvideo.addEventListener('play', paintCanvas(localvideo , ctx, width , height));
    }

    else if ( localvideo!=null && remotevideo!=null  && localvideo != remotevideo){
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


// switch video from local area to widget area on members participlation 
function switchVideo(video1, video2 , h , w){

  if(!video1)
    video1=document.getElementById("localVideo");

  if(video2==undefined){
    if(document.getElementById("remotes").getElementsByTagName("video")[0]!=undefined)
      video2=document.getElementById("remotes").getElementsByTagName("video")[0];
    else
      video2=null;
  }

  if(webrtc.webrtc.getPeers().length==0){
      hideDiv("localVideo");
      $("#media_settings_btn").removeClass("hidedisplay");
      
      if (callflag==0){
         showDiv("notificationsDiv");
      }
      else if(callflag==1){
        showDiv("notificationsDiv"); 
        $('#notifications').text('Your partner has left');
      }
  }else if(webrtc.webrtc.getPeers().length>0){
       console.log("remote members to canvas center");
       // stop the waiting music 
       // stopWaitingMusic();
        if(video1 && video2 && video1!=video2){          
            showDiv("localVideo");
        }
        $('#notifications').text('');
        hideDiv("notificationsDiv");
        $("#media_settings_btn").addClass("hidedisplay");
        hidetooltip(tooltiproomnotifications);
  } 
  
  drawStuff(video1,video2,h,w);
}


//canvas resized and reset
function resizeTFX(video1,video2) {

  var canvas = document.getElementById('myCanvas');
  h=window.innerHeight;
  w=window.innerWidth;
  canvas.height=h;
  canvas.width=w;

  switchVideo(video1, video2 , h , w);
}