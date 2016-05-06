 	function shortenURL(url){
		
		if(gapi.client!=undefined && url!=null){
			console.log("shorten this URL : ", url);
			//var apiKey = 'AIzaSyCs5YkMagLL83csX_6eABwEvsE3Oj_kMmo';
			var apiKey='AIzaSyAnPxrh7veHDrDaPjoTRJJV7GoqIoIYgOw';
			gapi.client.setApiKey(apiKey);
			//var longurl = 'https://tfxserver.above-inc.com/static/tangofxsessionsshare.html?broplugid=afbomhocbhkipjmmlpbjceldmpceicgl&roomname=fvbdzf';
			var longurl= url;
			var request , response;

			gapi.client.load('urlshortener', 'v1', function() {
			    
			    request = gapi.client.urlshortener.url.insert({
			        'resource': {
			            'longUrl': longurl
			        }
			    });
			    
			    response = request.execute(function(resp) {
			        if (resp.error) {
			            console.log('Error: ' + resp.error.message);

			            //incase of error return the same url as inputed 
                        localStorage.setItem('shorturl', url);
			            showtooltip(tooltiproomnotifications,"bubbletooltip",url);

			        } else {
			        	//sucessful obatining the short url from googl url shortner API
                        localStorage.setItem('shorturl', resp.id);
			           	showtooltip(tooltiproomnotifications,"bubbletooltip",resp.id);
			           // $("#show").html("Short URL for "+longurl+" is: " + resp.id);
			        }
			    });
			});
		}
		else{
			console.log(" gapi.client is undefined ");
		}
	}