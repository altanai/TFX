//As the main menu window coses close all the open pops 
window.onunload = window.onbeforeunload = function(){
Chrome.windows.remove(localStorage.getItem("callPageWindowId"), function(){});
}