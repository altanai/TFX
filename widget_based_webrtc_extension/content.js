var channel = chrome.runtime.connect();

channel.onMessage.addListener(function (message) {
    console.log('channel message-------------------', message);
    window.postMessage(message, '*');
});

window.addEventListener('message', function (event) {
	console.log("Window Event ---------------", event);

    if (event.source != window){
    	console.log( "event source is not window");
        return;
    }
    if (!event.data && (event.data.type == 'getScreen' || event.data.type == 'cancelGetScreen')){
    	console.log(" event data ia false for get screen or cancel get screen");
        return;
    }
    
    channel.postMessage(event.data);
    console.log(" posted to the event channel data");
});
