var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

function line(){
ctx.moveTo(0,0);
ctx.lineTo(200,100);
ctx.stroke();
}

function circle(){
ctx.beginPath();
ctx.arc(95,50,40,0,2*Math.PI);
ctx.stroke();
}