define(["jquery", "colorpicker" , "easel" ], function($, easel) {

  var stage;
  var drawingCanvas;
  var stroke =4; // default stroke size
  var color ;// pallete color
  var layersAsArray =[];//used for pen tool

// especially for line tool
  var arrMidPtx = [];
  var arrMidPty = [];
  var arrOldPtx = [];
  var arrOldPty = [];
  var arrOldMidPtx = [];
  var arrOldMidPty = [];

//especially for the tetx tool
  var font="30px Arial";
  var textcontent;

  var init = function(){
    var canvas  = document.getElementById('drawcanvas');
    color= $("#colorname").css('backgroundColor');
    $('#colorpalette').off().on('click',handleColorChange);
    canvas.height = $('#drawcanvas').height();
    canvas.width = window.innerWidth;

    stage = new createjs.Stage(canvas);
    stage.autoClear = false;
    stage.enableDOMEvents(true);
    createjs.Touch.enable(stage);
    createjs.Ticker.setFPS(24);

    stage.addEventListener("stagemousedown", handleMouseDown);
    stage.addEventListener("stagemouseup", handleMouseUp);

    drawingCanvas = new createjs.Shape();
    drawingCanvas.setBounds(0,0 , canvas.width, canvas.height );
    stage.addChild(drawingCanvas);
    stage.update();

    var self =this;

    window.addEventListener("message",onmessage,false);

    function onmessage(evt){
      if(evt.data.shape=="rectangle"){
        self.drawRectangle(evt.data.color,evt.data.x1,evt.data.y1,evt.data.x2,evt.data.y2);
      }
      else if(evt.data.shape=="circle"){
        self.drawCircle(evt.data.color,evt.data.x1,evt.data.y1,evt.data.r);
      }
      else if(evt.data.shape=="star"){
        self.drawStar(evt.data.color,evt.data.x1,evt.data.y1,evt.data.r,evt.data.p,evt.data.a);
      }
      else if(evt.data.shape=="pen"){
        self.drawPen(evt.data.color,evt.data.arrMidPtx,evt.data.arrMidPty,evt.data.arrOldPtx, evt.data.arrOldPty, evt.data.arrOldMidPtx, evt.data.arrOldMidPty);
      }
      else if(evt.data.shape=="eraser"){
        self.drawEraser(evt.data.arrMidPtx,evt.data.arrMidPty,evt.data.arrOldPtx, evt.data.arrOldPty, evt.data.arrOldMidPtx, evt.data.arrOldMidPty);
      }
      else if(evt.data.shape=="text"){
        self.drawText(evt.data.color, evt.data.tx,evt.data.ty, evt.data.txt, evt.data.font);
      }
      else if(evt.data.shape=="refresh"){
        self.drawRefresh();
      }
    }
  };


  var handleColorChange = function (){
    color = $('#colorname').value;
  };

  Object.observe(curTool, function(changes) {
    return curTool.type;
  });

  var handleMouseDown = function (event) {
      color = $('#colorname').css('backgroundColor');// check for color property again !important nobody delet this
      oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
      oldMidPt = oldPt;
      stage.addEventListener("stagemousemove" , handleMouseMove);
  };

  var handleMouseMove = function (event) {
    //to change the cursor to cross symbol
    document.body.style.cursor ="crosshair";
    
    if(curTool.type=="rectangle"){

      midPt = new createjs.Point(stage.mouseX,stage.mouseY);
      midPt.x=Math.abs(midPt.x-oldPt.x);
      midPt.y=Math.abs(midPt.y-oldPt.y);

      drawRectangle(color, oldPt.x, oldPt.y, midPt.x, midPt.y);
      //setMousePosition();
      /*oldPt.x = Math.abs(mouse.x - mouse.startX) + 'px';
      oldPt.y = Math.abs(mouse.y - mouse.startY) + 'px';
      midPt.x = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
      midPt.y = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
*/
      //oldPt.x=event.pageX - this.offsetLeft;

    }

    else if ( curTool.type=="circle"){
      midPt = new createjs.Point(stage.mouseX,stage.mouseY);
      var r =distance(oldPt,midPt);
      drawCircle(color,oldPt.x, oldPt.y, r);
    }

    else if(  curTool.type=="eraser"){

      midPt = new createjs.Point(oldPt.x + stage.mouseX>>1, oldPt.y+stage.mouseY>>1);

      var tempcanvas = document.getElementById('drawcanvas');
      var tempctx=tempcanvas.getContext("2d");
      tempctx.beginPath();
      tempctx.globalCompositeOperation = "destination-out";      
      tempctx.arc(midPt.x, midPt.y, 20, 0, Math.PI * 2, false);     
      tempctx.fill();
      tempctx.closePath();
      tempctx.globalCompositeOperation = "source-over";
      drawingCanvas.graphics.clear();

      arrMidPtx.push(midPt.x);
      arrMidPty.push(midPt.y);
      arrOldPtx.push(oldPt.x);
      arrOldPty.push(oldPt.y);
      arrOldMidPtx.push(oldMidPt.x);
      arrOldMidPty.push(oldMidPt.y);

      oldPt.x = stage.mouseX;
      oldPt.y = stage.mouseY;
      oldMidPt.x = midPt.x;
      oldMidPt.y = midPt.y;

      stage.addChild(drawingCanvas);
      stage.update();
    }

    else if ( curTool.type=="pen"){

      midPt = new createjs.Point(oldPt.x + stage.mouseX>>1, oldPt.y+stage.mouseY>>1);
      drawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(color).moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
      
      arrMidPtx.push(midPt.x);
      arrMidPty.push(midPt.y);
      arrOldPtx.push(oldPt.x);
      arrOldPty.push(oldPt.y);
      arrOldMidPtx.push(oldMidPt.x);
      arrOldMidPty.push(oldMidPt.y);

      oldPt.x = stage.mouseX;
      oldPt.y = stage.mouseY;
      oldMidPt.x = midPt.x;
      oldMidPt.y = midPt.y;

      stage.addChild(drawingCanvas);
      stage.update();
    }

    else if (  curTool.type=="arrow"){
      event.target.x = event.stageX + stage.mouseX;
      event.target.y = event.stageY + stage.mouseY;
      update = true;
    }

  };

  var handleMouseUp = function (event) {
    stage.removeEventListener("stagemousemove" , handleMouseMove);

    if(midPt!=undefined)
        finalPt=midPt;
    
    if(curTool.type=="rectangle") {
        drawRectangle(color, oldPt.x, oldPt.y, midPt.x, midPt.y);
        var data ={
          "shape":"rectangle",
          "color":color,
          "x1":oldPt.x,
          "y1":oldPt.y,
          "x2":finalPt.x,
          "y2":finalPt.y
        }
        sendData(data);
    }

    else if(curTool.type=="circle") {
        var data ={
          "shape":"circle",
          "color":color,
          "x1":oldPt.x,
          "y1":oldPt.y,
          "r":distance(oldPt,finalPt)
        }
        sendData(data);
    }

    else if(curTool.type=="eraser"){
        var data ={
         "shape":"eraser",
         "arrMidPtx" : arrMidPtx,
         "arrMidPty" : arrMidPty,
         "arrOldPtx" : arrOldPtx,
         "arrOldPty" : arrOldPty,
         "arrOldMidPtx" : arrOldMidPtx,
         "arrOldMidPty" : arrOldMidPty
        }        
        sendData(data);
        arrMidPtx = [];
        arrMidPty = [];
        arrOldPtx = [];
        arrOldPty = [];
        arrOldMidPtx = [];
        arrOldMidPty = [];        
    }

    else if( curTool.type=="pen"){
      var data ={
       "shape":"pen",
       "color":color,
       "arrMidPtx" : arrMidPtx,
       "arrMidPty" : arrMidPty,
       "arrOldPtx" : arrOldPtx,
       "arrOldPty" : arrOldPty,
       "arrOldMidPtx" : arrOldMidPtx,
       "arrOldMidPty" : arrOldMidPty
       }
      sendData(data);
      arrMidPtx = [];
      arrMidPty = [];
      arrOldPtx = [];
      arrOldPty = [];
      arrOldMidPtx = [];
      arrOldMidPty = [];
    }

    else if(curTool.type=="text"){   
      font="30px Arial";
      textcontent= $("#tempTxtBox").val();
      drawText(color ,oldPt.x, oldPt.y, textcontent, font);
      var data ={
          "shape":"text",
          "color":color,
          "tx":oldPt.x,
          "ty":oldPt.y,
          "txt":textcontent,
          "font":font
        }                
      sendData(data);
    }  

  };


var drawPen = function( col , arrMidPtx , arrMidPty, arrOldPtx , arrOldPty, arrOldMidPtx, arrOldMidPty){
    for(var j=0;j<arrMidPtx.length;j++) {
    drawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(col).moveTo(arrMidPtx[j], arrMidPty[j]).curveTo(arrOldPtx[j], arrOldPty[j], arrOldMidPtx[j], arrOldMidPty[j]);
    stage.addChild(drawingCanvas);
    stage.update();
    }
  };

var drawEraser = function( arrMidPtx , arrMidPty, arrOldPtx , arrOldPty, arrOldMidPtx, arrOldMidPty){
    for(var j=0;j<arrMidPtx.length;j++) {
      var tempcanvas = document.getElementById('drawcanvas');
      var tempctx=tempcanvas.getContext("2d");
      tempctx.beginPath();
      tempctx.globalCompositeOperation = "destination-out";      
      tempctx.arc(arrMidPtx[j], arrMidPty[j], 20, 0, Math.PI * 2, false);     
      tempctx.fill();
      tempctx.closePath();
      tempctx.globalCompositeOperation = "source-over";

      drawingCanvas.graphics.clear();
      stage.addChild(drawingCanvas);
      stage.update();
    }
  };

  var drawRectangle = function (col,x1,y1,x2,y2){
    drawingCanvas.graphics.clear().setStrokeStyle(1).beginFill(col).drawRect(x1,y1,x2,y2);
    stage.addChild(drawingCanvas);
    stage.update();
  };

  var drawCircle = function (col,cx1,cy1,r){
    drawingCanvas.graphics.clear().setStrokeStyle(1).beginFill(col).drawCircle(cx1,cy1,r);
    stage.addChild(drawingCanvas);
    stage.update();
  };

  function distance(p, q)  {
    var dx   = p.x - q.x;         //horizontal difference
    var dy   = p.y - q.y;         //vertical difference
    var dist = Math.sqrt( dx*dx + dy*dy ); //distance using Pythagoras theorem
    return dist;
  }

  var drawText = function (col,tx,ty,textcontent,font){
    var txt = new createjs.Text(textcontent, font, col);
    txt.x = tx;
    txt.y = ty;
    stage.addChild(txt);
    drawingCanvas.graphics.clear();
    stage.update();
  };

  $('#refresh').off().on('click',function(){
        confirmRefresh();
  });

  var drawRefresh = function(){
      document.location.href = document.location.href;
  }

function confirmRefresh() {
    var x;
    if (confirm("Refreshing will erase all drawings!") == true) {
      var data ={
        "shape":"refresh"
      }
      sendData(data);
      drawRefresh();
    } 
   
}

//functions for syncing up the content
  var sendData = function (message){
    var widgetdata={
    "type":"plugin",
    "plugintype":"draw",
    "action":"update",
    "content":message
    };
    window.parent.postMessage(widgetdata,'*');
  }

  return {
    init :init ,
    message: onmessage,
    drawPen : drawPen,
    drawRectangle : drawRectangle,
    drawCircle : drawCircle,
    drawEraser : drawEraser,
    drawText : drawText ,
    drawRefresh : drawRefresh
  };
});
