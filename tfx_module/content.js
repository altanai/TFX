var channel = chrome.runtime.connect();

channel.onMessage.addListener(function (message) {
    window.postMessage(message, '*');
});

window.addEventListener('message', function (event) {
	//console.log("Window Event ---------------", event);

    if (event.source != window){
        return;
    }
    if (!event.data && (event.data.type == 'getScreen' || event.data.type == 'cancelGetScreen')){
        return;
    }
    
    channel.postMessage(event.data);
});

/*------------------ page reader for TFX -------------------*/

var flagfound=0;
chrome.runtime.onMessage.addListener(function(req, sender, callback) {  
var address=window.location.href;    

    if(address.indexOf("tangofxsessionsshare.html")>-1)
    {
    	callback(findTangoFXroom());
	}

    if(flagfound==1){
    	window.close();
    }

});


var findTangoFXroom = function() {
    var re =  /tfx:[a-z]*[0-9]*[A-Z]*:/g;
    var node = document.body;
    var m="", mstr="";

    m= re.exec(document.body.innerText);
    if(m!=null){
        mstr=m[0];
        if(mstr!="" && mstr!=undefined){
            room=mstr.substring(4,mstr.length-1);
            console.log(room);
            flagfound=1;
            return room;
        }
    }
}

