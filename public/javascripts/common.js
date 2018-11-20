
function __log(e, data) {
    let msg = e + ' ' + (data || '');
    let json = '{"status":"AUDIO","text":"' + msg + '"}';
    // updateStatus(json, false, false);
}

function startRecording(element) {
    recorder && recorder.record();
     
     __log('Recording...');

    $('#recordImg').prop('onclick', false);

    $('#recordImg').attr({
        src: '/images/stop.png',
    });
}

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');

    recorder = new Recorder(input);
    __log('Recorder initialised.');
}


function stopRecording(element) {

    recorder && recorder.stop();

    __log('Stopped recording.');

    // submit audio file to JARVIS
    sendAudioToJarvis(element);

    recorder.clear();
}

function sendTextToJarvis(text) {

    var data = { "text": text };

    $.ajax({
        url: '/api/text',
        data: data,
        cache: false,
        type: 'POST',
        success: function (data) {
        }
    });

}

function sendAudioToJarvis(element) {
    recorder && recorder.exportWAV(function (blob) {

        var data = new FormData();
        data.append('command', blob);

        var e = element;

        $.ajax({
            url: '/api/command',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {

                recording = false;

                $("#recordImg").attr({
                    src: '/images/microphone.png'
                });

            }
        });

    });
}

function say(text) {
    var url = 'https://api.voicerss.org/?key=f716f782b498444c95b14a63fe05a917&hl=pt-br&r=2&src=' + encodeURIComponent(text);
    var a = new Audio(url);
    a.play();
}

function initializeAudio() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.mediaDevices.getUserMedia ' + (navigator.mediaDevices.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => { startUserMedia(stream); });
}

