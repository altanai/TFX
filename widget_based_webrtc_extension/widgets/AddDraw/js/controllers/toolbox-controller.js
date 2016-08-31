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

  }else{
 
    if(e=="refresh"){
        document.location.href = document.location.href;
    }

    else{
         curTool.type =e;

         if(curTool.type=="text"){
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

          }
          /*
          else {
            // $('#textcontentbox').text(""); 
            $('#textcontentbox').remove(document.getElementById("tempTxtBox"));

            if(curTool.type=="pen")   

             //document.getElementById("drawcontainer").style.cursor='url("../css/pen.png"), pointer';
            
            else if(curTool.type=="circle")
             //document.getElementById("drawcontainer").style.cursor='url("../css/circle.png"), pointer';

            else if(curTool.type=="rectangle")
             //document.getElementById("drawcontainer").style.cursor='url("../css/rectangle.png"), pointer';
          }*/
    }


    }
  }
  return {
    init :init
  };
});
