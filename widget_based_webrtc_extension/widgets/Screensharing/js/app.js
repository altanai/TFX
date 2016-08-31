
//console.log(document.getElementById("screensharingContainer").getElementsByClassName("screensharevideoarea")[0].id);
var pending_request_id = null;

var webrtc = new SimpleWebRTC({
localVideoEl:'screesharingvideo',
remoteVideosEl:'screensharingremotes',
autoRequestMedia: true , 
media: {
    audio:false,
    video: { mandatory: { chromeMediaSource: "desktop" }
      }
} 
});

var parentroom = window.parent.TFXgetRoom();
console.log("parents room name " + parentroom );

//share stream on a diff webrtc connection 
webrtc.joinRoom(parentroom+'ss',function(){
/*  pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window"], onAccessApproved);*/
});

webrtc.on('videoAdded', function () {
	//show the remote video on broplug parent 
	//window.parent.document.getElementById("remotes").getElementsByTagName("video")[0].removeAttribute("hidden");
	var children = document.getElementById("screensharingremotes").childNodes.length;

	for(var i=0; i < children; i++){
		var currvideo = document.getElementById("screensharingremotes").getElementsByTagName("video")[i];
		//localscreen lo hidden so that ondex is greater than 0 
		if(currvideo.id.search("screen_incoming")<=0 && currvideo.id.search("calScreen")<=0 )
			{
				/*var att = document.createAttribute("hidden");
				att.value = "true";
				document.getElementById("screensharingremotes").getElementsByTagName("video")[i].setAttributeNode(att);
*/				//hide the sharingremotesvideo
				hideElement(document.getElementById("screensharingremotes").getElementsByTagName("video")[i]);
			}
		else{
    		  //hide the start button 
				hideElement(document.getElementById("start"));
			  // if remote has already send teh screen than cancel the select medai request
    			chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
			}
	}

});

webrtc.on("localScreenAdded",function () {
	var children = document.getElementById("screensharingremotes").childNodes.length;
	console.log("Local csreen added- Number of children", children);

	for(var i=0; i < children; i++){
		var currvideo = document.getElementById("screensharingremotes").getElementsByTagName("video")[i];
		//localscreen lo hidden so that ondex is greater than 0 
		if(currvideo.id.search("screen_incoming")<=0 && currvideo.id.search("calScreen")<=0 )
			{
				/*var att = document.createAttribute("hidden");
				att.value = "true";
				document.getElementById("screensharingremotes").getElementsByTagName("video")[i].setAttributeNode(att);*/
				//hide the sharingremotesvideo
				hideElement(document.getElementById("screensharingremotes").getElementsByTagName("video")[i]);
			}
		if (currvideo.id.search("localScreen")>=0){
				//hide the start button 
				hideElement(document.getElementById("start"));
			}
	}
});

webrtc.on("localScreenStopped",function () {
	console.log(" local screen stopped ");
});

webrtc.on('videoRemoved', function () {
/*	 pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window"], onAccessApproved);*/
		//show the start button again
	showElement(document.getElementById("start"));
});

document.querySelector('#start').addEventListener('click', function(e) {
	pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
	  ["screen", "window"], onAccessApproved);
});

document.querySelector('#cancel').addEventListener('click', function(e) {
  if (pending_request_id != null) {
    chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
  }
});

function hideElement(elem){
	console.log(" Hide ", elem);
	var att = document.createAttribute("hidden");
	att.value = "true";
	elem.setAttributeNode(att);
}
function showElement(elem){
	console.log(" show ", elem);
	elem.removeAttribute("hidden");
}