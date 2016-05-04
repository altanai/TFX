// function to call parents get TFX video function from broplufg 
window.parent.TFXlocalVideo("videofilter", "pluginlocalVideo");
window.parent.TFXremoteVideo("videofilter", "pluginremoteVideo");
// // function to handle the incoming video from parent 
// function onTFXVideoResponse(localMediaStream){
//   cosole.log ( " value returned ");

//   // Get a reference to the video element on the page.
// var vid = document.getElementById('camera-stream');

// // Create an object URL for the video stream and use this 
// // to set the video source.
// vid.src = window.URL.createObjectURL(localMediaStream);
// }

$( document ).ready(function() {
    $("#pluginlocalVideo").addClass("sepia");
    $("#pluginremoteVideo").addClass("sepia");
});

// assigns a listener 
$('#CodeStyles').change(function(){
  // when the change event fires, we take the value of the selected element(s)
  var videoFilterStyle = $(this).val();
  var videoSourceMenu = $('#VideoSources').val();
  var videoSource;

  if(videoSourceMenu=="displocalvideo") videoSource="pluginlocalVideo";
  else if (videoSourceMenu=="dispremotevideo") videoSource="pluginremoteVideo";

  console.log("Applying filter ", videoFilterStyle, " for ", videoSource);
  //document.getElementById(videoSource).className= videoFilterStyle;

  var existingclass =document.getElementById(videoSource).className;
  var newclass= videoFilterStyle ; 

  console.log(existingclass +","+ newclass);
  // console.log($("#"+videoSource));
  $("#"+videoSource).removeClass(existingclass);
  $("#"+videoSource).addClass(newclass);

});



// Filter Functions
 $("#SendMessage").click(function(){
     //send to peer 
     var data ={
        "msgcontent":msg
       }
     sendMessage(data);
 });

//function to stop the steaming and quit room  
 $("#Quit").click(function(){

 	console.log("Quit is clisked ");
	window.parent.quitTFXVideoAudio();

 });

// publish the local changes in video filters to main webrtc stream
  $("#publishVideoFilters").click(function(){

    console.log("publish to stream ");
    //$('#localVideo', window.parent.document).addClass("sepia");
    //window.parent.$("#localVideo").addClass("sepia");
    //$("#localVideo", top.document).addClass("sepia");

    //console.log(" classlist of local video in parent frame ",window.parent.document.getElementById("localVideo").className);
    //window.parent.document.getElementById("localVideo").className += ' sepia';
    //window.parent.document.getElementById("localVideo").classList.add( "sepia" );
    window.parent.document.getElementById("localVideo").style.webkitFilter = "sepia";

    var $sample = $('#sample');
    var new_filter = "grayscale(0.6)"; 
    var old_filter = $sample.css("-webkit-filter");
    
    if(old_filter.indexOf(new_filter) == -1){
        $sample.css("-webkit-filter", old_filter + ' ' + new_filter);
    }
    else {
        $sample.css("-webkit-filter", old_filter.replace(new_filter, ''));
    }
    

 });



// window.addEventListener("",onmessage,false);

// // // handles send message
// // function sendMessage(message) {
// //       var widgetdata={
// //       "type":"plugin",
// //       "plugintype":"relaymsg",
// //       "action":"update",
// //       "content":message
// //       };
// //   // postmessage
// //   window.parent.postMessage(widgetdata,'*');
// // }


// //to handle  incoming message
// function onmessage(evt) {

//   console.log(" Response recived for video access regest");
//     //add text to text area for message log from peer
//   if(evt!=null ){

//       // Get a reference to the video element on the page.
//       var vid = document.getElementById('camera-stream');

//       // Create an object URL for the video stream and use this to set the video source.
//       vid.src = window.URL.createObjectURL(evt.ocalMediaStream);
      
//   }

// }

// window.addEventListener("message",onmessage,false);

