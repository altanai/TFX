/*------------------- picked form google web speech api demo ----------------*/
var DEBUG=false;

var langs =
[['Afrikaans',       ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu',   ['ms-MY']],
 ['Català',          ['ca-ES']],
 ['Čeština',         ['cs-CZ']],
 ['Deutsch',         ['de-DE']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Español',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Euskara',         ['eu-ES']],
 ['Français',        ['fr-FR']],
 ['Galego',          ['gl-ES']],
 ['Hrvatski',        ['hr_HR']],
 ['IsiZulu',         ['zu-ZA']],
 ['Íslenska',        ['is-IS']],
 ['Italiano',        ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Magyar',          ['hu-HU']],
 ['Nederlands',      ['nl-NL']],
 ['Norsk bokmål',    ['nb-NO']],
 ['Polski',          ['pl-PL']],
 ['Português',       ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Română',          ['ro-RO']],
 ['Slovenčina',      ['sk-SK']],
 ['Suomi',           ['fi-FI']],
 ['Svenska',         ['sv-SE']],
 ['Türkçe',          ['tr-TR']],
 ['български',       ['bg-BG']],
 ['Pусский',         ['ru-RU']],
 ['Српски',          ['sr-RS']],
 ['한국어',            ['ko-KR']],
 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                     ['cmn-Hans-HK', '普通话 (香港)'],
                     ['cmn-Hant-TW', '中文 (台灣)'],
                     ['yue-Hant-HK', '粵語 (香港)']],
 ['日本語',           ['ja-JP']],
 ['ภาษาไทย',         ['th-TH']],
 ['Lingua latīna',   ['la']]];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}
//default 6 and 6 of united states english change to top . 
//require change for the peerlang to be not undfeined 

//select_language.selectedIndex = 6;
select_language.selectedIndex = 1;
updateCountry();
//select_dialect.selectedIndex = 6;
select_dialect.selectedIndex = 1;

window.onload=function(){
  DEBUG && console.log("Setting default language to english" );
    sendlanguage("en");
};

function updateCountry() {

  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  
  var list = langs[select_language.selectedIndex];
  
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  
  select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var mylang=splitCountryLang(select_dialect.value);
var peerlang;

function splitCountryLang(CountryLang) {
    var res = CountryLang.split("-");
    return res[0];
}

//Message Function
$("#select_language").change(function(){
    DEBUG && console.log("update lang");
    updateCountry();
    mylang=splitCountryLang(select_dialect.value);
    sendlanguage(mylang);
});
/*--------------------- just as it is , for cases when languge is same -----------*/
function sameText(response) {
  DEBUG && console.log(response);
   addMessageLangLog('Other', response);

  //add the checkbox detction to find if user wantd the msg to be converted from text to speech or not 
  if(text2speechflag==true)
  texttospeech(response); 
 
  //$('#MessageLangHistoryBox').text( $('#MessageLangHistoryBox').text() +'\n'+ 'other : '+ response.data.translations[0].translatedText );
}

/*---------------------translator using key -----------------------*/

function translateText(response) {
  DEBUG && console.log(response);
  if(response.data.translations[0].translatedText!="undfeined")
      addMessageLangLog('Other', response.data.translations[0].translatedText);
  else
      DEBUG && console.log(" undefined response from translator API");

  //add the checkbox detction to find if user wantd the msg to be converted from text to speech or not 
  if(text2speechflag==true)
  texttospeech(response.data.translations[0].translatedText); 
  
  //$('#MessageLangHistoryBox').text( $('#MessageLangHistoryBox').text() +'\n'+ 'other : '+ response.data.translations[0].translatedText );
}

function translator(textinput , mylang, peerlang){
      DEBUG && console.log("translating form "+peerlang + " to "+ mylang);
      if(mylang==peerlang){
          sameText(textinput);
      }
      else{
          var newScript = document.createElement('script');
          newScript.type = 'text/javascript';
          var sourceText = escape(textinput);
          // var sourceText = escape(document.getElementById("sourceText").innerHTML);
          // WARNING: be aware that YOUR-API-KEY inside html is viewable by all your users.
          // Restrict your key to designated domains or use a proxy to hide your key
          // to avoid misuage by other party.
          //var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyAnPxrh7veHDrDaPjoTRJJV7GoqIoIYgOw&source=en&target=ja&callback=translateText&q=' + sourceText;
          var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyAnPxrh7veHDrDaPjoTRJJV7GoqIoIYgOw&source='+peerlang+'&target='+mylang+'&callback=translateText&q=' + sourceText;
          newScript.src = source;

          // When we add this script to the head, the request is sent off.
          document.getElementsByTagName('head')[0].appendChild(newScript);
      }

}

/*--------------------- switching from speech 2 text and text 2 speech -------------------*/

var text2speechflag=false;

$('#text2speechCheckbox').change(function() {
   if($(this).is(":checked")) {
      //'checked' event code
      DEBUG && console.log("Check box event : read out the messages ");
      text2speechflag=true;
      return;
   }
  DEBUG && console.log(" dont read out the messages ");
  text2speechflag=false;
   //'unchecked' event code
});

          
/*---------------------text to speech ----------------------*/

//text to speech function 
function texttospeech(textinput){

    DEBUG && console.log(" Text to speech of ",textinput);
    // make it audible using text to speech  API - SpeechSynthesis
    var msg = new SpeechSynthesisUtterance(textinput);
    //msg.lang = 'en-US';
    msg.lang  = select_dialect.value;
    window.speechSynthesis.speak(msg);
}

/*--------------------Speech to text -----------------------*/
var final_transcript = '';
var recognizing = false;

var previous=null;
var now=null;

if ('webkitSpeechRecognition' in window) {
 
  var recognition = new webkitSpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };
 
  recognition.onerror = function(event) {
    DEBUG && console.log(event.error);
  };
 
  recognition.onend = function() {
    recognizing = false;
  };
 
  recognition.onresult = function(event) {

    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    
    DEBUG && console.log(" Speech to text of ",final_span.innerHTML);
    $("#MessageBox").val(interim_span.innerHTML);

    // do not require user to  click send button . send the text to peer  
    var mytext=final_span.innerHTML;
    
    //start detection for empty and repeated sentences
    if(mytext!='' && mytext!=null){

      // duplicate detection , prevents unnessary repested speech output    
      now=mytext;

      if(previous==null){
        DEBUG && console.log(" Previous assignmed now value for the first time ");
        sendmessagedictatedtext(mytext);
        final_transcript = '';
        final_span.innerHTML = '';
        interim_span.innerHTML = '';
        previous = mytext;        
      }
      else{
        if(previous!=now){
          DEBUG && console.log(" Previous : ", previous , " does not matches now ", now );
          sendmessagedictatedtext(mytext);
          final_transcript = '';
          final_span.innerHTML = '';
          interim_span.innerHTML = '';
          previous=now;
        }
        else{
          DEBUG && console.log(" Previous : ", previous , " Matches now ", now );
          final_transcript = '';
          final_span.innerHTML = '';
          interim_span.innerHTML = '';
        }
      }
    }
    //end detection for empty and repeated sentences 
    
  };
}
 
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
 
function capitalize(s) {
  return s.replace(s.substr(0,1), function(m) { return m.toUpperCase(); });
}
 
function startDictation(event) {
  
  //$("#start_button").text('Recognizing');
  //instead of changing  status color change
  document.getElementById("playhal").className="micon";

  if (recognizing) {
    recognition.stop();
    //$("#start_button").text('Stoped recognizing');
    //instead of changing status change color 
    document.getElementById("playhal").className="micoff";
    return;
  }

  final_transcript = '';
  recognition.lang = select_dialect.value;
  //recognition.lang = 'en-US';
  DEBUG && console.log(" Recognisation parameters "+ recognition.lang);

  recognition.start();
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
}

/*$("#start_button").click(function(){
    DEBUG && console.log(" start dictataion ");
    showDiv("speech2textdiv");
    startDictation(event);
});*/

//send message when mouse is on mesage dicv ans enter is hit
$("#MessageBox").keyup(function(event){
    if(event.keyCode == 13){
        var msg=$('#MessageBox').val();
        sendmsgtext(msg)  
    }
});

//send message when send icon png is hit 
document.getElementById("send_button_icon").addEventListener("click", function(){
        var msg=$('#MessageBox').val();
        sendmsgtext(msg)  
});


function sendmsgtext(mytext){
    mytext=mytext.trim();

    if(mytext!='' && mytext!=null){
      // add to message log
      addMessageLog("You",mytext);
      //send to peer 
      var data ={
         "msgcontent":mytext
        }
      sendMessage(data);
    }
    
    // clear out the residue after sending
    $('#MessageBox').val('');
}

//send message aldo convert text to speech 
$("#send_button").click(function(){
  var mytext =$('#results').text();
  DEBUG && console.log( mytext);
  sendmessagedictatedtext(mytext);
});

function sendmessagedictatedtext(mytext){
  //add to message log
  addMessageLog("You",mytext);

  //send to peer 
  var data ={
     "msgcontent":mytext
    }
  sendMessage(data);
  cleartextbox();
}

/*--------------------- show infor on screen -------------------------*/
function cleartextbox(){
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
}

function addMessageLog(who, msg){
    if(who=="Other"){
    
        if(msg.length >37){
          var heightlines=Math.round(msg.length/37)*30 +6;
          var textArea = '<textarea disabled class="messageHistoryOther"  style="overflow: hidden;  border: none ; height:'+ heightlines+'px;">'+msg+'</textarea>';

        }
        else{
          var textArea = '<textarea disabled class="messageHistoryOther"  style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        }

        //var textArea = '<textarea disabled class="messageHistoryOther"  style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        $('#text2speechdiv').append('<div class="message-other">'+textArea+'</div>');
    }
    else if(who=="You"){
        if(msg.length >37){
          var heightlines=Math.round(msg.length/37)*30 +6 ;
          var textArea = '<textarea disabled class="messageHistorySelf"  style="overflow: hidden;  border: none ; height:'+ heightlines+'px;">'+msg+'</textarea>';

        }
        else{
          var textArea = '<textarea disabled class="messageHistorySelf"  style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        }        
        //var textArea = '<textarea disabled class="messageHistorySelf"  style="overflow: hidden;  border: none">'+msg+'</textarea>';
        $('#text2speechdiv').append('<div class="message-self">'+textArea+'</div>');
    }
    
   $("#text2speechdiv").scrollTop($("#text2speechdiv")[0].scrollHeight);
    //$('#MessageHistoryBox').text(msg);
}

function addMessageLangLog(who, msg){
    if(who=="Other"){

        if(msg.length >37){

          var heightlines=Math.round(msg.length/37)*30 +6;
          var textArea = '<textarea disabled class="messageHistoryOther"  style="overflow: hidden;  border: none ; height:'+ heightlines+'px;">'+msg+'</textarea>';

        }
        else{
          var textArea = '<textarea disabled class="messageHistoryOther"  style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        }

        // var textArea = '<textarea disabled class="messageHistoryOther" rows="2" cols="90" style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        $('#text2speechdiv').append('<div class="message-other">'+textArea+'</div>');
    }
    else if(who=="You"){
        if(msg.length >37){
          var heightlines=Math.round(msg.length/37)*30 +6;
          var textArea = '<textarea disabled class="messageHistorySelf"  style="overflow: hidden;  border: none ; height:'+ heightlines+'px;">'+msg+'</textarea>';

        }
        else{
          var textArea = '<textarea disabled class="messageHistorySelf"  style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        }
      // this situtation ever arrives in current scenario as self will not add translated lang log
      //  var textArea = '<textarea disabled class="messageHistorySelf" rows="2" cols="90" style="overflow: hidden;  border: none">'+msg+'</textarea>'; 
        $('#text2speechdiv').append('<div class="message-self">'+textArea+'</div>');
    }

    $("#text2speechdiv").scrollTop($("#text2speechdiv")[0].scrollHeight);
}

/*----------------------- send and recive the data ----------------------*/
//send my language to peer 
function sendlanguage(mylang){
    DEBUG && console.log("sharing language "+ mylang+ " to peer");
    //send to peer 
    var data ={
       "lang":mylang
      }
    sendMessage(data);
}


// function addMessageLog(msg){
//     //add text to text area for message log for self 
//     $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() + '\n'+ 'you : '+ msg);
// }

// handles send message
function sendMessage(message) {
      var widgetdata={
      "type":"plugin",
      "plugintype":"speechtexttranslator",
      "action":"update",
      "content":message
      };
  // postmessage
  window.parent.postMessage(widgetdata,'*');

 //cleartextbox();
}

//to handle  incoming message
function onmessage(evt) {
    //add text to text area for message log from peer
  if(evt.data.msgcontent!=null ){
      DEBUG && console.log(evt.data.msgcontent);
      //append the result in messagelanghistory box
      if(mylang!='' && peerlang!=''){
        DEBUG && console.log(" langugae peer->",peerlang, " self ->", mylang);
        translator(evt.data.msgcontent,mylang,peerlang); 
      }
      else{
        DEBUG && console.log(" langugae is not set ");
        translator(evt.data.msgcontent,'en','en'); 
      }
      
  }else if(evt.data.lang!=null ){
     // set the peer langugae parameter
     peerlang=evt.data.lang;
     DEBUG && console.log(" language received from peer "+ peerlang);
  }
}

window.addEventListener("message",onmessage,false);

/*----------------------------hal animation functions -----------------------*/
var halbuttonstatus="stopped";

window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame ||
                               window.oRequestAnimationFrame ||
                               window.msRequestAnimationFrame;

window.cancelAnimationFrame = window.cancelAnimationFrame ||
                              window.webkitCancelAnimationFrame ||
                              window.mozCancelAnimationFrame ||
                              window.msCancelAnimationFrame ||
                              window.oCancelAnimationFrame

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                         navigator.msGetUserMedia || navigator.mozGetUserMedia 

window.util = window.url || {};

util.max = function(array) {
  var max = array[0];
  var len = array.length;
  for (var i = 0; i < len; ++i) {
    if (array[i] > max) {
      max = array[i];
    }
  }
  return max;
}

util.average = function(array) {
  var sum = 0;
  var len = array.length;
  for (var i = 0; i < len; ++i) {
    sum += array[i];
  }
  return sum / len;
}

function Sound() {
  var MIX_TO_MONO = true;
  var NUM_SAMPLES = 2048;

  var self_ = this;
  var context_ = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
  var source_ = null;
  var analyser_ = null;
  var reqId_ = null;

  this.playing = false;

  var processAudio_ = function(time) {
    var freqByteData = new Uint8Array(analyser_.frequencyBinCount);

    if (waveForm.checked) {
      analyser_.getByteTimeDomainData(freqByteData);
    } else {
      analyser_.getByteFrequencyData(freqByteData);
    }

    var percent = Math.min((util.max(freqByteData) / 150) * 100, 105);
    if (!self_.playing) {
      percent = 100;
    }
    gradient.style.backgroundSize = '76% 41%, 55% 100%, ' + percent + '%, ' + percent + '%';

    if (showCanvas.checked) {
      self_.renderFFT('canvas', freqByteData);
    }
  };

  this.renderFFT = function(format, freqByteData) {
    if (format == 'canvas') {
      var SPACER_WIDTH = 5;
      var BAR_WIDTH = 5;
      var numBars = Math.round(canvas.width / SPACER_WIDTH);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw rectangle for each frequency bin.
      var y = (canvas.height / 2) + 3;
      for (var i = 0; i < numBars; ++i) {
        var magnitude = freqByteData[i];
        var height = magnitude / (canvas.height / 75);
        ctx.fillRect(i * SPACER_WIDTH, y, BAR_WIDTH, -height);
        ctx.fillRect(i * SPACER_WIDTH, y, BAR_WIDTH, height);
      }
    }
  };

  this.initAudio = function(arrayBuffer) {
    if (source_) {
      runCmd('stop');
    }

    source_ = context_.createBufferSource();
    source_.loop = false;

    // Use async decoder if it is available.
    if (context_.decodeAudioData) {
      context_.decodeAudioData(arrayBuffer, function(buffer) {
        source_.buffer = buffer;
      }.bind(this), function(e) {
        DEBUG && console.log(e);
      });
    } else {
      source_.buffer = context_.createBuffer(arrayBuffer, MIX_TO_MONO /*mixToMono*/);
    }
  };

  this.liveInputInit = function() {
    this.play();
    document.querySelector("[data-func='liveInputInit']").disabled = true;
    document.querySelector("[data-func='stop']").disabled = false;
  };

  this.load = function(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function(e) {
      document.querySelector("[data-func='play']").disabled = false;
      self_.initAudio(request.response);
    };
    request.send();
  };

  // For live into, we need to "convert to mono" to both channels have data.
  this.convertToMono = function(input) {
     var splitter = context_.createChannelSplitter(2);
     var merger = context_.createChannelMerger(2);

     input.connect(splitter);
     splitter.connect(merger, 0, 0);
     splitter.connect(merger, 0, 1);
     return merger;
  };

  this.play = function() {

    //altanai added for getting speech from existing webrtc objects rather than creating fresh objects using this js 
    var stream=streamresource;

    source_ = context_.createMediaStreamSource(stream);

      // Connect the processing graph: source -> analyser -> destination
      analyser_ = context_.createAnalyser();
      //source_.connect(analyser_);
      this.convertToMono(source_).connect(analyser_);
      analyser_.connect(context_.destination);

      //source_.start(0);
      this.playing = true;

      (function callback(time) {
        processAudio_(time);
        reqId_ = window.requestAnimationFrame(callback);
      })();

  };

  this.stop = function() {
    source_.disconnect(0);
    analyser_.disconnect(0);
    this.playing = false;
    window.cancelAnimationFrame(reqId_);
  };
}

//replacing onclick="runCmd(this)" with event listner for button click 
document.getElementById("playhal").addEventListener("click", function(){

    //startDictation(event);
    //halbutton status cycle  : stpped -> dictating -> sending -> stopped ... 
    if(halbuttonstatus=="stopped"){
      halbuttonstatus="dictating";
      //also start dictation 
      startDictation(event);
    }
    else if(halbuttonstatus=="dictating"){
      halbuttonstatus="stopped";  
      //stops dicattaion 
      startDictation(event);
    }

});

/*document.getElementById("pausehal").addEventListener("click", function(){
  //  sound['stop']();
  //  document.querySelector("[data-func='liveInputInit']").disabled = false;
});*/

var waveForm = document.getElementById('waveform');
var canvas = document.getElementById('fft');
var showCanvas = document.getElementById('show-canvas');
var gradient = document.querySelector('#hal .inner .inner');
//var ctx = canvas.getContext('2d');
//ctx.fillStyle = 'rgba(0,0,0,0.1)'; //rgba(68,0,3,0.2)

var sound = new Sound();

(function init() {
  //sound.load('audio/gal9000.wav');
  showCanvas.addEventListener('change', function(e) {
    canvas.classList.toggle('hidden');
  }, false);
})();
/*------------------------get parent streams -------------*/
// var val=window.parent.sendsampleval();
// DEBUG && console.log(" val "+ val);

//var audiostream=null;

//audiostream=window.parent.callbackBroplugpluginRequestStream();
window.parent.TFXlocalStream("speechtextTranslator","ask");
var streamresource;
function fetchstream(audiostream){
  streamresource=audiostream;
  DEBUG && console.log(" stream obtained on plugin page ");
}

/*----------------hide and display the tranbox ------------------*/
function showDiv(name){
  document.getElementById(name).removeAttribute("hidden");
}

function hideDiv(name){
  document.getElementById(name).hidden = true;
}

