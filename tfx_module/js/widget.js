var widgetarray=[];

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
readWidgetsjson();

/*---------------------------load widgets ------------------------------*/

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

