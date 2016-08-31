//Store the current window ID in Local stoareg variable 

localStorage.setItem("callPageWindowId", chrome.windows.WINDOW_ID_CURRENT);
//alert(" ID of Window : "+ localStorage.getItem("callPageWindowId"));

/*
chrome.windows.getCurrent(function(currentWindow) {
    callPageWindowId = currentWindow.id;
    alert(" ID of Window : "+ callPageWindowId);
    localStorage.setItem("callPageWindowId", callPageWindowId);
}

chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
      alert(tabs[0].url);
   }
);
*/

// At the time of closing the call page . exit the session and clear the local storage varaibel 
//window.onbeforeunload = function (e) {
window.onunload = window.onbeforeunload = function(){
//e = e || window.event;
var trace = printStackTrace();
//alert(" unloading and closing session")
localStorage.setItem("room", '');
webrtc.leaveRoom(); // just as joinRoom() is called on webrtc event line 19 . This is calling leave room onbeforeunload
console.log('---------alt : point 9->terminated the call - TBD ');
}
