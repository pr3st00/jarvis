/* eslint-disable camelcase */
/* eslint-disable valid-jsdoc */

const DEFAULT_LANGUAGE = 'pt-br';

/**
 * Logs
 *
 * @param {} e
 * @param {*} data
 */
function __log(e, data) {
    let msg = e + ' ' + (data || '');
    let json = '{"status":"AUDIO","text":"' + msg + '"}';
    // updateStatus(json, false, false);
}

/**
 *
 */
function startRecording(element) {
    recorder && recorder.record();

    __log('Recording...');

    $('#recordImg').prop('onclick', false);

    $('#recordImg').attr({
        src: '/images/stop.png',
    });
}

/**
 *
 * @param {} stream
 */
function startUserMedia(stream) {
    let input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');

    recorder = new Recorder(input);
    __log('Recorder initialised.');
}

/**
 *
 * @param {*} element
 */
function stopRecording(element) {
    recorder && recorder.stop();

    __log('Stopped recording.');

    // submit audio file to JARVIS
    sendAudioToJarvis(element);

    recorder.clear();
}

/**
 *
 * @param {*} text
 * @param {*} callback
 */
function sendTextToJarvis(text, callback) {
    let data = { 'text': text };

    $.ajax({
        url: '/api/text',
        data: data,
        cache: false,
        type: 'POST',
        success: function (apiResponse) {
            if (callback) {
                callback(apiResponse);
            }
        },
    });
}

/**
 *
 * @param {*} element
 */
function sendAudioToJarvis(element) {
    recorder && recorder.exportWAV(function (blob) {
        let data = new FormData();
        data.append('command', blob);

        let e = element;

        $.ajax({
            url: '/api/command',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {
                recording = false;

                $('#recordImg').attr({
                    src: '/images/microphone.png',
                });
            },
        });
    });
}

/**
 *
 * @param {*} text
 * @param {*} lang
 */
function say(text, lang) {
    let url;
    let apiKeys = ['f716f782b498444c95b14a63fe05a917', '0c71f8bb93674f98bfc70e930d26c79b'];

    if (!lang) {
        lang = DEFAULT_LANGUAGE;
    };

    if (text.startsWith('http')) {
        url = text;
    } else {
        url = 'https://api.voicerss.org/?key=' + apiKeys[0] +'&hl=' + lang + '&r=2&src=' + encodeURIComponent(text);
    }

    let a = new Audio(url);
    a.play();
}

/**
 *
 */
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

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        startUserMedia(stream);
    });
}

/**
 *
 * @param {*} number 
 */
function fillWithZero(number) {
    if (number < 10) {
        return "0" + number;
    }

    return number;
}

/**
 *
 */
function setDateAndTime() {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var today = new Date();

    $("#day").text(today.getDate());
    $("#dayofweek").text(days[today.getDay()]);
    $("#month").text(months[today.getMonth()]);
    $("#hour").text(fillWithZero(today.getHours()) + ":" + fillWithZero(today.getMinutes()));
    $("#minutes").text(fillWithZero(today.getHours()) + ":" + fillWithZero(today.getMinutes()));
    $("#seconds").text(fillWithZero(today.getSeconds()));

    setTimeout(setDateAndTime, 1000);
}

/**
 *
 */
function getSystemResources() {

    var response;

    $.ajax({
        type: "GET",
        url: "/systemresources",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (data) { response = data; },
        failure: function (errMsg) { alert(errMsg); }
    });

    return response;
}

/**
 *
 */
function setSystemResources() {

    var response = getSystemResources();

    $("#proc").text("Processes: " + response.processes);
    $("#cpu").text("CPU Usage: " + response.cpu + "%");
    $("#mem").text("Memory: " + response.memory + "%");

    setTimeout(setSystemResources, 10000);

}
