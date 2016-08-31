App = Ember.Application.create({
});


// Map hyperlinks
App.Router.map(function() {
  
  this.resource('aboutwidgets');
  
  this.resource('aboutbroplug');

  this.resource('widgetupload');
  
  this.resource('posts', function() {
    this.resource('post', { path: ':post_id' });
  });
  
  this.resource('index',{path: '/'});
});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    return posts;
  }
});

App.PostRoute = Ember.Route.extend({
  model: function(params) {
    return posts.findBy('id', params.post_id);
  }
});

App.PostController = Ember.ObjectController.extend({
  isEditing: false,
  
  actions: {
    edit: function() {
      this.set('isEditing', true);
    },

    doneEditing: function() {
      this.set('isEditing', false);
    }
  }

 });


var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
  return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.helper('format-date', function(date) {
  return moment(date).fromNow();
});


App.WidgetuploadRoute = Ember.Route.extend({
 model: function() {
    return ['Upload a ZIP Widget File', 'Verify settings ', ' Run it on broplug extension'];
  }
});


App.WidgetuploadController = Ember.ObjectController.extend({
 actions: {
        file_upload: function(data) {
            alert("File Data : " + data);
            this.set('model',data.split(","));
        }
    }
  });

    App.FileUp= Ember.TextField.extend({
    type: 'file',
    change: function(evt) {
        var self = this;
        var input = evt.target;
        if (input.files && input.files[0]) {
            var that = this;

            var reader = new FileReader();
            reader.onload = function(e) {
                var data = e.target.result;
                //var c = App.ApplicationController.create();
                console.log(self);
                console.log(self.get('parentView'));
                console.log(self.get('parentView').get('controller'));
                //self.get('parentView').get('controller').send('file_upload', data);
                self.get('targetObject').send('file_upload', data);
            }
           // savewidget(input.files);
/*            var theController =App.theController.create();
              theController.send('methodA');*/

                var uploadUrl = "/widgets";
                var uploader = Ember.Uploader.create({
                  url: uploadUrl
                });

                      if (!Ember.isEmpty(input.files)) {
                          uploader.upload(input.files[0]);
                       }

            reader.readAsText(input.files[0]);
        //  reader.readAsText(input.files[0]);
        }
    },
});

        

/*App.theController = Ember.ArrayController.extend({
  methodA:function(){
    //How can methodA calling mehtodB
    //is.send('methodB');




    console.log('methodA called');
  },
  actions:{
    methodB:function(){
      //How can methodB calling methodC
      //this.send('methodC');


      console.log('methodB called');
    },
    methodC:function(){
      console.log('methodC called');
    }
  }
});*/

