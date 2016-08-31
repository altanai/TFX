$(document).ready(function(){

//Add more widget
$("#Plus").click(function() {
    var newURL = 'chrome-extension://'+broPlugId+'/src/options_custom/widgets.html';
    chrome.tabs.create({ url: newURL });
});

// Live Code widget
$("#LiveCode").click(function() {
	//alert(" Load Live code functions ");
prepareFrame(CodeWidget);
});

//draw widget 
$("#Draw").click(function() {
prepareFrame(DrawWidget);
});

//Video conf widget
$("#Interview").click(function() {
alert(" Interview is by default on ");
});

//Message Function 
$("#SendMessage").click(function(){
sendMessage();
});

//Settings window 
$("#Settings").click(function() {
    var newURL = 'chrome-extension://'+broPlugId+'/src/options_custom/widgets.html';
    chrome.tabs.create({ url: newURL });
});

//Media Selection window 
$("#Media").click(function() {
    var newURL = 'chrome-extension://'+broPlugId+'/src/options_custom/media.html';
    chrome.tabs.create({ url: newURL });
});

});
