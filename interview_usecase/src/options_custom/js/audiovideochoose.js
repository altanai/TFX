if (!MediaStreamTrack) document.body.innerHTML = '<h1>Incompatible Browser Detected. Try <strong style="color:red;">Chrome Canary</strong> instead.</h1>';

var experiments = document.querySelector('.experiment');
MediaStreamTrack.getSources(function (media_sources) {
    var sources = [];
    for (var i = 0; i < media_sources.length; i++) {
        sources.push(media_sources[i]);
    }

    getAllUserMedias(sources);
});

var devicesFetched = {};
var index = 0;

function getAllUserMedias(media_sources) {
    var media_source = media_sources[index];
    if (!media_source) return;

    // to prevent duplicated devices to be fetched.
    if (devicesFetched[media_source.id]) {
        index++;
        return getAllUserMedias(media_sources);
    }
    devicesFetched[media_source.id] = media_source;

    var constraints = {};

    if (media_source.kind == 'audio') {
        constraints.audio = {
            optional: [{
                sourceId: media_source.id
            }]
        };
    }

    if (media_source.kind == 'video') {
        constraints.video = {
            optional: [{
                sourceId: media_source.id
            }]
        };
    }

    navigator.webkitGetUserMedia(constraints, function (stream) {
        experiments.appendChild(document.createElement('br'));
        experiments.appendChild(document.createElement('br'));
        
        var h2 = document.createElement('h2');
        experiments.appendChild(h2);

        experiments.appendChild(document.createElement('br'));
        experiments.appendChild(document.createElement('br'));

        if (media_source.kind === 'audio') {
            h2.innerHTML = media_source.label || 'microphone ' + index;
        } else if (media_source.kind === 'video') {
            h2.innerHTML = media_source.label || 'camera ' + index;
        } else {
            h2.innerHTML = 'Some other kind of source: ' + JSON.stringify(media_source, null, '&nbsp;');
        }

        var mediaElement = document.createElement(media_source.kind);
        mediaElement.src = window.URL.createObjectURL(stream);
        experiments.appendChild(mediaElement);
        mediaElement.controls = true;
        mediaElement.play();
    }, function (e) {
        experiments.appendChild(document.createElement('br'));
        var h2 = document.createElement('h2');
        h2.innerHTML = JSON.stringify(e);
        experiments.appendChild(h2);
    });

    index++;
    getAllUserMedias(media_sources);
}
