var vid;
var broPlugId= chrome.runtime.id;

/*------------------------one TFX on one systen ------------------------- */
var tfxflag;
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.status == "live"){
      console.log("Message received "+ request.status);
      tfxflag=1;
    }
    else if (request.status == "bye"){
      console.log("Message received "+ request.status);
      tfxflag=0;
    }
    else
    {
      chrome.pageAction.show(sender.tab.id);
      sendResponse();
    }
});

//event handler for user cloaking on the broplug icon
chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks Broplug Icon
  
  console.log(" txfflag "+ tfxflag);

  ///comment out this is the else header if you want to open multiple tfx windows in one machine browser

   if(tfxflag==1)  return;
  
   else{
        chrome.windows.getAll({}, function(window_list) {  //open only one window at a time\
          var height=screen.height-100;
          var width=screen.width-200;
          var left = (screen.width/2)-(width/2);
          var top = (screen.height/2)-(height/2);

/*          var panel_props = {
            type: 'panel',
            height:300,
            width:300,
            left:screen.availWidth,
            top:screen.availHeight,
            url: "chrome-extension://" + broPlugId + "/src/browser_action/MenuPage.html"   
          }*/

          var panel_props = {
            type: 'panel',
            'width': width,
            'height': height,
            'left': left,
            'top': top,
            url: "chrome-extension://" + broPlugId + "/index.html"   
          }

      //alert(JSON.stringify(window_list)+ "vid " + vid);

          for (chromeWindow in window_list) {
              if( window_list[chromeWindow].id == vid) {
                  chrome.windows.update(vid, {focused: true});
                  return;
              }
          }

          chrome.windows.create(panel_props ,function (newWindow) { 
              vid = newWindow.id;
          });
        });
     }
});

/*---------------------------------screensharing -----------------------------------*/
/* background page, responsible for actually choosing media */
chrome.runtime.onConnect.addListener(function (channel) {

    console.log("runtime onconnect addlistener ");
    channel.onMessage.addListener(function (message) {

        console.log("channel on message listner message type "+ message.type);
        switch(message.type) {
  
        case 'getScreen':
            console.log("getscreen in backgroundjs ");
            var pending = chrome.desktopCapture.chooseDesktopMedia(message.options || ['screen', 'window'], 
                                                                   channel.sender.tab, function (streamid) {
                // communicate this string to the app so it can call getUserMedia with it
                message.type = 'gotScreen';
                message.sourceId = streamid;
                channel.postMessage(message);
            });
            
            console.log(" pending ", pending);
            // let the app know that it can cancel the timeout
            message.type = 'getScreenPending';
            message.request = pending;
            channel.postMessage(message);
            break;

        case 'cancelGetScreen':
            console.log("Cancelgetscreen in backgroundjs ");
            chrome.desktopCapture.cancelChooseDesktopMedia(message.request);
            message.type = 'canceledGetScreen';
            channel.postMessage(message);
            break;
        }
    });
});

