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

    console.log(" init of drawing controller ");
    var canvas  = document.getElementById('drawcanvas');
    color= $("#colorname").css('backgroundColor');
    console.log("color", color);
  //  $('#colorname').off().on('click',handleColorChange);
  $('#colorpalette').off().on('click',handleColorChange);
    canvas.height = $('#drawcanvas').height();
    canvas.width = window.innerWidth;

    //stage = new createjs.Stage(document.getElementById('drawcanvas'));
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
        //self.drawPen(evt.data.color,evt.data.layersarray);
        self.drawPen(evt.data.color,evt.data.arrMidPtx,evt.data.arrMidPty,evt.data.arrOldPtx, evt.data.arrOldPty, evt.data.arrOldMidPtx, evt.data.arrOldMidPty);
      }
      else if(evt.data.shape=="eraser"){
        self.drawEraser(evt.data.x1,evt.data.y1);
      }
      else if(evt.data.shape=="text"){
        self.drawText(evt.data.color, evt.data.tx,evt.data.ty, evt.data.txt, evt.data.font);
      }
    }
  };


  var handleColorChange = function (){
    //color = $('#colorname').css('backgroundColor');
    color = $('#colorname').value;
  };

  Object.observe(curTool, function(changes) {
    return curTool.type;
  });

  var handleMouseDown = function (event) {
    console.log(" handle moue down ");
      color = $('#colorname').css('backgroundColor');// check for color property again !important nobody delet this
      oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
      oldMidPt = oldPt;
      stage.addEventListener("stagemousemove" , handleMouseMove);
  };

  var handleMouseMove = function (event) {
    console.log(" handle mouse move ");
    midPt = new createjs.Point(oldPt.x + stage.mouseX>>1, oldPt.y+stage.mouseY>>1);

    if(curTool.type=="rectangle"){
      drawRectangle(color, oldPt.x, oldPt.y,midPt.x, midPt.y);
    }

    else if ( curTool.type=="circle"){
      var r =distance(oldPt,midPt);
      drawCircle(color,oldPt.x, oldPt.y, r);
    }

    else if ( curTool.type=="star"){
      var r =distance(oldPt,midPt);
      drawStar(color,oldPt.x, oldPt.y,r, 0.6,-90);
    }

    else if(curTool.type=="eraser"){
      drawEraser(oldPt.x, oldPt.y);
    }

    else if ( curTool.type=="pen"){
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

    else if (curTool.type=="arrow"){
      event.target.x = event.stageX + stage.mouseX;
      event.target.y = event.stageY + stage.mouseY;
      update = true;
    }

  };

  var handleMouseUp = function (event) {
    console.log(" handle mouse up ");
    stage.removeEventListener("stagemousemove" , handleMouseMove);
    finalPt=midPt;
    if(curTool.type=="rectangle") {
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

    else if(curTool.type=="star") {
        var data ={
          "shape":"star",
          "color":color,
          "x1":oldPt.x,
          "y1":oldPt.y,
          "r":distance(oldPt,finalPt),
          "p":0.6,
          "a":-90
        }
        sendData(data);
    }

    else if(curTool.type=="eraser"){
        var data ={
          "shape":"eraser",
          "x1":oldPt.x,
          "y1":oldPt.y,
        }
        sendData(data);

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
    console.log("Pen ");
    console.log( arrMidPtx.length );

    for(var j=0;j<arrMidPtx.length;j++) {
    drawingCanvas.graphics.clear().setStrokeStyle(stroke, 'round', 'round').beginStroke(col).moveTo(arrMidPtx[j], arrMidPty[j]).curveTo(arrOldPtx[j], arrOldPty[j], arrOldMidPtx[j], arrOldMidPty[j]);
    stage.addChild(drawingCanvas);
    stage.update();
    }
  };

  var drawEraser = function ( x,y ){
      console.log("Eraser ");

      var tempcanvas = document.getElementById('drawcanvas');
      var tempctx=tempcanvas.getContext("2d");
      tempctx.beginPath();
      tempctx.globalCompositeOperation = "destination-out";
      tempctx.arc(x,y, 20, 0, Math.PI * 2, false);
      tempctx.fill();
      tempctx.closePath();
      tempctx.globalCompositeOperation = "source-over";
      drawingCanvas.graphics.clear();
      stage.addChild(drawingCanvas);
      stage.update();
  }

  var drawRectangle = function (col,x1,y1,x2,y2){
    console.log(" Rect  "+x1+ " "+y1+" "+x2+ " " +y2);
    drawingCanvas.graphics.clear().setStrokeStyle(1).beginFill(col).drawRect(x1,y1,x2,y2);
    stage.addChild(drawingCanvas);
    stage.update();
  };

  var drawCircle = function (col,cx1,cy1,r){
    console.log(" Circle  "+cx1+ " "+cy1+" "+ r);
    drawingCanvas.graphics.clear().setStrokeStyle(1).beginFill(col).drawCircle(cx1,cy1,r);
    stage.addChild(drawingCanvas);
    stage.update();
  };

  var drawStar = function (col,cx1,cy1,r,p,a){
    console.log("Star");
    drawingCanvas.graphics.clear().setStrokeStyle(1).beginFill(col).drawPolyStar(cx1,cy1,r,p,a);
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

//functions for syncing up the content
  var sendData = function (message){
    var widgetdata={
    "type":"plugin",
    "plugintype":"draw",
    "action":"update",
    "content":message
    };
//  console.log( message);
  window.parent.postMessage(widgetdata,'*');
  }

  return {
    init :init ,
    message: onmessage,
    drawPen : drawPen,
    drawRectangle : drawRectangle,
    drawCircle : drawCircle,
    drawStar : drawStar,
    drawEraser : drawEraser,
    drawText : drawText
  };
});
