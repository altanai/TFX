window.addEventListener('resize', resizeCanvas, false);
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var v=document.getElementById("remotes").getElementsByTagName("video");

    function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;               
                drawStuff(); 
    }
        
    function drawStuff() {

	v[0].addEventListener('play', function() {
									var i=window.setInterval(function() {
											ctx.drawImage(v[0],5,5,560,525)
												},20);
									},false);
    }