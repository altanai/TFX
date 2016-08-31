/*------------------- picked form google web speech api demo ----------------*/
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
//deaafult 6 and 6 of united states english change to top . 
//require change for the peerlang to be not undfeined 

//select_language.selectedIndex = 6;
select_language.selectedIndex = 1;
updateCountry();
//select_dialect.selectedIndex = 6;
select_dialect.selectedIndex = 1;
// showInfo('info_start');
// showInfo('info_start');

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
    console.log("update lang");
    updateCountry();
    mylang=splitCountryLang(select_dialect.value);
    sendlanguage(mylang);
});

/*---------------------translator using key -----------------------*/

function translateText(response) {
  console.log(response);
 // document.getElementById("translation").innerHTML += "<br>" + response.data.translations[0].translatedText;
  addMessageLangLog('Other', response.data.translations[0].translatedText);
  texttospeech(response.data.translations[0].translatedText); 
  //$('#MessageLangHistoryBox').text( $('#MessageLangHistoryBox').text() +'\n'+ 'other : '+ response.data.translations[0].translatedText );
}

function translator(textinput , mylang, peerlang){
      console.log("translating form "+peerlang + " to "+ mylang);
      var newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      var sourceText = escape(textinput);
      //var sourceText = escape(document.getElementById("sourceText").innerHTML);
      // WARNING: be aware that YOUR-API-KEY inside html is viewable by all your users.
      // Restrict your key to designated domains or use a proxy to hide your key
      // to avoid misuage by other party.
      //var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyAnPxrh7veHDrDaPjoTRJJV7GoqIoIYgOw&source=en&target=ja&callback=translateText&q=' + sourceText;
      var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyAnPxrh7veHDrDaPjoTRJJV7GoqIoIYgOw&source='+peerlang+'&target='+mylang+'&callback=translateText&q=' + sourceText;

      newScript.src = source;

      // When we add this script to the head, the request is sent off.
      document.getElementsByTagName('head')[0].appendChild(newScript);
}


/*---------------------text to speech ----------------------*/

//text to speech function 

function texttospeech(textinput){
    // make it audioble using text to speech  API - SpeechSynthesis
    var msg = new SpeechSynthesisUtterance(textinput);
    //msg.lang = 'en-US';
    msg.lang  = select_dialect.value;
  
    window.speechSynthesis.speak(msg);
    msg.onend = function(e) {
      console.log('Finished in ' + event.elapsedTime + ' seconds.');
    };

}

/*--------------------Speech to text -----------------------*/


var final_transcript = '';
var recognizing = false;
 
if ('webkitSpeechRecognition' in window) {
 
  var recognition = new webkitSpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };
 
  recognition.onerror = function(event) {
    console.log(event.error);
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
    
    // do not require user to  click send button . send the text to peer 
    $("#send_button").click();
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
  
  $("#start_button").text('Recognizing');

  if (recognizing) {
    recognition.stop();
    $("#start_button").text('Stoped recognizing');
    console.log("stop recognizing ");
    return;
  }

  final_transcript = '';
  recognition.lang = select_dialect.value;
  //recognition.lang = 'en-US';
  console.log(" Recognisation parameters "+ recognition.lang);

  recognition.start();
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
}


//Message Function
$("#start_button").click(function(){
    console.log(" start dictataion ");
    startDictation(event);
});

/*--------------------- show infor on screen -------------------------*/
function cleartextbox(){
      $("#final_span").val('');
   // $('#MessageBox').val('');
}

function addMessageLog(who, msg){
    //add text to text area for message log for self 
    $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() + '\n'+ who+' : '+ msg);
}

function addMessageLangLog(who, msg){
    //add text to text area for message log for self 
    $('#MessageLangHistoryBox').text( $('#MessageLangHistoryBox').text() + '\n'+ who+' : '+ msg);
}

/*----------------------- send and recive the data ----------------------*/
//send my language to peer 
function sendlanguage(mylang){
        console.log("sharing language "+ mylang+ " to peer");
        //send to peer 
        var data ={
           "lang":mylang
          }
        sendMessage(data);
}
//send message when mouse is on mesage dicv ans enter is hit
// aldo convert text to speech 

$("#send_button").click(function(){

        //var mytext=$('#final_span').val();
        var mytext =$('#results').text();
        console.log( mytext);

        //texttospeech(mytext);

        //send to peer 
        var data ={
           "msgcontent":mytext
          }
        sendMessage(data);

        addMessageLog('You',mytext);
        addMessageLangLog('You',mytext);
        
        cleartextbox();

});

// function addMessageLog(msg){
//     //add text to text area for message log for self 
//     $('#MessageHistoryBox').text( $('#MessageHistoryBox').text() + '\n'+ 'you : '+ msg);
// }


// handles send message
function sendMessage(message) {
      var widgetdata={
      "type":"plugin",
      "plugintype":"relatimespeechtranslator",
      "action":"update",
      "content":message
      };
  // postmessage
  window.parent.postMessage(widgetdata,'*');
}

//to handle  incoming message
function onmessage(evt) {
    //add text to text area for message log from peer
  if(evt.data.msgcontent!=null ){
    console.log(evt.data.msgcontent);
            addMessageLog('Other',evt.data.msgcontent);
      //$('#MessageHistoryBox').text( $('#MessageHistoryBox').text() +'\n'+ 'other : '+ evt.data.msgcontent );
      //texttospeech(evt.data.msgcontent);
      //call translator 
      //append the rsult in messahelanghistory box
      translator(evt.data.msgcontent,mylang,peerlang); 
      
  }else if(evt.data.lang!=null ){
     // set the peer langugae parameter
     peerlang=evt.data.lang;
     console.log(" language received from peer "+ peerlang);
  }
}

window.addEventListener("message",onmessage,false);