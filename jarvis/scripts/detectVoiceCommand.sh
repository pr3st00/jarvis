#!/bin/bash
#
# Detects a voice command, which is defined here as an event that occurs
# after a spike on the input audio volume and 1 second of silence.
#
# Author          : Fernando H Giorgetti <fhg@br.ibm.com>
# Date            : 03/21/2017
# Version         : 1.0
#

# Sanity check
[ $# -ne 1 ] && echo -en "Invalid usage.\nUse $0 AUDIO_FILE_NAME\n" && exit 1
[ -f $1 ] && [ ! -w $1 ] && echo "Invalid audio file name (already exists and unable to overwrite)" && exit 1

rm -f $1 > /dev/null 2>&1

COMMAND_AUDIO=$1

LAST_COMMAND_AUDIO=$COMMAND_AUDIO.last.wav
COMMAND_PID=$COMMAND_AUDIO.pid
COMMAND_DELAY=600

NOISE_HI_MAX=100000
NOISE_LO_MIN=85000
MAXIMUM_SIZE=500000
MAX_RUN_TIME=10

# Epoch when noise started
NOISE_START=0
START_TIME=`date +%s`

#
# Records commands for COMMAND_DELAY seconds
# After command recorder is stopped, last NOISE_TIME seconds of 
# audio will be cropped and used as the voice command
#
function startCommandRecorder {
    #arecord -D plughw:1,0 -r 48000 -t wav --max-file-time $COMMAND_DELAY --use-strftime $COMMAND_AUDIO --process-id-file $COMMAND_PID > /dev/null 2>&1 &
    arecord -r 48000 -t wav --max-file-time $COMMAND_DELAY --use-strftime $COMMAND_AUDIO --process-id-file $COMMAND_PID > /dev/null 2>&1 & 
}

#
# Stops recording noise and commands, then crops last NOISE_TIME seconds
# of audio for the voice command given
#
function stopRecorder {

    [ ! -f $COMMAND_PID ] && echo Command PID does not exist

    #echo Stopping Command recorder
    (kill -9 `cat $COMMAND_PID`) > /dev/null 2>&1
    #rm $LAST_COMMAND_AUDIO

    NOISE_TIME=$(( `date +%s` + 1 - $NOISE_START ))
    cropAudio $COMMAND_AUDIO $COMMAND_AUDIO $NOISE_TIME

    [ -f $COMMAND_PID ] && rm $COMMAND_PID
    [ -f $COMMAND_AUDIO.$$ ] && rm $COMMAND_AUDIO.$$

}

#
# Crops the given audio file $1 as $2 using last
# $3 seconds of source audio file
#
function cropAudio {

    AUDIO=$1
    NEW_AUDIO=$2
    TIME=$3

    #echo Cropping last $TIME seconds of audio
    DURATION=`sox $AUDIO -n stat 2>&1|grep Length | awk -F[:\.] '{print $2}' | sed 's/ //g'`                                                                                                 
    # Set the position to crop
    if [ $TIME -lt $DURATION ]; then
        POSITION=$(( DURATION - TIME ))
    else
        POSITION=0
    fi

    #echo Position is $POSITION
    avconv -i $AUDIO -f wav -ss $POSITION $AUDIO.$$ 2> /dev/null >&1
    #ffmpeg -i $AUDIO -ss $POSITION $AUDIO.$$ 2> /dev/null >&1
    mv $AUDIO.$$ $NEW_AUDIO

}

#
# Detect noise
#
function detectNoise {

    NOISE_HI=`sox $COMMAND_AUDIO -n stat 2>&1 |grep 'Maximum amplitude:' | awk -F. '{print $2}'`

    # File probably not created yet
    [ -z $NOISE_HI ] && return 1;

    # Noise detected
    if [ ${NOISE_HI} -gt ${NOISE_HI_MAX} ]; then

        NOISE_START=`date +%s`
        return 0;

    fi

    return 1;

}

#
# Crops last second of audio till silence detected
#
function detectSilence {

    NOISE='/tmp/noise.wav'
    cropAudio $COMMAND_AUDIO $NOISE 1
    NOISE_LO=`sox $NOISE -n stat 2>&1 |grep 'Maximum amplitude:' | awk -F. '{print $2}'`
    rm $NOISE

    CURRENT_SIZE=`stat --printf="%s" $COMMAND_AUDIO`

    # File probably not created yet
    [ -z $NOISE_LO ] && return 1;

    # Maximum size 
    if [ $CURRENT_SIZE -gt $MAXIMUM_SIZE ]; then
	echo "Maximum size reached!"
    fi

    CURRENT_TIME=`date +%s`
    RUN_TIME=`expr $CURRENT_TIME - $START_TIME`;

    # Maximum execution size
    if [ ${RUN_TIME} -gt ${MAX_RUN_TIME} ]; then
	echo "Maximum runtime reached!"
        return 0;
    fi

    # Silence detected
    if [ ${NOISE_LO} -lt ${NOISE_LO_MIN} ]; then
        return 0;
    fi

    return 1;

}


# Deleting old audio file
rm $COMMAND_AUDIO 2> /dev/null

# Keep a process running to dectect noise
startCommandRecorder

echo -n Waiting for noise
while ! detectNoise; do
    echo -n '.'
    # Waiting for noise
done
echo
echo Noise has been detected

echo -n Waiting for silence
while ! detectSilence; do
    # Silence has been detected
    echo -n '.'
done
echo
echo Silence has been detected, cropping command audio

stopRecorder

# Noise has been detected...
echo $COMMAND_AUDIO has been recorded
