/* eslint-disable no-invalid-this */
'use strict';

 /**
  * Setup events and connect them to the socket.io
  *
  * @param {*} jarvis
  * @param {*} io
  * @param {*} errorCallBack
  */
function setupEvents(jarvis, io, errorCallBack) {
    jarvis.on('error', function(err) {
        logger.logError(err.message);
        io.to(this.getSessionId()).emit('error',
            JSON.stringify({status: 'ERROR', text: err.message}));
        if (errorCallBack) {
            errorCallBack();
        }
    });

    jarvis.on('speaking', function(event) {
        io.to(this.getSessionId()).emit('speaking', JSON.stringify(event));
    });

    jarvis.on('waiting_for_command', function(event) {
        io.to(this.getSessionId()).emit('waiting_for_command', JSON.stringify(
            {status: 'WAITING', text: 'Waiting for command...'}));
    });

    jarvis.on('command_received', function(event) {
        io.to(this.getSessionId()).emit('command_received', JSON.stringify(
            {status: 'GOT_COMMAND', text: event}));
    });

    jarvis.on('processing_command', function(event) {
        io.to(this.getSessionId()).emit('waiting_for_command', JSON.stringify(
            {status: 'PROCESSING', text: 'Processing command...'}));
    });

    jarvis.on('understood_command', function(event) {
        io.to(this.getSessionId()).emit('understood_command',
            JSON.stringify(event));
    });
}

exports = module.exports = {setupEvents};
