var broPlugId= chrome.runtime.id;

$('#joinRoom').submit(function(){
        room = $('#sessionInputRoomName').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');               
		localStorage.setItem("room", room);  
		chrome.windows.create({url: 'chrome-extension://'+broPlugId+'/src/browser_action/CallPage.html'+'?'+room, type: 'popup' , focused: true, 'width': 900 ,'height': 700, 'left': 600, 'top': 800 });
});

$("#settings" ).click(function() {
    var newURL = 'chrome-extension://'+broPlugId+'/src/options_custom/widgets.html';
    chrome.tabs.create({ url: newURL });
});

$("#mediaelements" ).click(function() {
    var newURL = 'chrome-extension://'+broPlugId+'/src/options_custom/media.html';
    chrome.tabs.create({ url: newURL });
});
