
var broPlugId= chrome.runtime.id;
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.pageAction.show(sender.tab.id);
    sendResponse();
});

//event ahndler for user cloaking on the broplug icon
chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks Broplug Icon
  var vid;
  chrome.windows.getAll({}, function(window_list) {  //open only one window at a time\
    var panel_props = {
      type: 'panel',
      url: "chrome-extension://" + broPlugId + "/src/browser_action/MenuPage.html"   
    }

    for (chromeWindow in window_list) {
        if( chromeWindow!=0 && chromeWindow.id == vid) {
            chrome.windows.update(vid, {focused: true});
            return;
        }
    }

    chrome.windows.create(panel_props ,function (newWindow) { 
        vid = newWindow.id;
    });
  });
});


//event handler to show help configuration page after user adds broplug / installs for the first time 
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.tabs.create({url: "chrome-extension://" + broPlugId + "/src/options_custom/widgets.html"}, function (tab) {
	alert("Thank you for installaing Broplug . Please configure the settings in the window that opens up ");  
  
  });
});
