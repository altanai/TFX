  /*------------- waiting sound till user joins -------------------*/
  function playWaitingMusic() {
    var audio = document.getElementById('audio1');
    if (audio.paused) {
        audio.volume=0.2;
        audio.play();
    }else{
        audio.pause();
        audio.currentTime = 0
    }
  }

  function stopWaitingMusic() {
    var audio = document.getElementById('audio1');
    audio.pause();
    audio.currentTime = 0;
  }