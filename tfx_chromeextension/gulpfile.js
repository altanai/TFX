var gulp = require('gulp');
var concat = require('gulp-concat');
var cat = require('gulp-cat');
var addsrc = require('gulp-add-src');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var base64 = require('gulp-base64');
var gulpSequence = require('gulp-sequence');
var exec = require('child_process').exec;
var remoteSrc = require('gulp-remote-src');

var fs = require('fs');
var property = require('./propertyWriter.js')(fs);
/*property.writeEnv();*/
var properties = JSON.parse(property.readEnv());

var folderPath = "/minified";

gulp.task('vendorjs', function () {
    console.log(" gulping snapshotRecord  ");
    list = [
        "https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js",
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js",
        "https://apis.google.com/js/client.js?onload=init",
        "http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js",
        "https://cdn.socket.io/socket.io-1.4.5.js",
        "https://simplewebrtc.com/latest-v2.js"
    ];

    console.log(list);
    remoteSrc(list, {base: ''})
        .pipe(uglify())
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(folderPath));
});

gulp.task('tfxjs', function () {
    console.log(" gulping main TFX scripts ");
    appJsList = [
        "js/broplug.js",
        "js/angularcontrol.js",
    ];
    console.log(appJsList);
    gulp.src(appJsList)
        .pipe(uglify())
        .pipe(concat('mainScript.js'))
        .pipe(gulp.dest(folderPath));
});

gulp.task('vendorcss', function () {
    console.log(" gulping main stylesheets css  ");
    cssList = [
        "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
    ];
    console.log(cssList);
    remoteSrc(list, {base: ''})
        //.pipe(minifyCss())
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(folderPath));
});

gulp.task('customstyle', function () {
    console.log(" gulping custom stylesheets css  ");
    cssList = [
        "css/style.css"
    ];
    console.log(cssList);
    gulp.src(cssList)
        //.pipe(minifyCss())
        .pipe(concat('customStyle.css'))
        .pipe(gulp.dest(folderPath));
});


function execute(command, callback) {
    exec(command, function (error, stdout, stderr) {
        callback(stdout, stderr);
    });
}

gulp.task('git_pull', function (cb) {
    execute('git pull', function (resp) {
        cb();
    });
});

gulp.task('default', gulpSequence(
    'vendorjs',
    'vendorcss',
    'mainstyle',
    'tfxjs'
)); 
