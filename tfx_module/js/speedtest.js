/*--------------------speed test with tfx server tfx icon -----------*/

var imageAddr = "https://tfxserver.above-inc.com/static/tfx1.png"; 
var downloadSize = 1160471; //bytes

function MeasureConnectionSpeed() {

    console.log("testing for speed ");
    var startTime, endTime;
    var download = new Image();

    download.onload = function () {
        endTime = (new Date()).getTime();
        showResults();
    }
    
    download.onerror = function (err, msg) {
        //oProgress.innerHTML = "Invalid image, or error downloading";
        showResultsNonetwork();
        console.log(err, "||" , msg);
    }
    
    startTime = (new Date()).getTime();
    var cacheBuster = "?nnn=" + startTime;
    download.src = imageAddr + cacheBuster;
    
    function showResults() {
        var duration = (endTime - startTime) / 1000;
        var bitsLoaded = downloadSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var speedMbps = (speedKbps / 1024).toFixed(2);
        
        $('#network').attr('title',speedMbps+" Mbps");

        if(speedMbps < 2){
              $('#network').attr('class', 'tango-nav-btn network_btn_inactive');
              if(!$("#videomute").hasClass("camera_btn_Notworking") && !$("#videomute").hasClass("camera_btn_inactive")){
              		showtooltip(tooltipnetworknotifications,"networktooltip", 'Low signals. Turn off video for better performance');
          	  }
          	  else{
          	  		showtooltip(tooltipnetworknotifications,"networktooltip", 'Low signals.');
          	  }

        }else{	
        	$('#network').attr('class', 'tango-nav-btn network_btn');
        	hidetooltip(tooltipnetworknotifications);
        }
        console.log(speedMbps + " Mbps<br/>");
    }


    function showResultsNonetwork(){
    	$('#network').attr('class', 'tango-nav-btn network_btn_unavailable');
    }
}



/* --------------netwrok speed -------------------------------*/
// speed test every 3 minutes interval
// window.setInterval(MeasureConnectionSpeed, 120000);