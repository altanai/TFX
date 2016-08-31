CodeMirror.modeURL = "../js/codemirror/mode/%N/%N.js";

// populate the top list of codes 
$('#CodeStyles option[value="16"]').prop('selected', true);

// code to initialise the Script and code
var codeArea= document.getElementById("codeArea").value;
var modeVal="text/javascript"; 
var scriptVal="../js/codemirror/mode/javascript/javascript.js";

var editor = CodeMirror.fromTextArea(document.getElementById("codeArea"), {
                 mode: modeVal,
                 styleActiveLine: true,
                 lineNumbers: false,
                 lineWrapping: true
              });

// code to load the selected dscript and change the code according to that


// handles send message
function sendMessage (message) {
      var widgetdata={
      "type":"plugin",
      "plugintype":"code",
      "action":"update",
      "content":message
      };
  // postmessage
  window.parent.postMessage(widgetdata,'*');
}

$('#CodeStyles').change(function(evt) {
   $( "#CodeStyles option:selected").each(function() {
      var info = CodeMirror.findModeByMIME( $( this ).attr('mime')); 
      if (info) {
        mode = info.mode;
        spec = $( this ).attr('mime');
        editor.setOption("mode", spec);
        CodeMirror.autoLoadMode(editor, mode);
        //console.log(info + " "+ mode+ " "+ spec + " "+ editor);
      }
    });

    var data ={
     "codeMode":mode,
     "codeSpec":spec
    }

  sendMessage(data);

   // send info to peer about change in formatting langugage

});

editor.setOption('theme', 'mdn-like');

// to handle evnt for keyup and call send message
editor.on('keyup', function(instance, evt){
  // Left: 37 Up: 38 Right: 39 Down: 40 Esc: 27 SpaceBar: 32 Ctrl: 17 Alt: 18 Shift: 16 Enter: 13
  if(evt.which ==  37 || evt.which ==  38 || evt.which ==  39 || evt.which ==  40  || evt.which==17 || evt.which == 18|| evt.which == 16){
    return true; // handle left up right down  control alt shift
  }

    var data ={
      "codeContent":editor.getValue()
    }

  sendMessage(data);
});


//to handle  incoming message
function onmessage(evt) {

  if(evt.data.codeMode!=null && evt.data.codeSpec!=null){
    // console.log("code msg mime: "+ evt.data.codeMime );
    //higihlight the received mode in drop down box 

        editor.setOption("mode", evt.data.codeSpec);
        CodeMirror.autoLoadMode(editor, evt.data.codeMode);

  }

  else if(evt.data.codeContent!=null){
    console.log("code msg content: "+ evt.data.codeContent );
    var pos = editor.getCursor();
    editor.setValue(evt.data.codeContent);
    editor.setCursor(pos);
  }

}

window.addEventListener("message",onmessage,false);
