var vid;
var broPlugId= chrome.runtime.id;

/*------------------------one TFX on one systen ------------------------- */
var tfxflag;
chrome.extension.onMessage.addListener(
  
  function(request, sender, sendResponse) {
    
    if (request.status == "live"){
      //console.log("Message received "+ request.status);
      tfxflag=1;
    }
    else if (request.status == "bye"){
      //console.log("Message received "+ request.status);
      tfxflag=0;
    }
    else
    {
      chrome.pageAction.show(sender.tab.id);
      sendResponse();
    }
});

//event handler for user cloaking on the broplug icon
chrome.browserAction.onClicked.addListener(function (tab) { 
//Fired when User Clicks Broplug Icon
  makenewTFXwindow();
});

/*---------------------------------screensharing -----------------------------------*/

/* background page, responsible for actually choosing media */
chrome.runtime.onConnect.addListener(function (channel) {

   // console.log("runtime onconnect addlistener ");
    channel.onMessage.addListener(function (message) {

        //console.log("channel on message listner message type "+ message.type);
        switch(message.type) {
  
        case 'getScreen':
            //console.log("getscreen in backgroundjs ");
            var pending = chrome.desktopCapture.chooseDesktopMedia(message.options || ['screen', 'window'], 
                                                                   channel.sender.tab, function (streamid) {
                // communicate this string to the app so it can call getUserMedia with it
                message.type = 'gotScreen';
                message.sourceId = streamid;
                channel.postMessage(message);
            });
            
           // console.log(" pending ", pending);
            // let the app know that it can cancel the timeout
            message.type = 'getScreenPending';
            message.request = pending;
            channel.postMessage(message);
            break;

        case 'cancelGetScreen':
            //console.log("Cancelgetscreen in backgroundjs ");
            chrome.desktopCapture.cancelChooseDesktopMedia(message.request);
            message.type = 'canceledGetScreen';
            channel.postMessage(message);
            break;
        }
    });
});

function makenewTFXwindow(){
   //console.log(" txfflag "+ tfxflag);

  ///comment out this is the else header if you want to open multiple tfx windows in one machine browser
   if(tfxflag==1)  return;
  
   else{
        chrome.windows.getAll({}, function(window_list) {  //open only one window at a time\
          var height=screen.height-100;
          var width=screen.width-200;
          var left = (screen.width/2)-(width/2);
          var top = (screen.height/2)-(height/2);

          var panel_props = {
            type: 'panel',
            'width': width,
            'height': height,
            'left': left,
            'top': top,
            url: "chrome-extension://" + broPlugId + "/index.html"   
          }
          
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
}

function makenewTFXroomwindow(roomname){
   console.log(" Is another TangoFX widnow open(txfflag ) : "+ tfxflag);

  ///comment out this is the else header if you want to open multiple tfx windows in one machine browser
   if(tfxflag==1)  
      return;
  
   else{
        chrome.windows.getAll({}, function(window_list) {  //open only one window at a time\
          var height=screen.height-100;
          var width=screen.width-200;
          var left = (screen.width/2)-(width/2);
          var top = (screen.height/2)-(height/2);

          var panel_props = {
            type: 'panel',
            'width': width,
            'height': height,
            'left': left,
            'top': top,
            url: "chrome-extension://" + broPlugId + "/index.html?"+roomname+"#/widgets/"+roomname 
          }
          
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
}
/*-----------------------read from page ----------------------*/

// Global accessor that the popup uses.
var addresses = {};
var selectedAddress = null;
var selectedId = null;

function updateAddress(tabId) {
  //console.log(" update address : ",tabId);
  chrome.tabs.sendMessage(tabId, {}, function(roomname) {
   // addresses[tabId] = address;
    if (!roomname) {
      console.log(" address not found" );
    } 
    else {

      if (selectedId == tabId) {
          updateSelected(tabId);
      }
      //console.log("Roomname : " , roomname);
      makenewTFXroomwindow(roomname);
      
    }
  });
}

function updateSelected(tabId) {
  //console.log(" update selecetd ");
  selectedAddress = addresses[tabId];
  if (selectedAddress)
    chrome.pageAction.setTitle({tabId:tabId, title:selectedAddress});
}

//the tab is updated 
chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
  //console.log("addlistener for updated page ");
  if (change.status == "complete") {
    updateAddress(tabId);
  }
});

//the tab that was selecetd / under focus changed 
chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
  //console.log("selected tab changed ");
  selectedId = tabId;
  updateSelected(tabId);
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
 // console.log(" querry tabs : ",tabs[0]);
  updateAddress(tabs[0].id);
});