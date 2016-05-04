var curTool={
  "type":"pen"
}
var saveToolState;

define(["jquery"], function($) {

  var init = function(){

    $('#nav > li').click(function(e){
    $('#nav > li').removeClass();

    $(e.currentTarget).addClass('active');
       toolBoxClickHandler( $(e.currentTarget).attr('id') );
    });
  };

  var toolBoxClickHandler = function(e){

  if(e=="colorpalatte"){
    //do nothing . color palatte will rspond by itself 
  }
  else{
     curTool.type =e;

/*     if(curTool.type=="text"){
      //display a empty textbox for text tool
        if(document.getElementById("tempTxtBox")==null){
            var element = document.createElement("input");
            element.setAttribute("type", "text");
            element.setAttribute("value", "enter text here ");
            element.setAttribute("name", "tempTxtBox");
            element.setAttribute("id","tempTxtBox");
            $('#textcontentbox').append(element);
            console.log("textbox appended to mennubar");
        }
        // $('#textcontentbox').text("enter text here");

      }*/

    }
  }
  return {
    init :init
  };
});
