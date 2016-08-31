define(["jquery", "controllers/toolbox-controller", "controllers/drawing-controller"], function($, toolboxController, drawController) {
  var init = function(){
       toolboxController.init();
       drawController.init();
       // window.onresize  = function(event) {
       // 		drawController.resizeStage();
       // }
  };
  return {
    init :init
  };
});
