var gulp = require('gulp');
var concat = require('gulp-concat'); 
var cat = require('gulp-cat');  
var addsrc = require('gulp-add-src');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css'); 
var base64 = require('gulp-base64');
var gulpSequence = require('gulp-sequence');
var exec  =require('child_process').exec;
var remoteSrc = require('gulp-remote-src');

var fs = require('fs');
var property = require('./propertyWriter.js')(fs);
/*property.writeEnv();*/
var properties= JSON.parse(property.readEnv());

var folderPath="minified";

gulp.task('vendorjs',function() {
    console.log(" gulping snapshotRecord  ");
    list=[ 
        "http://code.jquery.com/jquery-1.11.1.min.js",
        "http://code.jquery.com/ui/1.11.1/jquery-ui.min.js",
        "https://apis.google.com/js/client.js?onload=init",
        "https://cdn.socket.io/socket.io-1.4.5.js",
        "https://simplewebrtc.com/latest-v2.js"
    ]; 

    console.log(list);
    remoteSrc(list, { base: ''})
        .pipe(uglify())
        .pipe(concat('vendor.js'))  
        .pipe(gulp.dest(folderPath)); 
});

gulp.task('customscripts',function() {
    console.log(" gulping main TFX scripts ");
    appJsList=[ 
        "js/share.js"
    ]; 
    console.log(appJsList);
    gulp.src(appJsList)
        .pipe(uglify())
        .pipe(concat('customScripts.js'))  
        .pipe(gulp.dest(folderPath)); 
});

gulp.task('vendorcss',function() {
    console.log(" gulping main stylesheets css  ");
    cssList=[
        "https://code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css"
    ];
    console.log(cssList);
    remoteSrc(list, { base: ''})
      .pipe(minifyCss())
      .pipe(concat('vendor.css'))
      .pipe(gulp.dest(folderPath));
});

gulp.task('customstyle',function() {
    console.log(" gulping custom stylesheets css  ");
    cssList=[
      "css/jquery.share.css",
      "css/control.css",
      "css/widgetcustom.css"
    ];
    console.log(cssList);
    gulp.src(cssList)
      //.pipe(minifyCss())
      .pipe(concat('customStyle.css'))
      .pipe(gulp.dest(folderPath));
});


function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout,stderr); });
};

gulp.task('git_pull',function(cb){
  execute('git pull',function(resp) {
      cb();
  });
});

gulp.task('default', gulpSequence(
    'vendorjs',
    'vendorcss',
    'customstyle',
    'customscripts'
)); 
