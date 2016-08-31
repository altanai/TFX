//get the values form json file
/*var posts = (function() {

        var posts= null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "js/widgetsList.json",
            'dataType': "json",
            'success': function (data) {
                posts = data;
            }

        });
        alert("Inside posts "+ posts);
        return posts;
    })();*/

var posts= [{
  "id":"567",

  "version": "2",

  "title": "broplug webrtc v8",

  "author": "altanai",

  "date": "12-24-2012'",

  "description": "Draw plugin for Broplug ",

  "excerpt": "blah blah.",
  
  "body": "More blah blah ",

  "icons": [{
    "icon": "icons/icondefaultdraw.png",
    "pressedicon": "icons/icondefaultdraw.png",
  }],

  "main_page_location": "src/drawwindow.html",
},

{
  "id":"568",

  "version": "2",

  "title": "broplug webrtc v8",

  "author": "altanai",

  "date": "12-24-2012'",

  "description": "Draw plugin for Broplug ",

  "excerpt": "blah blah.",
  
  "body": "More blah blah ",

  "icons": [{
    "icon": "icons/icondefaultdraw.png",
    "pressedicon": "icons/icondefaultdraw.png",
  }],

  "main_page_location": "src/drawwindow.html",
}

];