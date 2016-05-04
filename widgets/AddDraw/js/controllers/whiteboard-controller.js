define(["jquery", "controllers/toolbox-controller", "controllers/drawing-controller"], function($, toolboxController, drawController) {
  var init = function(){
       toolboxController.init();
       drawController.init();
  };
  return {
    init :init
  };
});
