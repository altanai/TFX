var broPlugId= chrome.runtime.id;

function prepareFrame(funcname) {

alert(" Frmae tyep "+ funcname);

//else just edit the src
if(document.getElementById("myFrame"))
{
alert("iframe exists->editing src");
funcname();
}

// if ifrmae doesnt exist create one and edit src
else{
alert("iframe doesnt exists-> making one");
ifrm = document.createElement("IFRAME");
ifrm.setAttribute("id", "myFrame");
ifrm.style.height=document.getElementById("remoteArea").style.height; 
ifrm.style.width=document.getElementById("remoteArea").style.width; 
ifrm.setAttribute("allowtransparency","true");

var target = document.getElementById("widgetDiv");
target.appendChild(ifrm);
funcname();

}

}

function CodeWidget(){
	alert(" loading frame with src of widget");
    document.getElementById("myFrame").contentWindow.location = "../../AddCode/src/codewindow.html";
}

function DrawWidget(){
	alert(" loading frame with src of widget");
    document.getElementById("myFrame").contentWindow.location = "../../AddDraw/src/drawwindow.html";
}

//remove ifrmae
function removeFrame(funcname) {

}
