
requirejs.config({
  config: {

    text: {
      useXhr: function (url, protocol, hostname, port) {
        return true;
      }
    },
    baseUrl: "js"
  },
  shim: {
      easel: {
          exports: 'createjs'
      }
  },
  paths: {
    jquery: 'libs/jquery-2.1.1.min',
    domready: 'libs/domReady',
    easel: 'libs/easeljs-0.7.1.min',
    colorpicker: 'jscolor'
  }
});

var setupApp = function () {
  require(["domready","controllers/whiteboard-controller"], function ( domReady, whiteboardController ) {
     domReady(function () {
        whiteboardController.init();
    });
  });
};

setupApp();
